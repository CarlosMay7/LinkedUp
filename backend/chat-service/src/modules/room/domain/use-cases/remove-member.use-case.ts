import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IRoomRepository,
  ROOM_REPOSITORY,
} from '../interfaces/room.repository';
import { RoomEntity } from '../entities/room.entity';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class RemoveMemberUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(roomId: string, userId: string): Promise<RoomEntity> {
    this.validationService.validateObjectId(roomId, 'room ID');
    this.validationService.validateUUID(userId, 'user ID');

    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundException(`Room with ID ${roomId} not found`);
    }

    const wasRemoved = room.removeMember(userId);
    if (!wasRemoved) {
      throw new NotFoundException('User is not a member of this room');
    }

    return this.roomRepository.save(room);
  }
}
