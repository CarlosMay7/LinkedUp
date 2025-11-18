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
      doc._id.toString(),
      doc.name,
      doc.description,
      doc.members,
      doc.createdBy,
    );
  }

  async create(room: Omit<RoomEntity, 'id'>): Promise<RoomEntity> {
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

  async findByName(name: string): Promise<RoomEntity | null> {
    const room = await this.roomModel.findOne({ name }).exec();
    return room ? this.toEntity(room) : null;
  }

  async findByMember(userId: string): Promise<RoomEntity[]> {
    const rooms = await this.roomModel
      .find({ members: userId })
      .sort({ createdAt: -1 })
      .exec();
    return rooms.map((room) => this.toEntity(room));
  }

  async update(
    id: string,
    room: Partial<RoomEntity>,
  ): Promise<RoomEntity | null> {
    const updatedRoom = await this.roomModel
      .findByIdAndUpdate(id, room, {
        new: true,
        runValidators: true,
      })
      .exec();
    return updatedRoom ? this.toEntity(updatedRoom) : null;
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
}
