import { Injectable } from '@nestjs/common';
import { CreateMessageUseCase } from '../../domain/use-cases/create-message.use-case';
import { MessageEventPublisher } from '../../domain/interfaces/message.event.publisher';
import { KafkaMessagePayload } from './data/kafka.message.payload';


@Injectable()
export class MessageEventService {

  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly publisher: MessageEventPublisher,
  ) {}

  async handleIncomingKafkaEvent(event: KafkaMessagePayload) {
    const created = await this.createMessageUseCase.execute({
      content: event.content,    
      senderId: event.senderId,
      roomId: event.roomId,
      receiverId: event.receiverId,
    });

    await this.publisher.publishProcessedMessage(created);
  }
}