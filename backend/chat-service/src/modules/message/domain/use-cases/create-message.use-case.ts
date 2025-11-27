import { Inject, Injectable } from '@nestjs/common';
import { MessageEntity } from '../entities/message.entity';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../interfaces/message.repository';
import { ValidationService } from '../../../common/validation.service';
import { ICreateMessageDto } from '../interfaces/icreate-message.dto';

@Injectable()
export class CreateMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    private readonly validationService: ValidationService,
  ) {}

  async execute(data: ICreateMessageDto): Promise<MessageEntity> {
    try {
      const roomId = data.roomId;
      const receiverId = data.receiverId;
      const senderId = data.senderId;
      // Validate that either roomId or receiverId is provided
      if (!roomId && !receiverId) {
        throw new Error(
          'Either roomId or receiverId must be provided for a message',
        );
      }

      // Validate that both roomId and receiverId are not provided
      if (roomId && receiverId) {
        throw new Error('A message cannot have both roomId and receiverId');
      }

      // Validate IDs
      if (roomId) {
        this.validationService.validateObjectId(roomId, 'Room ID');
        // Validate that the room exists
        await this.validationService.validateRoomExists(roomId);
      }
      this.validationService.validateUUID(senderId, 'Sender ID');
      if (receiverId) {
        this.validationService.validateUUID(receiverId, 'Receiver ID');
      }

      // Create new message entity
      const message = new MessageEntity(
        data.senderId,
        data.content,
        new Date(),
        undefined,
        data.roomId,
        data.receiverId,
      );

      return await this.messageRepository.create(message);
    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to create message',
      );
    }
  }
}
