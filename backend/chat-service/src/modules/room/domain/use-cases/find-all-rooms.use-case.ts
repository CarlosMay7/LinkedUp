import { Inject, Injectable } from '@nestjs/common';
import {
  IRoomRepository,
  ROOM_REPOSITORY,
} from '../interfaces/room.repository';
import { RoomEntity } from '../entities/room.entity';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class FindAllRoomsUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(): Promise<RoomEntity[]> {
    try {
      return await this.roomRepository.findAll();
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to retrieve rooms',
      );
    }
  }
}
