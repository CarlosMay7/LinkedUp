import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  ValidateIf,
  IsUUID,
} from 'class-validator';

export class CreateMessageDto {
  @ApiPropertyOptional({
    description:
      'Room ID if the message belongs to a room (nullable for private messages)',
    example: '67409b2f88a7c7eae01c4e91',
  })
  @IsOptional()
  @IsMongoId({ message: 'roomId must be a valid MongoDB ObjectId' })
  roomId?: string;

  @ApiProperty({
    description: 'User ID of the message sender',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsNotEmpty({ message: 'senderId is required' })
  @IsUUID('4', { message: 'senderId must be a valid UUID' })
  senderId: string;

  @ApiPropertyOptional({
    description: 'User ID of the message receiver (nullable if room message)',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsUUID('4', { message: 'receiverId must be a valid UUID' })
  receiverId?: string;

  @ApiProperty({
    description: 'Text content of the message',
    example: 'Hey, what is up?',
  })
  @IsNotEmpty({ message: 'content is required' })
  @IsString({ message: 'content must be a string' })
  content: string;

  @ValidateIf((o) => !o.roomId && !o.receiverId)
  @IsNotEmpty({
    message: 'Either roomId or receiverId must be provided',
  })
  private _validateEitherRoomOrReceiver?: any;
}
