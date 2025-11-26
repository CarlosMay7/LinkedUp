import { Inject, Injectable, Optional } from '@nestjs/common';
import { MessageEntity } from '../entities/message.entity';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../interfaces/message.repository';
import { ValidationService } from '../../../common/validation.service';
import { ICreateMessageDto } from '../interfaces/icreate-message.dto';
import { MessageEventPublisher } from '../interfaces/message.event.publisher';

@Injectable()
export class CreateMessageUseCase {
  constructor(
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
    private readonly validationService: ValidationService,
    @Optional()
    @Inject('MESSAGE_EVENT_PUBLISHER')
    private readonly publisher?: MessageEventPublisher,
  ) {}

  async execute(data : ICreateMessageDto  ): Promise<MessageEntity> {
    try {
      const roomId = data.roomId;
      const receiverId = data.receiverId
      const senderId = data.senderId
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


      const created = await this.messageRepository.create(message);

        // Publish to Kafka (if publisher provided). Errors in publishing should not break creation.
      if (this.publisher) {
        try {
          await this.publisher.publishProcessedMessage(created);
        } catch (publishErr) {
          this.validationService.handleServiceError(publishErr, 'Failed to publish message event');
        }
      }

      return created;

    } catch (error) {
      this.validationService.handleServiceError(
        error,
        'Failed to create message',
      );
    }
  }
}
