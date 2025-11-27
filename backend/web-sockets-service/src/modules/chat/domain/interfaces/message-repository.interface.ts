import { MessageEntity } from '../entities/message.entity';

export interface IMessageRepository {
  persistMessage(message: MessageEntity): Promise<MessageEntity>;
  validateRoom(roomId: string): Promise<boolean>;
  validateUser(userId: string): Promise<boolean>;
  getMessagesByRoom(roomId: string): Promise<MessageEntity[]>;
}

export const MESSAGE_REPOSITORY = Symbol('MESSAGE_REPOSITORY');
