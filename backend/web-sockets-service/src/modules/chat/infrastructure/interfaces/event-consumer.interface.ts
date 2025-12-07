// Kafka payloads
export interface MessageProcessedPayload {
  id: string;
  roomId?: string;
  senderId: string;
  receiverId?: string;
  content: string;
  sentAt: string | Date;
}

export interface IEventConsumer {
  onMessageProcessed(payload: MessageProcessedPayload): Promise<void>;
}

export const EVENT_CONSUMER = Symbol('EVENT_CONSUMER');
