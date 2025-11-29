import { Inject, Injectable } from '@nestjs/common';
import {
  IRoomRepository,
  ROOM_REPOSITORY,
} from '../interfaces/room.repository';
import { RoomEntity } from '../entities/room.entity';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class FindOrCreateDirectMessageRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(
    userId1: string,
    userId2: string,
    createdBy: string,
  ): Promise<RoomEntity> {
    try {
      // Validate UUIDs
      this.validationService.validateUUID(userId1, 'User ID 1');
      this.validationService.validateUUID(userId2, 'User ID 2');
      this.validationService.validateUUID(createdBy, 'Created By');

      // Check if a direct message room already exists with these two users
      const existingRoom = await this.roomRepository.findDirectMessageRoom(
        userId1,
        userId2,
      );

      if (existingRoom) {
        return existingRoom;
      }

      // Create a new direct message room
      // Room name is a hash of sorted user IDs (for uniqueness and consistency)
      const sortedIds = [userId1, userId2].sort();
      const roomName = `dm_${sortedIds[0]}_${sortedIds[1]}`;

      const members = [userId1, userId2];
      const roomEntity = new RoomEntity(
        roomName,
        '',
        members,
        createdBy,
        true, // isDirectMessage
      );

      return await this.roomRepository.create(roomEntity);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to find or create direct message room',
      );
    }
  }
}
