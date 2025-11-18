import {
  IsString,
  IsOptional,
  IsArray,
  IsNotEmpty,
  ArrayMinSize,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Room name',
    example: 'Development Team',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Room name is required' })
  @MinLength(1, { message: 'Room name must be at least 1 character long' })
  @MaxLength(100, { message: 'Room name cannot exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Room description',
    example: 'Team collaboration room',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MinLength(1, {
    message: 'Room description must be at least 1 character long',
  })
  @MaxLength(500, { message: 'Room description cannot exceed 500 characters' })
  description?: string;

  @ApiProperty({
    description: 'Array of user IDs',
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true, message: 'Each member ID must be a valid UUID' })
  @ArrayMinSize(1, { message: 'At least one member is required' })
  members: string[];

  @ApiProperty({
    description: 'Creator user ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @IsUUID('4', { message: 'Creator user ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Creator user ID is required' })
  createdBy: string;
}
