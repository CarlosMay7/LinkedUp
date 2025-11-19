import { MessageEntity } from '../entities/message.entity';

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');

export interface IMessageRepository {
  create(message: MessageEntity): Promise<MessageEntity>;
  findAll(): Promise<MessageEntity[]>;
  findById(id: string): Promise<MessageEntity | undefined>;
  findByUsers(senderId?: string, receiverId?: string): Promise<MessageEntity[]>;
  findConversation(userId1: string, userId2: string): Promise<MessageEntity[]>;
  findByRoom(roomId: string): Promise<MessageEntity[]>;
  save(message: MessageEntity): Promise<MessageEntity>;
  delete(id: string): Promise<MessageEntity>;
  deleteByRoom(
    roomId: string,
  ): Promise<{ deletedCount: number; message: string }>;
}
