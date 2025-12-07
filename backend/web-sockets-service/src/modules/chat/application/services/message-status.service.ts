import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IMessageBroker,
  MESSAGE_BROKER,
} from '../../domain/interfaces/message-broker.interface';

@Injectable()
export class MessageStatusService {
  private readonly logger = new Logger(MessageStatusService.name);

  constructor(
    @Inject(MESSAGE_BROKER)
    private readonly messageBroker: IMessageBroker,
  ) {}

  notifyMessageDelivered(
    messageId: string,
    senderId: string,
    receiverId?: string,
    roomId?: string,
  ): void {
    try {
      if (!messageId || !senderId) {
        this.logger.warn('Cannot notify delivery: missing messageId or senderId');
        return;
      }

      const payload = {
        messageId,
        deliveredAt: new Date(),
      };

      if (receiverId) {
        this.notifyPrivateMessageDelivered(senderId, payload);
      } else if (roomId) {
        this.notifyRoomMessageDelivered(roomId, payload);
      } else {
        this.logger.warn(
          `Delivery notification without receiverId or roomId for message ${messageId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error notifying delivery: ${error.message}`);
    }
  }

  notifyMessageRead(
    messageId: string,
    senderId: string,
    receiverId?: string,
    roomId?: string,
  ): void {
    try {
      if (!messageId || !senderId) {
        this.logger.warn('Cannot notify read: missing messageId or senderId');
        return;
      }

      const payload = {
        messageId,
        readAt: new Date(),
      };

      if (receiverId) {
        this.notifyPrivateMessageRead(senderId, payload);
      } else if (roomId) {
        this.notifyRoomMessageRead(roomId, payload);
      } else {
        this.logger.warn(
          `Read notification without receiverId or roomId for message ${messageId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error notifying read: ${error.message}`);
    }
  }

  private notifyPrivateMessageDelivered(senderId: string, payload: any): void {
    this.logger.debug(
      `Message ${payload.messageId} delivered to sender ${senderId}`,
    );
    this.messageBroker.notifyUser(senderId, 'message:delivered', payload);
  }

  private notifyRoomMessageDelivered(roomId: string, payload: any): void {
    this.logger.debug(
      `Message ${payload.messageId} delivered in room ${roomId}`,
    );
    this.messageBroker.broadcastToRoom(roomId, 'message:delivered', payload);
  }

  private notifyPrivateMessageRead(senderId: string, payload: any): void {
    this.logger.debug(`Message ${payload.messageId} read by sender ${senderId}`);
    this.messageBroker.notifyUser(senderId, 'message:read', payload);
  }

  private notifyRoomMessageRead(roomId: string, payload: any): void {
    this.logger.debug(`Message ${payload.messageId} read in room ${roomId}`);
    this.messageBroker.broadcastToRoom(roomId, 'message:read', payload);
  }
}
