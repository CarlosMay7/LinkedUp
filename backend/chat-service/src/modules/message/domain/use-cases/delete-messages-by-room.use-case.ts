import { Inject, Injectable } from '@nestjs/common';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../interfaces/message.repository';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class DeleteMessagesByRoomUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(
    roomId: string,
  ): Promise<{ deletedCount: number; message: string }> {
    try {
      this.validationService.validateObjectId(roomId, 'Room ID');

      // Validate that the room exists
      await this.validationService.validateRoomExists(roomId);

      return await this.messageRepository.deleteByRoom(roomId);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to delete room messages',
      );
    }
  }
}
