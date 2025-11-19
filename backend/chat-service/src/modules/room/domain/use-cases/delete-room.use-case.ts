import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  IRoomRepository,
  ROOM_REPOSITORY,
} from '../interfaces/room.repository';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class DeleteRoomUseCase {
  constructor(
    @Inject(ROOM_REPOSITORY)
    private readonly roomRepository: IRoomRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(id: string): Promise<void> {
    try {
      this.validationService.validateObjectId(id, 'room ID');

      const room = await this.roomRepository.findById(id);
      if (!room) {
        throw new NotFoundException(`Room with ID ${id} not found`);
      }

      const deleted = await this.roomRepository.delete(id);
      if (!deleted) {
        throw new Error(`Failed to delete room with ID ${id}`);
      }
    } catch (error) {
      this.validationService.handleServiceError(error, 'Failed to delete room');
    }
  }
}
