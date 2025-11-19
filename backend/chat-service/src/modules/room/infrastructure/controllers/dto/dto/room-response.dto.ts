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
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    type: [String],
  })
  members: string[];

  @ApiProperty({
    description: 'User ID who created the room',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  createdBy: string;
}
