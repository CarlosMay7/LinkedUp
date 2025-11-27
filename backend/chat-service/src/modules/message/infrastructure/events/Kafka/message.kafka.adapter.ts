import { MessageKafkaProducer } from "./message.kafka.producer";
import { MessageEntity } from "../../../domain/entities/message.entity";
import { MessageMapper } from "../../mappers/message.mapper";
import { MessageEventAdapter } from "../message-event.adapter";
import { Inject } from "@nestjs/common";

export class MessageKafkaAdapter implements MessageEventAdapter {

  constructor(
    @Inject(MessageKafkaProducer)
    private producer: MessageKafkaProducer
  ) {}

  async publishProcessedMessage(message: MessageEntity): Promise<void> {
    const publishedMessage = MessageMapper.toDto(message)
    await this.producer.publish('message.processed', publishedMessage);
  }
}
