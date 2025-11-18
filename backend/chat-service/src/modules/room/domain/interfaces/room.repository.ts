import { RoomEntity } from '../entities/room.entity';

export interface IRoomRepository {
  create(room: RoomEntity): Promise<RoomEntity>;
  findAll(): Promise<RoomEntity[]>;
  findById(id: string): Promise<RoomEntity | null>;
  findByName(name: string): Promise<RoomEntity | null>;
  findByMember(userId: string): Promise<RoomEntity[]>;
  save(room: RoomEntity): Promise<RoomEntity>;
  delete(id: string): Promise<boolean>;
}

export const ROOM_REPOSITORY = Symbol('ROOM_REPOSITORY');
