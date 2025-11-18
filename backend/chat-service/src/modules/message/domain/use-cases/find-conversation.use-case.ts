import { Inject, Injectable } from '@nestjs/common';
import { MessageEntity } from '../entities/message.entity';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../interfaces/message.repository';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class FindConversationUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(userId1: string, userId2: string): Promise<MessageEntity[]> {
    try {
      this.validationService.validateUUID(userId1, 'User 1 ID');
      this.validationService.validateUUID(userId2, 'User 2 ID');

      return await this.messageRepository.findConversation(userId1, userId2);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to retrieve conversation',
      );
    }
  }
}
