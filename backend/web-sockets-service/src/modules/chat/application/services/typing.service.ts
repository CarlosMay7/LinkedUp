import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IMessageBroker,
  MESSAGE_BROKER,
} from '../../infrastructure/interfaces/message-broker.interface';

@Injectable()
export class TypingService {
  private readonly logger = new Logger(TypingService.name);

  constructor(
    @Inject(MESSAGE_BROKER)
    private readonly messageBroker: IMessageBroker,
  ) {}

  notifyTyping(userId: string, roomId?: string, receiverId?: string): void {
    try {
      if (!userId) {
        this.logger.warn('Cannot notify typing: missing userId');
        return;
      }

      if (roomId) {
        this.notifyRoomTyping(userId, roomId);
      } else if (receiverId) {
        this.notifyUserTyping(userId, receiverId);
      } else {
        this.logger.warn(
          `Typing notification without roomId or receiverId for user ${userId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Error notifying typing: ${error.message}`);
    }
  }

  private notifyRoomTyping(userId: string, roomId: string): void {
    this.logger.debug(`User ${userId} is typing in room ${roomId}`);
    this.messageBroker.broadcastToRoom(roomId, 'typing', {
      userId,
      roomId,
      timestamp: new Date(),
    });
  }

  private notifyUserTyping(userId: string, receiverId: string): void {
    this.logger.debug(`User ${userId} is typing to user ${receiverId}`);
    this.messageBroker.notifyUser(receiverId, 'typing', {
      userId,
      receiverId,
      timestamp: new Date(),
    });
  }
}
