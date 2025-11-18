import { RoomEntity } from '../entities/room.entity';

export interface IRoomRepository {
  create(room: Omit<RoomEntity, 'id'>): Promise<RoomEntity>;
  findAll(): Promise<RoomEntity[]>;
  findById(id: string): Promise<RoomEntity | null>;
  findByName(name: string): Promise<RoomEntity | null>;
  findByMember(userId: string): Promise<RoomEntity[]>;
  update(id: string, room: Partial<RoomEntity>): Promise<RoomEntity | null>;
  save(room: RoomEntity): Promise<RoomEntity>;
}

export const ROOM_REPOSITORY = Symbol('ROOM_REPOSITORY');
