import { Injectable, OnModuleInit, OnModuleDestroy, Inject, Logger } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { MessageEventService } from './message-event.service';
import { KafkaMessagePayload } from './data/kafka.message.payload';

@Injectable()
export class MessageKafkaConsumer implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer;
  private readonly logger = new Logger(MessageKafkaConsumer.name);

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: Kafka,
    private readonly messageEventService: MessageEventService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.consumer = this.kafkaClient.consumer({ groupId: 'chat-service-consumer' });
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'message.created', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const value = message.value?.toString();
          if (!value) return;
          const payload = JSON.parse(value) as KafkaMessagePayload;
          await this.messageEventService.handleIncomingKafkaEvent(payload);
        } catch (err) {
          this.logger.error('Error processing Kafka message', err as any);
        }
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.consumer) {
      await this.consumer.disconnect();
    }
  }
}