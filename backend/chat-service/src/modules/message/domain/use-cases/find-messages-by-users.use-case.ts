import { Inject, Injectable } from '@nestjs/common';
import { MessageEntity } from '../entities/message.entity';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../interfaces/message.repository';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class FindMessagesByUsersUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(
    senderId?: string,
    receiverId?: string,
  ): Promise<MessageEntity[]> {
    try {
      if (senderId) {
        this.validationService.validateUUID(senderId, 'Sender ID');
      }
      if (receiverId) {
        this.validationService.validateUUID(receiverId, 'Receiver ID');
      }

      return await this.messageRepository.findByUsers(senderId, receiverId);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to retrieve messages',
      );
    }
  }
}
