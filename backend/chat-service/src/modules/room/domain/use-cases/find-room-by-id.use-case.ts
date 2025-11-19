import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IRoomRepository,
  ROOM_REPOSITORY,
} from '../interfaces/room.repository';
import { RoomEntity } from '../entities/room.entity';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class FindRoomByIdUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(roomId: string): Promise<RoomEntity> {
    try {
      this.validationService.validateObjectId(roomId, 'room ID');

      const room = await this.roomRepository.findById(roomId);
      if (!room) {
        throw new NotFoundException(`Room with ID ${roomId} not found`);
      }

      return room;
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to retrieve room',
      );
    }
  }
}
