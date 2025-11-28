import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { MessageCreatedPayload } from '../../../domain/interfaces/kafka-payloads.interface';

@Injectable()
export class WsKafkaProducer implements OnModuleInit, OnModuleDestroy {
  private producer: Producer;

  constructor(@Inject('KAFKA_CLIENT') private readonly kafkaClient: Kafka) {}

  async onModuleInit() {
    this.producer = this.kafkaClient.producer();
    await this.producer.connect();
  }

  async onModuleDestroy() {
    if (this.producer) await this.producer.disconnect();
  }

  async publishMessageCreated(payload: MessageCreatedPayload): Promise<void> {
    await this.producer.send({
      topic: 'message.created',
      messages: [{ value: JSON.stringify(payload) }],
    });
  }
}
