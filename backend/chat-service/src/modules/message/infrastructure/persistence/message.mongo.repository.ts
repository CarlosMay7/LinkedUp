import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMessageRepository } from '../../domain/interfaces/message.repository';
import { MessageEntity } from '../../domain/entities/message.entity';
import {
  Message,
  MessageDocument,
} from './schemas/message.schema';

@Injectable()
export class MessageMongoRepository implements IMessageRepository {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async create(message: MessageEntity): Promise<MessageEntity> {
    const createdMessage = new this.messageModel({
      roomId: message.roomId,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      sentAt: message.sentAt,
    });

    const saved = await createdMessage.save();
    return this.toEntity(saved);
  }

  async findAll(): Promise<MessageEntity[]> {
    const messages = await this.messageModel.find().sort({ sentAt: -1 }).exec();
    return messages.map((message) => this.toEntity(message));
  }

  async findById(id: string): Promise<MessageEntity | undefined> {
    const message = await this.messageModel.findById(id).exec();
    return message ? this.toEntity(message) : undefined;
  }

  async findByUsers(
    senderId?: string,
    receiverId?: string,
  ): Promise<MessageEntity[]> {
    const filter: Record<string, any> = {};

    if (senderId) {
      filter.senderId = senderId;
    }

    if (receiverId) {
      filter.receiverId = receiverId;
    }

    const messages = await this.messageModel
      .find(filter)
      .sort({ sentAt: -1 })
      .exec();
    return messages.map((message) => this.toEntity(message));
  }

  async findConversation(
    userId1: string,
    userId2: string,
  ): Promise<MessageEntity[]> {
    const messages = await this.messageModel
      .find({
        $or: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
        roomId: { $exists: false },
      })
      .sort({ sentAt: -1 })
      .exec();

    return messages.map((message) => this.toEntity(message));
  }

  async findByRoom(roomId: string): Promise<MessageEntity[]> {
    const messages = await this.messageModel
      .find({ roomId })
      .sort({ sentAt: -1 })
      .exec();
    return messages.map((message) => this.toEntity(message));
  }

  async save(message: MessageEntity): Promise<MessageEntity> {
    const updated = await this.messageModel
      .findByIdAndUpdate(
        message.id,
        {
          content: message.content,
        },
        { new: true, runValidators: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Message with ID ${message.id} not found`);
    }

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<MessageEntity> {
    const deleted = await this.messageModel.findByIdAndDelete(id).exec();

    if (!deleted) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    return this.toEntity(deleted);
  }

  async deleteByRoom(
    roomId: string,
  ): Promise<{ deletedCount: number; message: string }> {
    const result = await this.messageModel.deleteMany({ roomId }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException(`No messages found for room ID ${roomId}`);
    }

    return {
      deletedCount: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} messages from room ${roomId}`,
    };
  }

  private toEntity(messageDoc: MessageDocument): MessageEntity {
    return new MessageEntity(
      messageDoc.senderId,
      messageDoc.content,
      messageDoc.sentAt,
      messageDoc._id.toString(),
      messageDoc.roomId,
      messageDoc.receiverId,
    );
  }
}
