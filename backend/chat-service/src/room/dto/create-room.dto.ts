import { IsString, IsOptional, IsArray, IsNotEmpty, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Room name',
    example: 'Development Team',
  })
  @IsString()
  @IsNotEmpty({ message: 'Room name is required' })
  name: string;

  @ApiPropertyOptional({
    description: 'Room description',
    example: 'Team collaboration room',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Array of user IDs',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'At least one member is required' })
  members: string[];

  @ApiProperty({
    description: 'Creator user ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty({ message: 'Creator user ID is required' })
  createdBy: string;
}