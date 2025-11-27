import { Inject, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { MessageResponseDto } from '../../controllers/dto/message-response.dto';

@Injectable()
export class MessageKafkaProducer implements OnModuleInit, OnModuleDestroy {
  private producer;

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: Kafka, // proporciona KAFKA_CLIENT en tu módulo
  ) {}

  async onModuleInit() {
    this.producer = this.kafkaClient.producer();
    await this.producer.connect();
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  async publish(topic: string, message: MessageResponseDto): Promise<void> {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }
}
