import { Inject, Injectable, ConflictException } from '@nestjs/common';
import {
  IRoomRepository,
  ROOM_REPOSITORY,
} from '../interfaces/room.repository';
import { RoomEntity } from '../entities/room.entity';
import { CreateRoomDto } from '../../infrastructure/controllers/dto/dto/create-room.dto';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class CreateRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(dto: CreateRoomDto): Promise<RoomEntity> {
    try {
      // Check if room name already exists
      const existingRoom = await this.roomRepository.findByName(dto.name);
      if (existingRoom) {
        throw new ConflictException(
          `Room with name '${dto.name}' already exists`,
        );
      }

      const roomEntity = new RoomEntity(
        dto.name,
        dto.description,
        dto.members,
        dto.createdBy,
      );

      return await this.roomRepository.create(roomEntity);
    } catch (error) {
      this.validationService.handleServiceError(error, 'Failed to create room');
    }
  }
}
