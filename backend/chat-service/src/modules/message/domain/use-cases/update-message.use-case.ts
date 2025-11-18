import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { MessageEntity } from '../entities/message.entity';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../interfaces/message.repository';
import { ValidationService } from '../../../common/validation.service';

@Injectable()
export class UpdateMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(id: string, content: string): Promise<MessageEntity> {
    try {
      this.validationService.validateObjectId(id, 'Message ID');

      const message = await this.messageRepository.findById(id);

      if (!message) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }

      message.updateContent(content);

      return await this.messageRepository.save(message);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to update message',
      );
    }
  }
}
