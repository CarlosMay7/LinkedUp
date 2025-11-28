import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  MESSAGE_BROKER,
  IMessageBroker,
} from '../../domain/interfaces/message-broker.interface';
import { MessageProcessedPayload } from '../../domain/interfaces/kafka-payloads.interface';

@Injectable()
export class WsMessageEventService {
  private readonly logger = new Logger(WsMessageEventService.name);

  constructor(
    @Inject(MESSAGE_BROKER) private readonly messageBroker: IMessageBroker,
  ) {}

  async handleProcessedMessage(event: MessageProcessedPayload): Promise<void> {
    const sentAt =
      typeof event.sentAt === 'string' ? new Date(event.sentAt) : event.sentAt;

    // Construir el payload simple para Socket.IO (sin entidad completa)
    const messagePayload = {
      _id: event.id,
      senderId: event.senderId,
      content: event.content,
      roomId: event.roomId,
      receiverId: event.receiverId,
      sentAt,
    };

    // Emitir según el tipo de mensaje (room o privado)
    if (event.roomId) {
      this.messageBroker.sendToRoom(event.roomId, messagePayload);
    } else if (event.receiverId) {
      this.messageBroker.sendToUser(event.receiverId, messagePayload);
    } else {
      this.logger.warn('Processed message without roomId or receiverId');
    }
  }
}
