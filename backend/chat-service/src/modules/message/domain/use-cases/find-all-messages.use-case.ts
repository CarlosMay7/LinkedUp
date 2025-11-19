import { Inject, Injectable } from '@nestjs/common';
import { MessageEntity } from '../entities/message.entity';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../interfaces/message.repository';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class FindAllMessagesUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(): Promise<MessageEntity[]> {
    try {
      return await this.messageRepository.findAll();
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to retrieve messages',
      );
    }
  }
}
