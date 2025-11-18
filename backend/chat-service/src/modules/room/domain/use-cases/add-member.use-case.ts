import {
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  IRoomRepository,
  ROOM_REPOSITORY,
} from '../interfaces/room.repository';
import { RoomEntity } from '../entities/room.entity';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class AddMemberUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(roomId: string, userId: string): Promise<RoomEntity> {
    try {
      this.validationService.validateObjectId(roomId, 'room ID');
      this.validationService.validateUUID(userId, 'user ID');

      const room = await this.roomRepository.findById(roomId);
      if (!room) {
        throw new NotFoundException(`Room with ID ${roomId} not found`);
      }

      if (room.isMember(userId)) {
        throw new ConflictException('User is already a member of this room');
      }

      room.addMember(userId);
      return await this.roomRepository.save(room);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to add member to room',
      );
    }
  }
}
