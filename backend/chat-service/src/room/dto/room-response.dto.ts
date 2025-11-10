import { ApiProperty } from '@nestjs/swagger';

export class RoomResponseDto {
  @ApiProperty({
    description: 'Room ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Room name',
    example: 'Development Team',
  })
  name: string;

  @ApiProperty({
    description: 'Room description',
    example: 'Team collaboration room',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Array of member user IDs',
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String],
  })
  members: string[];

  @ApiProperty({
    description: 'User ID who created the room',
    example: '507f1f77bcf86cd799439011',
  })
  createdBy: string;

  @ApiProperty({
    description: 'Room creation date',
    example: '2023-10-01T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Room last update date', 
    example: '2023-10-01T12:00:00.000Z',
  })
  updatedAt: Date;
}