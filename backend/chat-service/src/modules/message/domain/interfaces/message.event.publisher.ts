import { MessageEntity } from "../entities/message.entity";

export interface MessageEventPublisher {
  publishProcessedMessage(message: MessageEntity): Promise<void>;
}