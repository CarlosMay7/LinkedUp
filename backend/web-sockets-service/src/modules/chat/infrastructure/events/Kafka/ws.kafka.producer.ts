import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import {
  MessageCreatedPayload,
  IEventProducer,
  EVENT_PRODUCER,
} from '../../interfaces/event-producer.interface';

@Injectable()
export class WsKafkaProducer implements IEventProducer, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WsKafkaProducer.name);
  private producer: Producer;

  constructor(@Inject('KAFKA_CLIENT') private readonly kafkaClient: Kafka) {}

  async onModuleInit(): Promise<void> {
    try {
      this.producer = this.kafkaClient.producer();
      await this.producer.connect();
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.error('Failed to initialize Kafka producer', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.producer) {
      await this.producer.disconnect();
      this.logger.log('Kafka producer disconnected');
    }
  }

  async publishMessageCreated(payload: MessageCreatedPayload): Promise<void> {
    if (!this.producer) {
      throw new Error('Kafka producer not initialized');
    }

    try {
      await this.producer.send({
        topic: 'message.created',
        messages: [{ value: JSON.stringify(payload) }],
      });
      this.logger.debug(`Message published to Kafka: ${payload.senderId}`);
    } catch (error) {
      this.logger.error(
        `Failed to publish message to Kafka: ${error.message}`,
      );
      throw error;
    }
  }
}
