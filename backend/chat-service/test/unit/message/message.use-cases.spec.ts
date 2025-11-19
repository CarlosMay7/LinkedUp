import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateMessageUseCase } from '../../../src/modules/message/domain/use-cases/create-message.use-case';
import { FindAllMessagesUseCase } from '../../../src/modules/message/domain/use-cases/find-all-messages.use-case';
import { FindMessageByIdUseCase } from '../../../src/modules/message/domain/use-cases/find-message-by-id.use-case';
import { FindMessagesByUsersUseCase } from '../../../src/modules/message/domain/use-cases/find-messages-by-users.use-case';
import { FindConversationUseCase } from '../../../src/modules/message/domain/use-cases/find-conversation.use-case';
import { FindMessagesByRoomUseCase } from '../../../src/modules/message/domain/use-cases/find-messages-by-room.use-case';
import { UpdateMessageUseCase } from '../../../src/modules/message/domain/use-cases/update-message.use-case';
import { DeleteMessageUseCase } from '../../../src/modules/message/domain/use-cases/delete-message.use-case';
import { DeleteMessagesByRoomUseCase } from '../../../src/modules/message/domain/use-cases/delete-messages-by-room.use-case';
import { MESSAGE_REPOSITORY } from '../../../src/modules/message/domain/interfaces/message.repository';
import { MessageEntity } from '../../../src/modules/message/domain/entities/message.entity';
import { ValidationService } from '../../../src/modules/common/validation.service';

const mockRoomMessage = new MessageEntity(
  '550e8400-e29b-41d4-a716-446655440001',
  'Test room message',
  new Date(),
  new Types.ObjectId().toString(),
  new Types.ObjectId().toString(),
  undefined,
);

const mockPrivateMessage = new MessageEntity(
  '550e8400-e29b-41d4-a716-446655440001',
  'Test private message',
  new Date(),
  new Types.ObjectId().toString(),
  undefined,
  '550e8400-e29b-41d4-a716-446655440002',
);

const mockMessageRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUsers: jest.fn(),
  findConversation: jest.fn(),
  findByRoom: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteByRoom: jest.fn(),
};

const mockValidationService = {
  validateObjectId: jest.fn(),
  validateUUID: jest.fn(),
  handleServiceError: jest.fn((error) => {
    throw error;
  }),
};

