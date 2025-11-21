import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRoomRepository } from '../../domain/interfaces/room.repository';
import { RoomEntity } from '../../domain/entities/room.entity';
import { Room, RoomDocument } from './schemas/room.schema';

@Injectable()
export class RoomMongoRepository implements IRoomRepository {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  private toEntity(doc: RoomDocument): RoomEntity {
    return new RoomEntity(
      doc.name,
      doc.description,
      doc.members,
      doc.createdBy,
      doc.isDirectMessage,
      doc._id.toString(),
    );
  }

  async create(room: RoomEntity): Promise<RoomEntity> {
    const createdRoom = new this.roomModel(room);
    const savedRoom = await createdRoom.save();
    return this.toEntity(savedRoom);
  }

  async findAll(): Promise<RoomEntity[]> {
    const rooms = await this.roomModel.find().sort({ createdAt: -1 }).exec();
    return rooms.map((room) => this.toEntity(room));
  }

  async findById(id: string): Promise<RoomEntity | null> {
    const room = await this.roomModel.findById(id).exec();
    return room ? this.toEntity(room) : null;
  }

  async findByName(name: string): Promise<RoomEntity[]> {
    const trimmedName = name.trim();
    const rooms = await this.roomModel
      .find({ name: { $regex: trimmedName, $options: 'i' } })
      .sort({ createdAt: -1 })
      .exec();
    return rooms.map((room) => this.toEntity(room));
  }

  async findByMember(userId: string): Promise<RoomEntity[]> {
    const rooms = await this.roomModel
      .find({ members: userId })
      .sort({ createdAt: -1 })
      .exec();
    return rooms.map((room) => this.toEntity(room));
  }

  async save(room: RoomEntity): Promise<RoomEntity> {
    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(
        room.id,
        {
          name: room.name,
          description: room.description,
          members: room.members,
        },
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    if (!updatedRoom) {
      throw new Error(`Room with ID ${room.id} not found`);
    }

    return this.toEntity(updatedRoom);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.roomModel.deleteOne({ _id: id }).exec();
    return result.deletedCount > 0;
  }
}
