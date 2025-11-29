import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IMessageBroker,
  MESSAGE_BROKER,
} from '../../domain/interfaces/message-broker.interface';

@Injectable()
export class TypingService {
  private readonly logger = new Logger(TypingService.name);

  constructor(
    @Inject(MESSAGE_BROKER)
    private readonly messageBroker: IMessageBroker,
  ) {}

  notifyTyping(userId: string, roomId?: string, receiverId?: string): void {
    if (roomId) {
      this.notifyRoomTyping(userId, roomId);
    } else if (receiverId) {
      this.notifyUserTyping(userId, receiverId);
    }
  }

  private notifyRoomTyping(userId: string, roomId: string): void {
    this.logger.log(`User ${userId} is typing in room ${roomId}`);
    this.messageBroker.broadcastToRoom(roomId, 'typing', {
      userId,
      roomId,
      timestamp: new Date(),
    });
  }

  private notifyUserTyping(userId: string, receiverId: string): void {
    this.logger.log(`User ${userId} is typing to user ${receiverId}`);
    this.messageBroker.notifyUser(receiverId, 'typing', {
      userId,
      receiverId,
      timestamp: new Date(),
    });
  }
}
