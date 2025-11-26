// ...existing code...
import { Inject, Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { MessageResponseDto } from '../../controllers/dto/message-response.dto';

@Injectable()
export class MessageKafkaProducer {
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: Kafka, // proporciona KAFKA_CLIENT en tu módulo
  ) {}

  async publish(topic: string, message: MessageResponseDto): Promise<void> {
    const producer = this.kafkaClient.producer();
    await producer.connect();
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
    await producer.disconnect();
  }
}