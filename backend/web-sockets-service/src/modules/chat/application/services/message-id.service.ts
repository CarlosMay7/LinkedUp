import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MessageIdService {
  private readonly logger = new Logger(MessageIdService.name);
  private messageIdMap: Map<string, string> = new Map();

  registerMessage(messageId: string, senderId: string): void {
    try {
      if (!messageId || !senderId) {
        this.logger.warn(
          'Cannot register message: missing messageId or senderId',
        );
        return;
      }
      this.messageIdMap.set(messageId, senderId);
      this.logger.debug(`Message ${messageId} registered from ${senderId}`);
    } catch (error) {
      this.logger.error(`Error registering message: ${error.message}`);
    }
  }

  getSenderIdByMessageId(messageId: string): string | null {
    try {
      if (!messageId) {
        this.logger.warn('Cannot get sender: missing messageId');
        return null;
      }
      const senderId = this.messageIdMap.get(messageId);
      if (!senderId) {
        this.logger.debug(`No sender found for message ${messageId}`);
        return null;
      }
      return senderId;
    } catch (error) {
      this.logger.error(
        `Error getting sender for message ${messageId}: ${error.message}`,
      );
      return null;
    }
  }

  unregisterMessage(messageId: string): void {
    try {
      if (!messageId) return;
      this.messageIdMap.delete(messageId);
      this.logger.debug(`Message ${messageId} unregistered`);
    } catch (error) {
      this.logger.error(`Error unregistering message: ${error.message}`);
    }
  }
}
