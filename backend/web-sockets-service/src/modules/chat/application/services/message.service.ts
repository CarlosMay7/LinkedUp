import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IMessageBroker,
  MESSAGE_BROKER,
} from '../../domain/interfaces/message-broker.interface';
import {
  ISessionManager,
  SESSION_MANAGER,
} from '../../domain/interfaces/session-manager.interface';
import {
  IMessageRepository,
  MESSAGE_REPOSITORY,
} from '../../domain/interfaces/message-repository.interface';
import { MessageEntity } from '../../domain/entities/message.entity';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @Inject(MESSAGE_BROKER)
    private readonly messageBroker: IMessageBroker,
    @Inject(SESSION_MANAGER)
    private readonly sessionManager: ISessionManager,
    @Inject(MESSAGE_REPOSITORY)
    private readonly messageRepository: IMessageRepository,
  ) {}

  async sendMessage(
    senderId: string,
    content: string,
    roomId?: string,
    receiverId?: string,
  ): Promise<MessageEntity> {
    // Create message entity (MongoDB will generate _id)
    const message = new MessageEntity(senderId, content, roomId, receiverId);

    // Validate room or users before sending
    await this.validateMessageRecipients(message);

    // Persist message in chat-service and get the persisted message with _id
    const persistedMessage =
      await this.messageRepository.persistMessage(message);

    // Send in real-time via WebSocket using the persisted message
    if (persistedMessage.isRoomMessage()) {
      this.sendRoomMessage(persistedMessage);
    } else if (persistedMessage.isPrivateMessage()) {
      this.sendPrivateMessage(persistedMessage);
    }

    return persistedMessage;
  }

  private async validateMessageRecipients(
    message: MessageEntity,
  ): Promise<void> {
    if (message.isRoomMessage()) {
      const roomExists = await this.messageRepository.validateRoom(
        message.roomId!,
      );
      if (!roomExists) {
        throw new Error(`Room ${message.roomId} does not exist`);
      }
    } else if (message.isPrivateMessage()) {
      const receiverExists = await this.messageRepository.validateUser(
        message.receiverId!,
      );
      if (!receiverExists) {
        throw new Error(`User ${message.receiverId} does not exist`);
      }
    }
  }

  private sendRoomMessage(message: MessageEntity): void {
    if (!message.roomId) return;

    this.logger.log(
      `Sending message to room ${message.roomId} from user ${message.senderId}`,
    );
    this.messageBroker.sendToRoom(message.roomId, message);
  }

  private sendPrivateMessage(message: MessageEntity): void {
    if (!message.receiverId) return;

    const receiverSocketId = this.sessionManager.getUserSocketId(
      message.receiverId,
    );

    if (!receiverSocketId) {
      this.logger.warn(`User ${message.receiverId} is not connected`);
      return;
    }

    this.logger.log(
      `Sending private message from ${message.senderId} to ${message.receiverId}`,
    );
    this.messageBroker.sendToUser(message.receiverId, message);
  }

  async getMessagesByRoom(roomId: string): Promise<MessageEntity[]> {
    this.logger.log(`Fetching historical messages for room: ${roomId}`);
    return await this.messageRepository.getMessagesByRoom(roomId);
  }
}
