import { MessageEventPublisher } from "../../domain/interfaces/message.event.publisher";
import { MessageKafkaProducer } from "./message.kafka.producer";
import { MessageEntity } from "../../domain/entities/message.entity";

export class MessageKafkaAdapter implements MessageEventPublisher {
  constructor(private producer: MessageKafkaProducer) {}

  async publishProcessedMessage(message: MessageEntity): Promise<void> {
    await this.producer.publish('message.processed', message);
  }
}
