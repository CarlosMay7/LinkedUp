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
import { UpdateRoomDto } from '../../infrastructure/controllers/dto/dto/update-room.dto';

@Injectable()
export class UpdateRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(roomId: string, dto: UpdateRoomDto): Promise<RoomEntity> {
    try {
      this.validationService.validateObjectId(roomId, 'room ID');

      // Validate input
      const allowedFields = ['name', 'description'];
      const providedFields = Object.keys(dto).filter(
        (key) => dto[key] !== undefined,
      );

      // Ensure at least one field is provided
      if (providedFields.length === 0) {
        throw new BadRequestException(
          'At least one field (name or description) must be provided',
        );
      }

      // Check for invalid fields
      const invalidFields = providedFields.filter(
        (field) => !allowedFields.includes(field),
      );
      if (invalidFields.length > 0) {
        throw new BadRequestException(
          `Invalid fields: ${invalidFields.join(', ')}. Allowed fields are: ${allowedFields.join(', ')}`,
        );
      }

      const room = await this.roomRepository.findById(roomId);
      if (!room) {
        throw new NotFoundException(`Room with ID ${roomId} not found`);
      }

      // Check for duplicate room name if name is being updated
      if (dto.name && dto.name !== room.name) {
        const existingRoom = await this.roomRepository.findByName(dto.name);
        if (existingRoom) {
          throw new ConflictException(
            `Room with name '${dto.name}' already exists`,
          );
        }
        room.updateName(dto.name);
      }

      if (dto.description !== undefined) {
        room.updateDescription(dto.description);
      }

      return await this.roomRepository.save(room);
    } catch (error) {
      this.validationService.handleServiceError(error, 'Failed to update room');
    }
  }
}
