import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from '../../../src/modules/message/infrastructure/controllers/message.controller';
import { CreateMessageDto } from '../../../src/modules/message/infrastructure/controllers/dto/create-message.dto';
import { UpdateMessageDto } from '../../../src/modules/message/infrastructure/controllers/dto/update-message.dto';
import { MessageEntity } from '../../../src/modules/message/domain/entities/message.entity';
import { CreateMessageUseCase } from '../../../src/modules/message/domain/use-cases/create-message.use-case';
import { FindAllMessagesUseCase } from '../../../src/modules/message/domain/use-cases/find-all-messages.use-case';
import { FindMessageByIdUseCase } from '../../../src/modules/message/domain/use-cases/find-message-by-id.use-case';
import { FindMessagesByUsersUseCase } from '../../../src/modules/message/domain/use-cases/find-messages-by-users.use-case';
import { FindConversationUseCase } from '../../../src/modules/message/domain/use-cases/find-conversation.use-case';
import { FindMessagesByRoomUseCase } from '../../../src/modules/message/domain/use-cases/find-messages-by-room.use-case';
import { UpdateMessageUseCase } from '../../../src/modules/message/domain/use-cases/update-message.use-case';
import { DeleteMessageUseCase } from '../../../src/modules/message/domain/use-cases/delete-message.use-case';
import { DeleteMessagesByRoomUseCase } from '../../../src/modules/message/domain/use-cases/delete-messages-by-room.use-case';
import { Types } from 'mongoose';
import { NotFoundException } from '@nestjs/common';

const mockMessageEntity = new MessageEntity(
  '550e8400-e29b-41d4-a716-446655440001',
  'Test message content',
  new Date(),
  new Types.ObjectId().toString(),
  new Types.ObjectId().toString(),
  undefined,
);

const mockCreateMessageUseCase = {
  execute: jest.fn(),
};

const mockFindAllMessagesUseCase = {
  execute: jest.fn(),
};

const mockFindMessageByIdUseCase = {
  execute: jest.fn(),
};

const mockFindMessagesByUsersUseCase = {
  execute: jest.fn(),
};

const mockFindConversationUseCase = {
  execute: jest.fn(),
};

const mockFindMessagesByRoomUseCase = {
  execute: jest.fn(),
};

const mockUpdateMessageUseCase = {
  execute: jest.fn(),
};

const mockDeleteMessageUseCase = {
  execute: jest.fn(),
};

const mockDeleteMessagesByRoomUseCase = {
  execute: jest.fn(),
};

