// ...existing code...
import { Inject, Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { MessageMapper } from '../mappers/message.mapper';
import { MessageEntity } from '../../domain/entities/message.entity';

@Injectable()
export class MessageKafkaProducer {
  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: Kafka, // proporciona KAFKA_CLIENT en tu módulo
  ) {}

  async publish(topic: string, message: MessageEntity): Promise<void> {
    const publishedMessage = MessageMapper.toDto(message)
    const producer = this.kafkaClient.producer();
    await producer.connect();
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(publishedMessage) }],
    });
    await producer.disconnect();
  }
}