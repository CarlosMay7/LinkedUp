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
    isDirectMessage: boolean,
    createdBy: string,
  ): Promise<RoomEntity> {
    try {
      // Check if room name already exists
      const existingRooms = await this.roomRepository.findByName(name);
      const exactMatch = existingRooms.find(
        (room) => room.name.toLowerCase() === name.toLowerCase(),
      );
      if (exactMatch) {
        throw new ConflictException(`Room with name '${name}' already exists`);
      }

      const roomEntity = new RoomEntity(name, description, members, createdBy, isDirectMessage);

      return await this.roomRepository.create(roomEntity);
    } catch (error) {
      this.validationService.handleServiceError(error, 'Failed to create room');
    }
  }
}
