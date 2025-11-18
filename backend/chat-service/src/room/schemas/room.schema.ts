import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  timestamps: true,
})
export class Room {
  @ApiProperty({
    description: 'Room name',
    example: 'Development Team',
    uniqueItems: true,
  })
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty({
    description: 'Room description',
    example: 'Team collaboration room',
    required: false,
  })
  @Prop()
  description: string;

  @ApiProperty({
    description: 'Array of user IDs who are members of the room',
    example: [
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    type: [String],
  })
  @Prop({ type: [String], required: true, index: true })
  members: string[];

  @ApiProperty({
    description: 'User ID who created the room',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  @Prop({ type: String, required: true })
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

export type RoomDocument = HydratedDocument<Room>;
export const RoomSchema = SchemaFactory.createForClass(Room);