describe('Message Use Cases', () => {
  let createMessageUseCase: CreateMessageUseCase;
  let findAllMessagesUseCase: FindAllMessagesUseCase;
  let findMessageByIdUseCase: FindMessageByIdUseCase;
  let findMessagesByUsersUseCase: FindMessagesByUsersUseCase;
  let findConversationUseCase: FindConversationUseCase;
  let findMessagesByRoomUseCase: FindMessagesByRoomUseCase;
  let updateMessageUseCase: UpdateMessageUseCase;
  let deleteMessageUseCase: DeleteMessageUseCase;
  let deleteMessagesByRoomUseCase: DeleteMessagesByRoomUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMessageUseCase,
        FindAllMessagesUseCase,
        FindMessageByIdUseCase,
        FindMessagesByUsersUseCase,
        FindConversationUseCase,
        FindMessagesByRoomUseCase,
        UpdateMessageUseCase,
        DeleteMessageUseCase,
        DeleteMessagesByRoomUseCase,
        {
          provide: MESSAGE_REPOSITORY,
          useValue: mockMessageRepository,
        },
        {
          provide: ValidationService,
          useValue: mockValidationService,
        },
      ],
    }).compile();

    createMessageUseCase =
      module.get<CreateMessageUseCase>(CreateMessageUseCase);
    findAllMessagesUseCase = module.get<FindAllMessagesUseCase>(
      FindAllMessagesUseCase,
    );
    findMessageByIdUseCase = module.get<FindMessageByIdUseCase>(
      FindMessageByIdUseCase,
    );
    findMessagesByUsersUseCase = module.get<FindMessagesByUsersUseCase>(
      FindMessagesByUsersUseCase,
    );
    findConversationUseCase = module.get<FindConversationUseCase>(
      FindConversationUseCase,
    );
    findMessagesByRoomUseCase = module.get<FindMessagesByRoomUseCase>(
      FindMessagesByRoomUseCase,
    );
    updateMessageUseCase =
      module.get<UpdateMessageUseCase>(UpdateMessageUseCase);
    deleteMessageUseCase =
      module.get<DeleteMessageUseCase>(DeleteMessageUseCase);
    deleteMessagesByRoomUseCase = module.get<DeleteMessagesByRoomUseCase>(
      DeleteMessagesByRoomUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations
    mockValidationService.validateObjectId.mockReset();
    mockValidationService.validateUUID.mockReset();
  });

  describe('CreateMessageUseCase', () => {
    it('should create a room message successfully', async () => {
      const roomId = new Types.ObjectId().toString();
      const senderId = '550e8400-e29b-41d4-a716-446655440001';
      const content = 'Test message';

      mockMessageRepository.create.mockResolvedValue(mockRoomMessage);

      const result = await createMessageUseCase.execute(
        roomId,
        senderId,
        undefined,
        content,
      );

      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        roomId,
        'Room ID',
      );
      expect(mockValidationService.validateUUID).toHaveBeenCalledWith(
        senderId,
        'Sender ID',
      );
      expect(mockMessageRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockRoomMessage);
    });

    it('should create a private message successfully', async () => {
      const senderId = '550e8400-e29b-41d4-a716-446655440001';
      const receiverId = '550e8400-e29b-41d4-a716-446655440002';
      const content = 'Private message';

      mockMessageRepository.create.mockResolvedValue(mockPrivateMessage);

      const result = await createMessageUseCase.execute(
        undefined,
        senderId,
        receiverId,
        content,
      );

      expect(mockValidationService.validateUUID).toHaveBeenCalledWith(
        senderId,
        'Sender ID',
      );
      expect(mockValidationService.validateUUID).toHaveBeenCalledWith(
        receiverId,
        'Receiver ID',
      );
      expect(mockMessageRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockPrivateMessage);
    });

    it('should throw error if neither roomId nor receiverId provided', async () => {
      const senderId = '550e8400-e29b-41d4-a716-446655440001';
      const content = 'Test message';

      await expect(
        createMessageUseCase.execute(undefined, senderId, undefined, content),
      ).rejects.toThrow('Either roomId or receiverId must be provided');
    });

    it('should throw error if both roomId and receiverId provided', async () => {
      const roomId = new Types.ObjectId().toString();
      const senderId = '550e8400-e29b-41d4-a716-446655440001';
      const receiverId = '550e8400-e29b-41d4-a716-446655440002';
      const content = 'Test message';

      await expect(
        createMessageUseCase.execute(roomId, senderId, receiverId, content),
      ).rejects.toThrow('A message cannot have both roomId and receiverId');
    });
  });

  describe('FindAllMessagesUseCase', () => {
    it('should return all messages', async () => {
      const messages = [mockRoomMessage, mockPrivateMessage];
      mockMessageRepository.findAll.mockResolvedValue(messages);

      const result = await findAllMessagesUseCase.execute();

      expect(mockMessageRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(messages);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no messages exist', async () => {
      mockMessageRepository.findAll.mockResolvedValue([]);

      const result = await findAllMessagesUseCase.execute();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('FindMessageByIdUseCase', () => {
    it('should return a message by id', async () => {
      const messageId = new Types.ObjectId().toString();
      mockMessageRepository.findById.mockResolvedValue(mockRoomMessage);

      const result = await findMessageByIdUseCase.execute(messageId);

      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        messageId,
        'Message ID',
      );
      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(result).toEqual(mockRoomMessage);
    });

    it('should throw NotFoundException when message not found', async () => {
      const messageId = new Types.ObjectId().toString();
      mockMessageRepository.findById.mockResolvedValue(undefined);

      await expect(findMessageByIdUseCase.execute(messageId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid message ID', async () => {
      const invalidId = 'invalid-id';
      mockValidationService.validateObjectId.mockImplementation(() => {
        throw new BadRequestException('Invalid Message ID format');
      });

      await expect(findMessageByIdUseCase.execute(invalidId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('FindMessagesByUsersUseCase', () => {
    it('should find messages by sender', async () => {
      const senderId = '550e8400-e29b-41d4-a716-446655440001';
      mockMessageRepository.findByUsers.mockResolvedValue([mockRoomMessage]);

      const result = await findMessagesByUsersUseCase.execute(
        senderId,
        undefined,
      );

      expect(mockValidationService.validateUUID).toHaveBeenCalledWith(
        senderId,
        'Sender ID',
      );
      expect(mockMessageRepository.findByUsers).toHaveBeenCalledWith(
        senderId,
        undefined,
      );
      expect(result).toHaveLength(1);
    });

    it('should find messages by receiver', async () => {
      const receiverId = '550e8400-e29b-41d4-a716-446655440002';
      mockMessageRepository.findByUsers.mockResolvedValue([mockPrivateMessage]);

      const result = await findMessagesByUsersUseCase.execute(
        undefined,
        receiverId,
      );

      expect(mockValidationService.validateUUID).toHaveBeenCalledWith(
        receiverId,
        'Receiver ID',
      );
      expect(mockMessageRepository.findByUsers).toHaveBeenCalledWith(
        undefined,
        receiverId,
      );
      expect(result).toHaveLength(1);
    });

    it('should find messages by both sender and receiver', async () => {
      const senderId = '550e8400-e29b-41d4-a716-446655440001';
      const receiverId = '550e8400-e29b-41d4-a716-446655440002';
      mockMessageRepository.findByUsers.mockResolvedValue([mockPrivateMessage]);

      const result = await findMessagesByUsersUseCase.execute(
        senderId,
        receiverId,
      );

      expect(mockMessageRepository.findByUsers).toHaveBeenCalledWith(
        senderId,
        receiverId,
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('FindConversationUseCase', () => {
    it('should find conversation between two users', async () => {
      const userId1 = '550e8400-e29b-41d4-a716-446655440001';
      const userId2 = '550e8400-e29b-41d4-a716-446655440002';
      mockMessageRepository.findConversation.mockResolvedValue([
        mockPrivateMessage,
      ]);

      const result = await findConversationUseCase.execute(userId1, userId2);

      expect(mockValidationService.validateUUID).toHaveBeenCalledWith(
        userId1,
        'User 1 ID',
      );
      expect(mockValidationService.validateUUID).toHaveBeenCalledWith(
        userId2,
        'User 2 ID',
      );
      expect(mockMessageRepository.findConversation).toHaveBeenCalledWith(
        userId1,
        userId2,
      );
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no conversation exists', async () => {
      const userId1 = '550e8400-e29b-41d4-a716-446655440001';
      const userId2 = '550e8400-e29b-41d4-a716-446655440002';
      mockMessageRepository.findConversation.mockResolvedValue([]);

      const result = await findConversationUseCase.execute(userId1, userId2);

      expect(result).toEqual([]);
    });
  });

  describe('FindMessagesByRoomUseCase', () => {
    it('should find messages by room', async () => {
      const roomId = new Types.ObjectId().toString();
      mockMessageRepository.findByRoom.mockResolvedValue([mockRoomMessage]);

      const result = await findMessagesByRoomUseCase.execute(roomId);

      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        roomId,
        'Room ID',
      );
      expect(mockMessageRepository.findByRoom).toHaveBeenCalledWith(roomId);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when room has no messages', async () => {
      const roomId = new Types.ObjectId().toString();
      mockMessageRepository.findByRoom.mockResolvedValue([]);

      const result = await findMessagesByRoomUseCase.execute(roomId);

      expect(result).toEqual([]);
    });
  });

  describe('UpdateMessageUseCase', () => {
    it('should update a message successfully', async () => {
      const messageId = new Types.ObjectId().toString();
      const newContent = 'Updated content';
      const updatedMessage = new MessageEntity(
        mockRoomMessage.senderId,
        newContent,
        mockRoomMessage.sentAt,
        messageId,
        mockRoomMessage.roomId,
        mockRoomMessage.receiverId,
      );

      mockMessageRepository.findById.mockResolvedValue(mockRoomMessage);
      mockMessageRepository.save.mockResolvedValue(updatedMessage);

      const result = await updateMessageUseCase.execute(messageId, newContent);

      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        messageId,
        'Message ID',
      );
      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(mockMessageRepository.save).toHaveBeenCalled();
      expect(result.content).toBe(newContent);
    });

    it('should throw NotFoundException when message not found', async () => {
      const messageId = new Types.ObjectId().toString();
      const newContent = 'Updated content';
      mockMessageRepository.findById.mockResolvedValue(undefined);

      await expect(
        updateMessageUseCase.execute(messageId, newContent),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when content is empty', async () => {
      const messageId = new Types.ObjectId().toString();
      mockMessageRepository.findById.mockResolvedValue(mockRoomMessage);

      await expect(updateMessageUseCase.execute(messageId, '')).rejects.toThrow(
        'Content cannot be empty',
      );
    });
  });

  describe('DeleteMessageUseCase', () => {
    it('should delete a message successfully', async () => {
      const messageId = new Types.ObjectId().toString();
      mockMessageRepository.findById.mockResolvedValue(mockRoomMessage);
      mockMessageRepository.delete.mockResolvedValue(mockRoomMessage);

      const result = await deleteMessageUseCase.execute(messageId);

      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        messageId,
        'Message ID',
      );
      expect(mockMessageRepository.findById).toHaveBeenCalledWith(messageId);
      expect(mockMessageRepository.delete).toHaveBeenCalledWith(messageId);
      expect(result).toEqual(mockRoomMessage);
    });

    it('should throw NotFoundException when message not found', async () => {
      const messageId = new Types.ObjectId().toString();
      mockMessageRepository.findById.mockResolvedValue(undefined);

      await expect(deleteMessageUseCase.execute(messageId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockMessageRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('DeleteMessagesByRoomUseCase', () => {
    it('should delete all messages in a room', async () => {
      const roomId = new Types.ObjectId().toString();
      const deleteResult = {
        deletedCount: 5,
        message: `Successfully deleted 5 messages from room ${roomId}`,
      };
      mockMessageRepository.deleteByRoom.mockResolvedValue(deleteResult);

      const result = await deleteMessagesByRoomUseCase.execute(roomId);

      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        roomId,
        'Room ID',
      );
      expect(mockMessageRepository.deleteByRoom).toHaveBeenCalledWith(roomId);
      expect(result.deletedCount).toBe(5);
      expect(result.message).toContain('Successfully deleted');
    });

    it('should throw NotFoundException when no messages found in room', async () => {
      const roomId = new Types.ObjectId().toString();
      mockMessageRepository.deleteByRoom.mockRejectedValue(
        new NotFoundException(`No messages found for room ID ${roomId}`),
      );

      await expect(deleteMessagesByRoomUseCase.execute(roomId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
