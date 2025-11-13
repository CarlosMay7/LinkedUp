import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { ValidationService } from '../common/validation.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private validationService: ValidationService,
  ) {}

  /**
   * Create a new message
   */
  async create(createMessageDto: CreateMessageDto): Promise<MessageDocument> {
    try {
      const newMessage = new this.messageModel(createMessageDto);
      return await newMessage.save();
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to create message',
      );
    }
  }

  /**
   * Get all messages (without filters)
   */
  async findAll(): Promise<MessageDocument[]> {
    try {
      return await this.executeQuery({});
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to retrieve messages',
      );
    }
  }

  /**
   * Get messages filtered by sender and/or receiver
   */
  async findByUsers(
    senderId?: string,
    receiverId?: string,
  ): Promise<MessageDocument[]> {
    try {
      const filter = this.buildUserFilter(senderId, receiverId);
      return await this.executeQuery(filter);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to retrieve messages',
      );
    }
  }

  /**
   * Get a specific message by ID
   */
  async findOne(id: string): Promise<MessageDocument> {
    try {
      this.validationService.validateObjectId(id, 'Message ID');
      const message = await this.messageModel.findById(id).exec();

      if (!message) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }

      return message;
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to retrieve message',
      );
    }
  }

  /**
   * Get all messages between two users (private conversation)
   */
  async findConversation(
    userId1: string,
    userId2: string,
  ): Promise<MessageDocument[]> {
    try {
      this.validateUserIds(userId1, userId2);
      const conversationFilter = this.buildConversationFilter(userId1, userId2);
      return await this.executeQuery(conversationFilter);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to retrieve conversation',
      );
    }
  }

  /**
   * Get all messages in a room
   */
  async findByRoom(roomId: string): Promise<MessageDocument[]> {
    try {
      this.validationService.validateObjectId(roomId, 'Room ID');
      return await this.executeQuery({ roomId });
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to retrieve room messages',
      );
    }
  }

  /**
   * Update a message
   */
  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageDocument> {
    try {
      this.validationService.validateObjectId(id, 'Message ID');
      const updatedMessage = await this.messageModel
        .findByIdAndUpdate(id, updateMessageDto, {
          new: true,
          runValidators: true,
        })
        .exec();

      if (!updatedMessage) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }

      return updatedMessage;
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to update message',
      );
    }
  }

  /**
   * Delete a message
   */
  async remove(id: string): Promise<MessageDocument> {
    try {
      this.validationService.validateObjectId(id, 'Message ID');
      const deletedMessage = await this.messageModel
        .findByIdAndDelete(id)
        .exec();

      if (!deletedMessage) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }

      return deletedMessage;
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to delete message',
      );
    }
  }

  /**
   * Delete all messages in a room
   */
  async removeByRoom(roomId: string): Promise<{
    deletedCount: number;
    message: string;
  }> {
    try {
      this.validationService.validateObjectId(roomId, 'Room ID');
      return await this.deleteRoomMessages(roomId);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to delete room messages',
      );
    }
  }

  // ============= PRIVATE HELPER METHODS =============

  /**
   * Execute a query with sorting
   */
  private async executeQuery(filter: Record<string, any>): Promise<MessageDocument[]> {
    return await this.messageModel
      .find(filter)
      .sort({ sentAt: -1 })
      .exec();
  }

  /**
   * Build filter for user-based queries
   */
  private buildUserFilter(
    senderId?: string,
    receiverId?: string,
  ): Record<string, any> {
    const filter: Record<string, any> = {};

    if (senderId) {
      this.validationService.validateObjectId(senderId, 'senderId');
      filter.senderId = senderId;
    }

    if (receiverId) {
      this.validationService.validateObjectId(receiverId, 'receiverId');
      filter.receiverId = receiverId;
    }

    return filter;
  }

  /**
   * Build filter for conversation queries
   */
  private buildConversationFilter(
    userId1: string,
    userId2: string,
  ): Record<string, any> {
    return {
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
      roomId: { $exists: false },
    };
  }

  /**
   * Validate two user IDs
   */
  private validateUserIds(userId1: string, userId2: string): void {
    this.validationService.validateObjectId(userId1, 'User 1 ID');
    this.validationService.validateObjectId(userId2, 'User 2 ID');
  }

  /**
   * Delete all messages from a room
   */
  private async deleteRoomMessages(
    roomId: string,
  ): Promise<{ deletedCount: number; message: string }> {
    const result = await this.messageModel.deleteMany({ roomId }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `No messages found for room ID ${roomId}`,
      );
    }

    return {
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} messages from room ${roomId}`,
    };
  }
}
