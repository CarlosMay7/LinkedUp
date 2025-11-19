import { Inject, Injectable } from '@nestjs/common';
import {
  IRoomRepository,
  ROOM_REPOSITORY,
} from '../interfaces/room.repository';
import { RoomEntity } from '../entities/room.entity';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class FindRoomsByMemberUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(userId: string): Promise<RoomEntity[]> {
    try {
      this.validationService.validateUUID(userId, 'user ID');
      return await this.roomRepository.findByMember(userId);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to retrieve rooms by member',
      );
    }
  }
}
