import { Inject, Injectable } from '@nestjs/common';
import {
  IRoomRepository,
  ROOM_REPOSITORY,
} from '../interfaces/room.repository';
import { RoomEntity } from '../entities/room.entity';

@Injectable()
export class FindAllRoomsUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
  ) {}

  async execute(): Promise<RoomEntity[]> {
    return this.roomRepository.findAll();
  }
}
