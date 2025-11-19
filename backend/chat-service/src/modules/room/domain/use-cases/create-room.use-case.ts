import { Inject, Injectable, ConflictException } from '@nestjs/common';
import {
  IRoomRepository,
  ROOM_REPOSITORY,
} from '../interfaces/room.repository';
import { RoomEntity } from '../entities/room.entity';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class CreateRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(
    name: string,
    description: string,
    members: string[],
    createdBy: string,
  ): Promise<RoomEntity> {
    try {
      // Check if room name already exists
      const existingRoom = await this.roomRepository.findByName(name);
      if (existingRoom) {
        throw new ConflictException(`Room with name '${name}' already exists`);
      }

      const roomEntity = new RoomEntity(name, description, members, createdBy);

      return await this.roomRepository.create(roomEntity);
    } catch (error) {
      this.validationService.handleServiceError(error, 'Failed to create room');
    }
  }
}
