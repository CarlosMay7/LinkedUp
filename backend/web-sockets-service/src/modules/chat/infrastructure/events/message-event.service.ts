import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  MESSAGE_BROKER,
  IMessageBroker,
} from '../interfaces/message-broker.interface';
import {
  MessageProcessedPayload,
} from '../interfaces/event-consumer.interface';

@Injectable()
export class WsMessageEventService {
  private readonly logger = new Logger(WsMessageEventService.name);

  constructor(
    @Inject(MESSAGE_BROKER) private readonly messageBroker: IMessageBroker,
  ) {}

  async onMessageProcessed(event: MessageProcessedPayload): Promise<void> {
    try {
      this.validatePayload(event);

      const messagePayload = this.buildMessagePayload(event);

      if (event.roomId) {
        this.messageBroker.sendToRoom(event.roomId, messagePayload);
      } else if (event.receiverId) {
        this.messageBroker.sendToUser(event.receiverId, messagePayload);
      } else {
        this.logger.warn(
          'Processed message without roomId or receiverId',
          event.id,
        );
      }

      this.logger.debug(`Event processed: ${event.id}`);
    } catch (error) {
      this.logger.error(`Error processing message event: ${error.message}`);
      throw error;
    }
  }

  private validatePayload(event: MessageProcessedPayload): void {
    if (!event.id || !event.senderId || !event.content) {
      throw new Error(
        'Invalid message payload: missing required fields',
      );
    }
  }

  private buildMessagePayload(event: MessageProcessedPayload): any {
    const sentAt =
      typeof event.sentAt === 'string' ? new Date(event.sentAt) : event.sentAt;

    return {
      _id: event.id,
      senderId: event.senderId,
      content: event.content,
      roomId: event.roomId,
      receiverId: event.receiverId,
      sentAt,
    };
  }
}
