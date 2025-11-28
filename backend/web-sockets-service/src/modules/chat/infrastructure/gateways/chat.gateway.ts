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
import { Logger } from '@nestjs/common';
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
import { SocketIOMessageBroker } from '../adapters/socketio-message-broker.adapter';
import { WsKafkaProducer } from '../events/Kafka/ws.kafka.producer';

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
    private readonly kafkaProducer: WsKafkaProducer,
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
      // Publicar el mensaje en Kafka para que chat-service lo valide y persista
      await this.kafkaProducer.publishMessageCreated({
        senderId: data.senderId,
        content: data.content,
        roomId: data.roomId,
        receiverId: data.receiverId,
        timestamp: Date.now(),
      });

      // Ack inmediato al cliente; el mensaje final llegará vía 'newMessage' cuando Kafka procese
      const ack = {
        status: 'queued',
        tempId: undefined,
        roomId: data.roomId,
        receiverId: data.receiverId,
      };
      client.emit('messageQueued', ack);
      return { event: 'messageQueued', data: ack };
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`);
      client.emit('messageError', {
        error: error.message,
        timestamp: new Date(),
      });
      return { event: 'messageError', data: { error: error.message } };
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
    const senderId = this.getSenderIdFromMessage(data.messageId);
    if (senderId) {
      this.messageStatusService.notifyMessageDelivered(
        data.messageId,
        senderId,
        data.userId,
      );
    }
  }

  @SubscribeMessage('messageRead')
  handleMessageRead(@MessageBody() data: MessageReadDto) {
    const senderId = this.getSenderIdFromMessage(data.messageId);
    if (senderId) {
      this.messageStatusService.notifyMessageRead(
        data.messageId,
        senderId,
        data.userId,
      );
    }
  }

  @SubscribeMessage('getOnlineUsers')
  handleGetOnlineUsers(@MessageBody() data: GetOnlineUsersDto) {
    const onlineUsers = this.getOnlineUsersInRoom(data.roomId);
    return { event: 'onlineUsers', data: onlineUsers };
  }

  // TODO: Implement getSenderIdFromMessage to retrieve sender from message store
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private getSenderIdFromMessage(_messageId: string): string | null {
    // This should query a message repository or cache
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