describe('MessageController', () => {
  let controller: MessageController;
  let createMessageUseCase: CreateMessageUseCase;
  let findAllMessagesUseCase: FindAllMessagesUseCase;
  let findMessageByIdUseCase: FindMessageByIdUseCase;
  let findConversationUseCase: FindConversationUseCase;
  let findMessagesByRoomUseCase: FindMessagesByRoomUseCase;
  let updateMessageUseCase: UpdateMessageUseCase;
  let deleteMessageUseCase: DeleteMessageUseCase;
  let deleteMessagesByRoomUseCase: DeleteMessagesByRoomUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: CreateMessageUseCase,
          useValue: mockCreateMessageUseCase,
        },
        {
          provide: FindAllMessagesUseCase,
          useValue: mockFindAllMessagesUseCase,
        },
        {
          provide: FindMessageByIdUseCase,
          useValue: mockFindMessageByIdUseCase,
        },
        {
          provide: FindMessagesByUsersUseCase,
          useValue: mockFindMessagesByUsersUseCase,
        },
        {
          provide: FindConversationUseCase,
          useValue: mockFindConversationUseCase,
        },
        {
          provide: FindMessagesByRoomUseCase,
          useValue: mockFindMessagesByRoomUseCase,
        },
        {
          provide: UpdateMessageUseCase,
          useValue: mockUpdateMessageUseCase,
        },
        {
          provide: DeleteMessageUseCase,
          useValue: mockDeleteMessageUseCase,
        },
        {
          provide: DeleteMessagesByRoomUseCase,
          useValue: mockDeleteMessagesByRoomUseCase,
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    createMessageUseCase =
      module.get<CreateMessageUseCase>(CreateMessageUseCase);
    findAllMessagesUseCase = module.get<FindAllMessagesUseCase>(
      FindAllMessagesUseCase,
    );
    findMessageByIdUseCase = module.get<FindMessageByIdUseCase>(
      FindMessageByIdUseCase,
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a room message', async () => {
      const createDto: CreateMessageDto = {
        roomId: new Types.ObjectId().toString(),
        senderId: '550e8400-e29b-41d4-a716-446655440001',
        content: 'Test message',
      };

      mockCreateMessageUseCase.execute.mockResolvedValue(mockMessageEntity);

      const result = await controller.create(createDto);

      expect(createMessageUseCase.execute).toHaveBeenCalledWith(
        createDto.roomId,
        createDto.senderId,
        undefined,
        createDto.content,
      );
      expect(result).toHaveProperty('id');
      expect(result.content).toBe('Test message content');
    });

    it('should create a private message', async () => {
      const privateMessage = new MessageEntity(
        '550e8400-e29b-41d4-a716-446655440001',
        'Private message',
        new Date(),
        new Types.ObjectId().toString(),
        undefined,
        '550e8400-e29b-41d4-a716-446655440002',
      );

      const createDto: CreateMessageDto = {
        senderId: '550e8400-e29b-41d4-a716-446655440001',
        receiverId: '550e8400-e29b-41d4-a716-446655440002',
        content: 'Private message',
      };

      mockCreateMessageUseCase.execute.mockResolvedValue(privateMessage);

      const result = await controller.create(createDto);

      expect(createMessageUseCase.execute).toHaveBeenCalledWith(
        undefined,
        createDto.senderId,
        createDto.receiverId,
        createDto.content,
      );
      expect(result.receiverId).toBe('550e8400-e29b-41d4-a716-446655440002');
    });
  });

  describe('findAll', () => {
    it('should return an array of messages', async () => {
      const messages = [mockMessageEntity];
      mockFindAllMessagesUseCase.execute.mockResolvedValue(messages);

      const result = await controller.findAll();

      expect(findAllMessagesUseCase.execute).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a message by id', async () => {
      const messageId = new Types.ObjectId().toString();
      mockFindMessageByIdUseCase.execute.mockResolvedValue(mockMessageEntity);

      const result = await controller.findOne(messageId);

      expect(findMessageByIdUseCase.execute).toHaveBeenCalledWith(messageId);
      expect(result).toHaveProperty('id');
    });

    it('should throw NotFoundException when message not found', async () => {
      const messageId = new Types.ObjectId().toString();
      mockFindMessageByIdUseCase.execute.mockRejectedValue(
        new NotFoundException(`Message with ID ${messageId} not found`),
      );

      await expect(controller.findOne(messageId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByRoom', () => {
    it('should return messages from a room', async () => {
      const roomId = new Types.ObjectId().toString();
      const messages = [mockMessageEntity];
      mockFindMessagesByRoomUseCase.execute.mockResolvedValue(messages);

      const result = await controller.findByRoom(roomId);

      expect(findMessagesByRoomUseCase.execute).toHaveBeenCalledWith(roomId);
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('findConversation', () => {
    it('should return conversation between two users', async () => {
      const userId1 = '550e8400-e29b-41d4-a716-446655440001';
      const userId2 = '550e8400-e29b-41d4-a716-446655440002';
      const messages = [mockMessageEntity];
      mockFindConversationUseCase.execute.mockResolvedValue(messages);

      const result = await controller.findConversation(userId1, userId2);

      expect(findConversationUseCase.execute).toHaveBeenCalledWith(
        userId1,
        userId2,
      );
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('update', () => {
    it('should update a message', async () => {
      const messageId = new Types.ObjectId().toString();
      const updateDto: UpdateMessageDto = {
        content: 'Updated content',
      };
      const updatedMessage = new MessageEntity(
        mockMessageEntity.senderId,
        'Updated content',
        mockMessageEntity.sentAt,
        messageId,
        mockMessageEntity.roomId,
        mockMessageEntity.receiverId,
      );

      mockUpdateMessageUseCase.execute.mockResolvedValue(updatedMessage);

      const result = await controller.update(messageId, updateDto);

      expect(updateMessageUseCase.execute).toHaveBeenCalledWith(
        messageId,
        updateDto.content,
      );
      expect(result.content).toBe('Updated content');
    });
  });

  describe('remove', () => {
    it('should delete a message', async () => {
      const messageId = new Types.ObjectId().toString();
      mockDeleteMessageUseCase.execute.mockResolvedValue(mockMessageEntity);

      const result = await controller.remove(messageId);

      expect(deleteMessageUseCase.execute).toHaveBeenCalledWith(messageId);
      expect(result).toHaveProperty('id');
    });
  });

  describe('removeByRoom', () => {
    it('should delete all messages in a room', async () => {
      const roomId = new Types.ObjectId().toString();
      const deleteResult = {
        deletedCount: 5,
        message: `Successfully deleted 5 messages from room ${roomId}`,
      };
      mockDeleteMessagesByRoomUseCase.execute.mockResolvedValue(deleteResult);

      const result = await controller.removeByRoom(roomId);

      expect(deleteMessagesByRoomUseCase.execute).toHaveBeenCalledWith(roomId);
      expect(result.deletedCount).toBe(5);
    });
  });
});
