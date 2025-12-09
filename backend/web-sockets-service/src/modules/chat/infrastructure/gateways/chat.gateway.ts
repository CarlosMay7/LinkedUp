import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, Logger } from '@nestjs/common';
import {
  SendMessageDto,
  JoinRoomDto,
  TypingDto,
  RegisterDto,
  MessageDeliveredDto,
  MessageReadDto,
  GetOnlineUsersDto,
} from '../dto/chat.dto';
import { SessionService } from '../../application/services/session.service';
import { TypingService } from '../../application/services/typing.service';
import { MessageStatusService } from '../../application/services/message-status.service';
import { MessageIdService } from '../../application/services/message-id.service';
import { OnlineUsersService } from '../../application/services/online-users.service';
import { SocketIOMessageBroker } from '../adapters/socketio-message-broker.adapter';
import {
  IEventProducer,
  EVENT_PRODUCER,
} from '../interfaces/event-producer.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly sessionService: SessionService,
    private readonly typingService: TypingService,
    private readonly messageStatusService: MessageStatusService,
    private readonly messageBroker: SocketIOMessageBroker,
    private readonly messageIdService: MessageIdService,
    private readonly onlineUsersService: OnlineUsersService,
    @Inject(EVENT_PRODUCER) private readonly eventProducer: IEventProducer,
  ) {}

  afterInit(server: Server) {
    const socketServer = server || this.server;
    this.messageBroker.setServer(socketServer);
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.sessionService.unregisterUser(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: RegisterDto,
    @ConnectedSocket() client: Socket,
  ) {
    this.sessionService.registerUser(data.userId, client.id);
    client.join(data.userId);
    return { event: 'registered', data: { userId: data.userId } };
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);
    this.logger.log(`User ${data.userId} joined room ${data.roomId}`);

    // Notify others in the room that someone joined
    client.to(data.roomId).emit('userJoined', {
      roomId: data.roomId,
      userId: data.userId,
      timestamp: new Date(),
    });

    // Send updated online users list to all users in the room
    const onlineUsers = this.getOnlineUsersInRoom(data.roomId);
    this.server.to(data.roomId).emit('onlineUsers', onlineUsers);

    return {
      event: 'joinedRoom',
      data: { roomId: data.roomId, userId: data.userId },
    };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(data.roomId);
    this.logger.log(`User ${data.userId} left room ${data.roomId}`);

    client.to(data.roomId).emit('userLeft', {
      roomId: data.roomId,
      userId: data.userId,
      timestamp: new Date(),
    });

    // Send updated online users list to all users remaining in the room
    const onlineUsers = this.getOnlineUsersInRoom(data.roomId);
    this.server.to(data.roomId).emit('onlineUsers', onlineUsers);

    return {
      event: 'leftRoom',
      data: { roomId: data.roomId, userId: data.userId },
    };
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Generate a messageId that will travel with the Kafka payload so
      // downstream services (and processed events) keep the same id.
      const messageId = `msg-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 11)}`;

      await this.eventProducer.publishMessageCreated({
        id: messageId,
        senderId: data.senderId,
        content: data.content,
        roomId: data.roomId,
        receiverId: data.receiverId,
        timestamp: Date.now(),
      });

      // Register message ID for tracking delivery/read status
      this.messageIdService.registerMessage(messageId, data.senderId);

      const ack = {
        status: 'queued',
        tempId: messageId,
        roomId: data.roomId,
        receiverId: data.receiverId,
      };
      client.emit('messageQueued', ack);
      return { event: 'messageQueued', data: ack };
    } catch (error) {
      this.logger.error(
        `Failed to send message from ${data.senderId}: ${error.message}`,
        error.stack,
      );
      const errorMessage = 'Failed to publish message';
      client.emit('messageError', {
        error: errorMessage,
        timestamp: new Date(),
      });
      return { event: 'messageError', data: { error: errorMessage } };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: TypingDto) {
    if (data.isTyping) {
      this.typingService.notifyTyping(
        data.userId,
        data.roomId,
        data.receiverId,
      );
    }
  }

  @SubscribeMessage('messageDelivered')
  handleMessageDelivered(@MessageBody() data: MessageDeliveredDto) {
    try {
      const senderId = this.messageIdService.getSenderIdByMessageId(
        data.messageId,
      );
      if (senderId) {
        this.messageStatusService.notifyMessageDelivered(
          data.messageId,
          senderId,
          data.userId,
        );
        this.messageIdService.unregisterMessage(data.messageId);
      } else {
        this.logger.warn(`No sender found for message ${data.messageId}`);
      }
    } catch (error) {
      this.logger.error(
        `Error handling message delivered for ${data.messageId}: ${error.message}`,
        error.stack,
      );
    }
  }

  @SubscribeMessage('messageRead')
  handleMessageRead(@MessageBody() data: MessageReadDto) {
    try {
      const senderId = this.messageIdService.getSenderIdByMessageId(
        data.messageId,
      );
      if (senderId) {
        this.messageStatusService.notifyMessageRead(
          data.messageId,
          senderId,
          data.userId,
        );
        this.messageIdService.unregisterMessage(data.messageId);
      } else {
        this.logger.warn(`No sender found for message ${data.messageId}`);
      }
    } catch (error) {
      this.logger.error(
        `Error handling message read for ${data.messageId}: ${error.message}`,
        error.stack,
      );
    }
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(
    @MessageBody() data: GetOnlineUsersDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const sockets = this.server.sockets.adapter.rooms.get(data.roomId);
      const onlineUsers = this.onlineUsersService.getOnlineUsersInRoom(
        data.roomId,
        sockets,
      );
      client.emit('onlineUsers', onlineUsers);
      this.logger.log(
        `Sent ${onlineUsers.length} online users for room ${data.roomId} to client ${client.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error getting online users for room ${data.roomId}: ${error.message}`,
        error.stack,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getSenderIdFromMessage(_messageId: string): string | null {
    return null;
  }

  private getOnlineUsersInRoom(roomId: string): string[] {
    const sockets = this.server.sockets.adapter.rooms.get(roomId);
    if (!sockets) return [];

    const onlineUsers: string[] = [];
    sockets.forEach((socketId) => {
      const userId = this.sessionService.getUserIdBySocketId(socketId);
      if (userId) {
        onlineUsers.push(userId);
      }
    });

    return onlineUsers;
  }
}
