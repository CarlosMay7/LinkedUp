import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import {
  IRoomRepository,
  ROOM_REPOSITORY,
} from '../interfaces/room.repository';
import { RoomEntity } from '../entities/room.entity';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class UpdateRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(
    roomId: string,
    name?: string,
    description?: string,
  ): Promise<RoomEntity> {
    try {
      this.validationService.validateObjectId(roomId, 'room ID');

      // Ensure at least one field is provided
      if (name === undefined && description === undefined) {
        throw new BadRequestException(
          'At least one field (name or description) must be provided',
        );
      }

      const room = await this.roomRepository.findById(roomId);
      if (!room) {
        throw new NotFoundException(`Room with ID ${roomId} not found`);
      }

      // Check for duplicate room name if name is being updated
      if (name && name !== room.name) {
        const existingRoom = await this.roomRepository.findByName(name);
        if (existingRoom) {
          throw new ConflictException(
            `Room with name '${name}' already exists`,
          );
        }
        room.updateName(name);
      }

      if (description !== undefined) {
        room.updateDescription(description);
      }

      return await this.roomRepository.save(room);
    } catch (error) {
      this.validationService.handleServiceError(error, 'Failed to update room');
    }
  }
}
