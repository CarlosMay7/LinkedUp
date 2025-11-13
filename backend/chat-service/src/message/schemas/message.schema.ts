// src/messages/schemas/message.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @ApiPropertyOptional({
    description: 'Room ID if the message belongs to a room (nullable for private messages)',
    example: '67409b2f88a7c7eae01c4e91',
  })
  @Prop({ required: false })
  roomId?: string;

  @ApiProperty({
    description: 'User ID of the message sender',
    example: '673fa9b1d5f7a1b3e56a3e12',
  })
  @Prop({ required: true })
  senderId: string;

  @ApiPropertyOptional({
    description: 'User ID of the message receiver (nullable if room message)',
    example: '673fa9b1d5f7a1b3e56a3e13',
  })
  @Prop({ required: false })
  receiverId?: string;

  @ApiProperty({
    description: 'Text content of the message',
    example: 'Hey, what’s up?',
  })
  @Prop({ required: true })
  content: string;

  @ApiProperty({
    description: 'Date and time when the message was sent',
    example: '2025-11-13T22:15:00Z',
  })
  @Prop({ required: true, default: () => new Date() })
  sentAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);