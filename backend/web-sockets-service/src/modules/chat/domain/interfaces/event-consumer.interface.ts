import { MessageProcessedPayload } from '../../infrastructure/events/Kafka/interfaces/kafka-payloads.interface';

export interface IEventConsumer {
  onMessageProcessed(payload: MessageProcessedPayload): Promise<void>;
}

export const EVENT_CONSUMER = Symbol('EVENT_CONSUMER');
