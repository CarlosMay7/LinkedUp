import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MessageDocument = HydratedDocument<Message>;

@Schema({
  timestamps: true,
})
export class Message {
  @ApiProperty({
    description: 'Room ID where the message was sent (for group messages)',
    example: '673c9b5f8e4a1b2c3d4e5f60',
    required: false,
  })
  @Prop({ type: String, required: false, index: true })
  roomId?: string;

  @ApiProperty({
    description: 'User ID who sent the message',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Prop({ type: String, required: true, index: true })
  senderId: string;

  @ApiProperty({
    description: 'User ID who receives the message (for private messages)',
    example: '550e8400-e29b-41d4-a716-446655440002',
    required: false,
  })
  @Prop({ type: String, required: false, index: true })
  receiverId?: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how are you?',
  })
  @Prop({ required: true })
  content: string;

  @ApiProperty({
    description: 'Date when the message was sent',
    example: '2023-10-01T12:00:00.000Z',
  })
  @Prop({ required: true, default: () => new Date() })
  sentAt: Date;

  @ApiProperty({
    description: 'Message creation date',
    example: '2023-10-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Message last update date',
    example: '2023-10-01T12:00:00.000Z',
  })
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Create compound indexes for efficient queries
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ roomId: 1, sentAt: -1 });
MessageSchema.index({ senderId: 1, sentAt: -1 });
