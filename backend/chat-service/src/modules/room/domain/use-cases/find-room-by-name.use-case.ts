import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IRoomRepository,
  ROOM_REPOSITORY,
} from '../interfaces/room.repository';
import { RoomEntity } from '../entities/room.entity';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class FindRoomByNameUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(roomName: string): Promise<RoomEntity[]> {
    try {
      const rooms = await this.roomRepository.findByName(roomName);
      return rooms;
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to retrieve rooms',
      );
    }
  }
}
