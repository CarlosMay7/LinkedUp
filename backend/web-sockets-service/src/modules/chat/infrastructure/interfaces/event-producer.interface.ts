// Kafka payloads
export interface MessageCreatedPayload {
  id: string;
  senderId: string;
  content: string;
  roomId?: string;
  receiverId?: string;
  timestamp?: string | number;
  metadata?: Record<string, any>;
}

export interface IEventProducer {
  publishMessageCreated(payload: MessageCreatedPayload): Promise<void>;
}

export const EVENT_PRODUCER = Symbol('EVENT_PRODUCER');
