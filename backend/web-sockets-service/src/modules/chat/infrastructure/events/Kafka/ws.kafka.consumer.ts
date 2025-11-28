import {
  Inject,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';
import { WsMessageEventService } from '../message-event.service';
import { MessageProcessedPayload } from '../../../domain/interfaces/kafka-payloads.interface';

@Injectable()
export class WsKafkaConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WsKafkaConsumer.name);
  private consumer: Consumer;

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: Kafka,
    private readonly wsMessageEventService: WsMessageEventService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.consumer = this.kafkaClient.consumer({
      groupId: 'ws-service-consumer',
    });
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'message.processed',
      fromBeginning: false,
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const value = message.value?.toString();
          if (!value) return;
          const payload = JSON.parse(value) as MessageProcessedPayload;
          await this.wsMessageEventService.handleProcessedMessage(payload);
        } catch (err) {
          this.logger.error('Error processing Kafka message', err as any);
        }
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.consumer) await this.consumer.disconnect();
  }
}
