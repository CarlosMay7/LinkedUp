import { Injectable } from '@nestjs/common';
import { CreateMessageUseCase } from '../../domain/use-cases/create-message.use-case';
import { MessagePayload } from './data/message.payload';
import { MessageEventAdapter } from './message-event.adapter';


@Injectable()
export class MessageEventService {

  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    private readonly publisher: MessageEventAdapter,
  ) {}

  async handleIncomingEvent(event: MessagePayload) {
    const created = await this.createMessageUseCase.execute({
      content: event.content,    
      senderId: event.senderId,
      roomId: event.roomId,
      receiverId: event.receiverId,
    });

    await this.publisher.publishProcessedMessage(created);
  }
}