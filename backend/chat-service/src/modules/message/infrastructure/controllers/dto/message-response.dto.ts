import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the message',
    example: '67409b2f88a7c7eae01c4e91',
  })
  id: string;

  @ApiPropertyOptional({
    description:
      'Room ID if the message belongs to a room (nullable for private messages)',
    example: '67409b2f88a7c7eae01c4e91',
  })
  roomId?: string;

  @ApiProperty({
    description: 'User ID of the message sender',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  senderId: string;

  @ApiPropertyOptional({
    description: 'User ID of the message receiver (nullable if room message)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  receiverId?: string;

  @ApiProperty({
    description: 'Text content of the message',
    example: 'Hey, what is up?',
  })
  content: string;

  @ApiProperty({
    description: 'Date and time when the message was sent',
    example: '2025-11-13T22:15:00Z',
  })
  sentAt: Date;
}
