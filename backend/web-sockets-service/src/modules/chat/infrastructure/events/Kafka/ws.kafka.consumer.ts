import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';
import { WsMessageEventService } from '../message-event.service';
import {
  MessageProcessedPayload,
  IEventConsumer,
} from '../../interfaces/event-consumer.interface';

@Injectable()
export class WsKafkaConsumer implements IEventConsumer, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WsKafkaConsumer.name);
  private consumer: Consumer;

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: Kafka,
    private readonly wsMessageEventService: WsMessageEventService,
  ) {}

  async onMessageProcessed(payload: MessageProcessedPayload): Promise<void> {
    await this.wsMessageEventService.onMessageProcessed(payload);
  }

  async onModuleInit(): Promise<void> {
    try {
      this.consumer = this.kafkaClient.consumer({
        groupId: 'ws-service-consumer',
      });
      await this.consumer.connect();
      this.logger.log('Kafka consumer connected');

      await this.consumer.subscribe({
        topic: 'message.processed',
        fromBeginning: false,
      });
      this.logger.log('Subscribed to message.processed topic');

      await this.consumer.run({
        eachMessage: async ({ message }) => {
          await this.processMessage(message);
        },
      });
    } catch (error) {
      this.logger.error('Failed to initialize Kafka consumer', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.logger.log('Kafka consumer disconnected');
    }
  }

  private async processMessage(
    message: any,
  ): Promise<void> {
    try {
      const value = message.value?.toString();
      if (!value) {
        this.logger.warn('Empty message received from Kafka');
        return;
      }

      const payload = JSON.parse(value) as MessageProcessedPayload;
      await this.onMessageProcessed(payload);
      this.logger.debug(`Message processed: ${payload.id}`);
    } catch (error) {
      this.logger.error(
        `Error processing Kafka message: ${error.message}`,
        error,
      );
    }
  }
}
