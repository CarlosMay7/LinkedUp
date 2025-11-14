import { PartialType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';
import {
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  @ApiPropertyOptional({
    description: 'Updated room name',
    example: 'New Room Name',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Room name cannot be empty' })
  @MinLength(1, { message: 'Room name must be at least 1 character long' })
  @MaxLength(100, { message: 'Room name cannot exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated room description',
    example: 'Updated description',
    minLength: 1,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Room description cannot be empty' })
  @MinLength(1, {
    message: 'Room description must be at least 1 character long',
  })
  @MaxLength(500, { message: 'Room description cannot exceed 500 characters' })
  description?: string;
}
