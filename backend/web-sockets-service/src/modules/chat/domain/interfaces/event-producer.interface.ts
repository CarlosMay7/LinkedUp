import { MessageCreatedPayload } from '../../infrastructure/events/Kafka/interfaces/kafka-payloads.interface';

export interface IEventProducer {
  publishMessageCreated(payload: MessageCreatedPayload): Promise<void>;
}

export const EVENT_PRODUCER = Symbol('EVENT_PRODUCER');
