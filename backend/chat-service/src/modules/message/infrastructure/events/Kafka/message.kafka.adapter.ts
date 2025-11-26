import { MessageKafkaProducer } from "./message.kafka.producer";
import { MessageEntity } from "../../../domain/entities/message.entity";
import { MessageMapper } from "../../mappers/message.mapper";
import { MessageEventAdapter } from "../message-event.adapter";

export class MessageKafkaAdapter implements MessageEventAdapter {

  constructor(private producer: MessageKafkaProducer) {}

  async publishProcessedMessage(message: MessageEntity): Promise<void> {
    const publishedMessage = MessageMapper.toDto(message)
    await this.producer.publish('message.processed', publishedMessage);
  }
}
