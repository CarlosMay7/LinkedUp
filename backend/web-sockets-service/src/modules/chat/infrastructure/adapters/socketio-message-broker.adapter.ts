import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { IMessageBroker } from '../../domain/interfaces/message-broker.interface';
import { MessageEntity } from '../../domain/entities/message.entity';

@Injectable()
export class SocketIOMessageBroker implements IMessageBroker {
  private readonly logger = new Logger(SocketIOMessageBroker.name);
  private server: Server;

  setServer(server: Server): void {
    this.server = server;
    this.logger.log('Socket.IO server configured');
  }

  sendToRoom(roomId: string, message: MessageEntity): void {
    if (!this.server) {
      this.logger.error('Socket.IO server not configured');
      return;
    }

    this.server.to(roomId).emit('newMessage', {
      _id: message._id,
      senderId: message.senderId,
      roomId: message.roomId,
      content: message.content,
      sentAt: message.sentAt,
    });

    this.logger.log(`Message sent to room: ${roomId}`);
  }

  sendToUser(userId: string, message: MessageEntity): void {
    if (!this.server) {
      this.logger.error('Socket.IO server not configured');
      return;
    }

    this.server.to(userId).emit('newMessage', {
      _id: message._id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      sentAt: message.sentAt,
    });

    this.logger.log(`Private message sent to user: ${userId}`);
  }

  broadcastToRoom(roomId: string, event: string, data: any): void {
    if (!this.server) {
      this.logger.error('Socket.IO server not configured');
      return;
    }

    this.server.to(roomId).emit(event, data);
    this.logger.log(`Broadcast event '${event}' to room: ${roomId}`);
  }

  notifyUser(userId: string, event: string, data: any): void {
    if (!this.server) {
      this.logger.error('Socket.IO server not configured');
      return;
    }

    this.server.to(userId).emit(event, data);
    this.logger.log(`Notify event '${event}' to user: ${userId}`);
  }
}
