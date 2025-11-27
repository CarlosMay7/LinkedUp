import { MessageEntity } from '../entities/message.entity';

export interface IMessageBroker {
  sendToRoom(roomId: string, message: MessageEntity): void;
  sendToUser(userId: string, message: MessageEntity): void;
  broadcastToRoom(roomId: string, event: string, data: any): void;
  notifyUser(userId: string, event: string, data: any): void;
}

export const MESSAGE_BROKER = Symbol('MESSAGE_BROKER');
