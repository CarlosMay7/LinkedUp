import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateRoomDto } from './create-room.dto';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateRoomDto extends PartialType(
  OmitType(CreateRoomDto, ['members', 'createdBy'] as const),
) {
  @ApiPropertyOptional({
    description: 'Updated room name',
    example: 'New Room Name',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
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
  @MinLength(1, {
    message: 'Room description must be at least 1 character long',
  })
  @MaxLength(500, { message: 'Room description cannot exceed 500 characters' })
  description?: string;
}
