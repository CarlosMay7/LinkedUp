import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({
  timestamps: true, // Para createdAt automático y como fallback
})
export class Room extends Document {
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
    example: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
    type: [String],
  })
  @Prop({ type: [Types.ObjectId], ref: 'User', required: true })
  members: Types.ObjectId[];

  @ApiProperty({
    description: 'User ID who created the room',
    example: '507f1f77bcf86cd799439011',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

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

export type RoomDocument = Room & Document;
export const RoomSchema = SchemaFactory.createForClass(Room);

RoomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

RoomSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});