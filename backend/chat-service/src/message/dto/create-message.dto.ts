import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';

export class CreateMessageDto {
  @ApiPropertyOptional({
    description:
      'Room ID if the message belongs to a room (nullable for private messages)',
    example: '67409b2f88a7c7eae01c4e91',
  })
  @IsOptional()
  @IsMongoId({ message: 'roomId must be a valid MongoDB ID' })
  roomId?: string;

  @ApiProperty({
    description: 'User ID of the message sender',
    example: '673fa9b1d5f7a1b3e56a3e12',
  })
  @IsNotEmpty({ message: 'senderId is required' })
  @IsMongoId({ message: 'senderId must be a valid MongoDB ID' })
  senderId: string;

  @ApiPropertyOptional({
    description: 'User ID of the message receiver (nullable if room message)',
    example: '673fa9b1d5f7a1b3e56a3e13',
  })
  @IsOptional()
  @IsMongoId({ message: 'receiverId must be a valid MongoDB ID' })
  receiverId?: string;

  @ApiProperty({
    description: 'Text content of the message',
    example: "Hey, what's up?",
  })
  @IsNotEmpty({ message: 'content is required' })
  @IsString({ message: 'content must be a string' })
  content: string;
}
