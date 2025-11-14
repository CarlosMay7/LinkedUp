import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MessageService } from '../../../src/message/message.service';
import { Message } from '../../../src/message/schemas/message.schema';
import { ValidationService } from '../../../src/common/validation.service';
import { CreateMessageDto } from '../../../src/message/dto/create-message.dto';
import { UpdateMessageDto } from '../../../src/message/dto/update-message.dto';
import { BadRequestException } from '@nestjs/common';

describe('MessageService', () => {
  let service: MessageService;
  let mockMessageModel: any;
  let mockValidationService: any;

  const mockMessage = {
    _id: '67409b2f88a7c7eae01c4e91',
    senderId: '673fa9b1d5f7a1b3e56a3e12',
    receiverId: '673fa9b1d5f7a1b3e56a3e13',
    content: 'Hello, this is a test message',
    roomId: null,
    sentAt: new Date('2024-11-14'),
    updatedAt: new Date('2024-11-14'),
    save: jest.fn(),
  };

  beforeEach(async () => {
    mockMessageModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockMessage),
    }));

    mockMessageModel.findById = jest.fn();
    mockMessageModel.find = jest.fn();
    mockMessageModel.findByIdAndUpdate = jest.fn();
    mockMessageModel.findByIdAndDelete = jest.fn();
    mockMessageModel.deleteMany = jest.fn();

    mockValidationService = {
      validateObjectId: jest.fn(),
      handleServiceError: jest.fn((error) => {
        throw error;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getModelToken(Message.name),
          useValue: mockMessageModel,
        },
        {
          provide: ValidationService,
          useValue: mockValidationService,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a message successfully', async () => {
      const createMessageDto: CreateMessageDto = {
        senderId: '673fa9b1d5f7a1b3e56a3e12',
        receiverId: '673fa9b1d5f7a1b3e56a3e13',
        content: 'Hello, this is a test message',
      };

      const result = await service.create(createMessageDto);

      expect(result).toBeDefined();
      expect(result).toEqual(mockMessage);
    });

    it('should handle error when creating a message', async () => {
      const createMessageDto: CreateMessageDto = {
        senderId: '673fa9b1d5f7a1b3e56a3e12',
        receiverId: '673fa9b1d5f7a1b3e56a3e13',
        content: 'Hello, this is a test message',
      };

      const error = new Error('Database error');
      mockValidationService.handleServiceError.mockImplementation(() => {
        throw error;
      });

      try {
        await service.create(createMessageDto);
      } catch {
        expect(mockValidationService.handleServiceError).toHaveBeenCalledWith(
          expect.any(Error),
          'Failed to create message',
        );
      }
    });
  });

  describe('findAll', () => {
    it('should return all messages', async () => {
      const mockMessages = [mockMessage];
      const execMock = jest.fn().mockResolvedValue(mockMessages);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      const findMock = jest.fn().mockReturnValue({ sort: sortMock });

      mockMessageModel.find = findMock;

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(findMock).toHaveBeenCalledWith({});
      expect(sortMock).toHaveBeenCalledWith({ sentAt: -1 });
    });

    it('should handle error when retrieving all messages', async () => {
      const error = new Error('Database error');
      const execMock = jest.fn().mockRejectedValue(error);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      const findMock = jest.fn().mockReturnValue({ sort: sortMock });

      mockMessageModel.find = findMock;
      mockValidationService.handleServiceError.mockImplementation(() => {
        throw error;
      });

      try {
        await service.findAll();
      } catch {
        expect(mockValidationService.handleServiceError).toHaveBeenCalledWith(
          expect.any(Error),
          'Failed to retrieve messages',
        );
      }
    });
  });

  describe('findOne', () => {
    it('should return a message by id', async () => {
      const messageId = '67409b2f88a7c7eae01c4e91';
      const execMock = jest.fn().mockResolvedValue(mockMessage);
      const findByIdMock = jest.fn().mockReturnValue({ exec: execMock });

      mockMessageModel.findById = findByIdMock;

      const result = await service.findOne(messageId);

      expect(result).toBeDefined();
      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        messageId,
        'Message ID',
      );
      expect(findByIdMock).toHaveBeenCalledWith(messageId);
    });

    it('should throw NotFoundException when message not found', async () => {
      const messageId = '67409b2f88a7c7eae01c4e91';
      const execMock = jest.fn().mockResolvedValue(null);
      const findByIdMock = jest.fn().mockReturnValue({ exec: execMock });

      mockMessageModel.findById = findByIdMock;
      mockValidationService.handleServiceError.mockImplementation((error) => {
        throw error;
      });

      try {
        await service.findOne(messageId);
      } catch {
        expect(mockValidationService.handleServiceError).toHaveBeenCalled();
      }
    });

    it('should validate object id format', async () => {
      const invalidId = 'invalid-id';
      mockValidationService.validateObjectId.mockImplementation(() => {
        throw new BadRequestException('Invalid ID format');
      });

      try {
        await service.findOne(invalidId);
      } catch {
        expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
          invalidId,
          'Message ID',
        );
      }
    });
  });

  describe('findByUsers', () => {
    it('should return messages filtered by senderId and receiverId', async () => {
      const senderId = '673fa9b1d5f7a1b3e56a3e12';
      const receiverId = '673fa9b1d5f7a1b3e56a3e13';
      const mockMessages = [mockMessage];

      const execMock = jest.fn().mockResolvedValue(mockMessages);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      const findMock = jest.fn().mockReturnValue({ sort: sortMock });

      mockMessageModel.find = findMock;

      const result = await service.findByUsers(senderId, receiverId);

      expect(result).toBeDefined();
      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        senderId,
        'senderId',
      );
      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        receiverId,
        'receiverId',
      );
    });

    it('should return messages filtered by senderId only', async () => {
      const senderId = '673fa9b1d5f7a1b3e56a3e12';
      const mockMessages = [mockMessage];

      const execMock = jest.fn().mockResolvedValue(mockMessages);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      const findMock = jest.fn().mockReturnValue({ sort: sortMock });

      mockMessageModel.find = findMock;

      const result = await service.findByUsers(senderId);

      expect(result).toBeDefined();
      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        senderId,
        'senderId',
      );
    });

    it('should return messages filtered by receiverId only', async () => {
      const receiverId = '673fa9b1d5f7a1b3e56a3e13';
      const mockMessages = [mockMessage];

      const execMock = jest.fn().mockResolvedValue(mockMessages);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      const findMock = jest.fn().mockReturnValue({ sort: sortMock });

      mockMessageModel.find = findMock;

      const result = await service.findByUsers(undefined, receiverId);

      expect(result).toBeDefined();
      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        receiverId,
        'receiverId',
      );
    });
  });

  describe('findByRoom', () => {
    it('should return messages for a specific room', async () => {
      const roomId = '67409b2f88a7c7eae01c4e91';
      const mockMessages = [{ ...mockMessage, roomId }];

      const execMock = jest.fn().mockResolvedValue(mockMessages);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      const findMock = jest.fn().mockReturnValue({ sort: sortMock });

      mockMessageModel.find = findMock;

      const result = await service.findByRoom(roomId);

      expect(result).toBeDefined();
      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        roomId,
        'Room ID',
      );
      expect(findMock).toHaveBeenCalledWith({ roomId });
    });
  });

  describe('findConversation', () => {
    it('should return messages between two users', async () => {
      const userId1 = '673fa9b1d5f7a1b3e56a3e12';
      const userId2 = '673fa9b1d5f7a1b3e56a3e13';
      const mockMessages = [mockMessage];

      const execMock = jest.fn().mockResolvedValue(mockMessages);
      const sortMock = jest.fn().mockReturnValue({ exec: execMock });
      const findMock = jest.fn().mockReturnValue({ sort: sortMock });

      mockMessageModel.find = findMock;

      const result = await service.findConversation(userId1, userId2);

      expect(result).toBeDefined();
      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        userId1,
        'User 1 ID',
      );
      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        userId2,
        'User 2 ID',
      );
    });
  });

  describe('update', () => {
    it('should update a message', async () => {
      const messageId = '67409b2f88a7c7eae01c4e91';
      const updateMessageDto: UpdateMessageDto = {
        content: 'Updated message',
      };
      const updatedMessage = { ...mockMessage, ...updateMessageDto };

      const execMock = jest.fn().mockResolvedValue(updatedMessage);
      const findByIdAndUpdateMock = jest
        .fn()
        .mockReturnValue({ exec: execMock });

      mockMessageModel.findByIdAndUpdate = findByIdAndUpdateMock;

      const result = await service.update(messageId, updateMessageDto);

      expect(result).toBeDefined();
      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        messageId,
        'Message ID',
      );
      expect(findByIdAndUpdateMock).toHaveBeenCalledWith(
        messageId,
        updateMessageDto,
        {
          new: true,
          runValidators: true,
        },
      );
    });

    it('should throw NotFoundException when message not found during update', async () => {
      const messageId = '67409b2f88a7c7eae01c4e91';
      const updateMessageDto: UpdateMessageDto = {
        content: 'Updated message',
      };

      const execMock = jest.fn().mockResolvedValue(null);
      const findByIdAndUpdateMock = jest
        .fn()
        .mockReturnValue({ exec: execMock });

      mockMessageModel.findByIdAndUpdate = findByIdAndUpdateMock;
      mockValidationService.handleServiceError.mockImplementation((error) => {
        throw error;
      });

      try {
        await service.update(messageId, updateMessageDto);
      } catch {
        expect(mockValidationService.handleServiceError).toHaveBeenCalled();
      }
    });
  });

  describe('remove', () => {
    it('should remove a message', async () => {
      const messageId = '67409b2f88a7c7eae01c4e91';

      const execMock = jest.fn().mockResolvedValue(mockMessage);
      const findByIdAndDeleteMock = jest
        .fn()
        .mockReturnValue({ exec: execMock });

      mockMessageModel.findByIdAndDelete = findByIdAndDeleteMock;

      const result = await service.remove(messageId);

      expect(result).toBeDefined();
      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        messageId,
        'Message ID',
      );
      expect(findByIdAndDeleteMock).toHaveBeenCalledWith(messageId);
    });

    it('should throw NotFoundException when message not found during delete', async () => {
      const messageId = '67409b2f88a7c7eae01c4e91';

      const execMock = jest.fn().mockResolvedValue(null);
      const findByIdAndDeleteMock = jest
        .fn()
        .mockReturnValue({ exec: execMock });

      mockMessageModel.findByIdAndDelete = findByIdAndDeleteMock;
      mockValidationService.handleServiceError.mockImplementation((error) => {
        throw error;
      });

      try {
        await service.remove(messageId);
      } catch {
        expect(mockValidationService.handleServiceError).toHaveBeenCalled();
      }
    });
  });

  describe('removeByRoom', () => {
    it('should delete all messages in a room', async () => {
      const roomId = '67409b2f88a7c7eae01c4e91';
      const deleteResult = {
        deletedCount: 5,
        acknowledged: true,
      };

      const execMock = jest.fn().mockResolvedValue(deleteResult);
      const deleteManyMock = jest.fn().mockReturnValue({ exec: execMock });

      mockMessageModel.deleteMany = deleteManyMock;

      const result = await service.removeByRoom(roomId);

      expect(result).toBeDefined();
      expect(mockValidationService.validateObjectId).toHaveBeenCalledWith(
        roomId,
        'Room ID',
      );
      expect(deleteManyMock).toHaveBeenCalledWith({ roomId });
    });

    it('should throw NotFoundException when no messages in room', async () => {
      const roomId = '67409b2f88a7c7eae01c4e91';
      const deleteResult = {
        deletedCount: 0,
        acknowledged: true,
      };

      const execMock = jest.fn().mockResolvedValue(deleteResult);
      const deleteManyMock = jest.fn().mockReturnValue({ exec: execMock });

      mockMessageModel.deleteMany = deleteManyMock;
      mockValidationService.handleServiceError.mockImplementation((error) => {
        throw error;
      });

      try {
        await service.removeByRoom(roomId);
      } catch {
        expect(mockValidationService.handleServiceError).toHaveBeenCalled();
      }
    });
  });
});
