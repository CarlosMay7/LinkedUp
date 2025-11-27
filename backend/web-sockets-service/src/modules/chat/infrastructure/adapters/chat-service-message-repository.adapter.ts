import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IMessageRepository } from '../../domain/interfaces/message-repository.interface';
import { MessageEntity } from '../../domain/entities/message.entity';

@Injectable()
export class ChatServiceMessageRepository implements IMessageRepository {
  private readonly logger = new Logger(ChatServiceMessageRepository.name);
  private readonly chatServiceUrl =
    process.env.CHAT_SERVICE_URL || 'http://localhost:3001';

  constructor(private readonly httpService: HttpService) {}

  async persistMessage(message: MessageEntity): Promise<MessageEntity> {
    try {
      const payload: any = {
        roomId: message.roomId,
        senderId: message.senderId,
        content: message.content,
      };
      
      // Only include receiverId if it's defined (for private messages)
      if (message.receiverId) {
        payload.receiverId = message.receiverId;
      }

      const response = await firstValueFrom(
        this.httpService.post(`${this.chatServiceUrl}/messages`, payload),
      );

      const persistedData = response.data;
      const messageId = persistedData._id || persistedData.id;

      // Return MessageEntity with the MongoDB _id
      return new MessageEntity(
        persistedData.senderId,
        persistedData.content,
        persistedData.roomId,
        persistedData.receiverId,
        new Date(persistedData.sentAt),
        messageId,
      );
    } catch (error) {
      this.logger.error(`Failed to persist message: ${error.message}`);
      throw new Error('Failed to persist message in chat-service');
    }
  }

  async validateRoom(roomId: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get(`${this.chatServiceUrl}/room/${roomId}`),
      );
      return true;
    } catch (error) {
      this.logger.warn(`Room ${roomId} validation failed: ${error.message}`);
      return false;
    }
  }

  async validateUser(userId: string): Promise<boolean> {
    // TODO: Implement user validation when auth-service is ready
    return true;
  }

  async getMessagesByRoom(roomId: string): Promise<MessageEntity[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.chatServiceUrl}/messages/room/${roomId}`),
      );

      const messages = response.data;

      // Map the MongoDB messages to MessageEntity and sort by sentAt ascending (oldest first)
      const messageEntities = messages.map((msg: any) => 
        new MessageEntity(
          msg.senderId,
          msg.content,
          msg.roomId,
          msg.receiverId,
          new Date(msg.sentAt),
          msg.id || msg._id,
        )
      );

      // Sort by sentAt ascending (oldest first)
      return messageEntities.sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
    } catch (error) {
      this.logger.warn(`Failed to fetch messages for room ${roomId}: ${error.message}`);
      // Return empty array if no messages found or error occurs
      return [];
    }
  }
}
