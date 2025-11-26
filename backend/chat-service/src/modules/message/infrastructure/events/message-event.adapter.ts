import { MessageEntity } from "../../domain/entities/message.entity";

export const MESSAGE_EVENT_ADAPTER = Symbol('MESSAGE_EVENT_ADAPTER');

export interface MessageEventAdapter{
    publishProcessedMessage(message: MessageEntity): Promise<void>;
}