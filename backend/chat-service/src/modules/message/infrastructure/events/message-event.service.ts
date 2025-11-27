import { Inject, Injectable } from '@nestjs/common';
import { CreateMessageUseCase } from '../../domain/use-cases/create-message.use-case';
import { MessagePayload } from './data/message.payload';
import {
  MESSAGE_EVENT_ADAPTER,
  MessageEventAdapter,
} from './message-event.adapter';

@Injectable()
export class MessageEventService {
  constructor(
    private readonly createMessageUseCase: CreateMessageUseCase,
    @Inject(MESSAGE_EVENT_ADAPTER)
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
