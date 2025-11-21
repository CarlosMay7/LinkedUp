import { Inject, Injectable } from '@nestjs/common';
import { MessageEntity } from '../entities/message.entity';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../interfaces/message.repository';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class FindMessagesByRoomUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(roomId: string): Promise<MessageEntity[]> {
    try {
      this.validationService.validateObjectId(roomId, 'Room ID');

      // Validate that the room exists
      await this.validationService.validateRoomExists(roomId);

      return await this.messageRepository.findByRoom(roomId);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to retrieve room messages',
      );
    }
  }
}
