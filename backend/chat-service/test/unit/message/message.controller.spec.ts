import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from '../../../src/message/message.controller';
import { MessageService } from '../../../src/message/message.service';
import { CreateMessageDto } from '../../../src/message/dto/create-message.dto';
import { UpdateMessageDto } from '../../../src/message/dto/update-message.dto';

describe('MessageController', () => {
  let controller: MessageController;
  let service: MessageService;

  const mockMessage = {
    _id: '67409b2f88a7c7eae01c4e91',
    senderId: '673fa9b1d5f7a1b3e56a3e12',
    receiverId: '673fa9b1d5f7a1b3e56a3e13',
    content: 'Hello, this is a test message',
    sentAt: new Date('2024-11-14'),
    updatedAt: new Date('2024-11-14'),
  };

  const mockMessageService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUsers: jest.fn(),
    findByRoom: jest.fn(),
    findConversation: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeByRoom: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    service = module.get<MessageService>(MessageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a message', async () => {
      const createMessageDto: CreateMessageDto = {
        senderId: '673fa9b1d5f7a1b3e56a3e12',
        receiverId: '673fa9b1d5f7a1b3e56a3e13',
        content: 'Hello, this is a test message',
      };

      mockMessageService.create.mockResolvedValue(mockMessage);

      const result = await controller.create(createMessageDto);

      expect(result).toEqual(mockMessage);
      expect(service.create).toHaveBeenCalledWith(createMessageDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of messages', async () => {
      const mockMessages = [mockMessage];

      mockMessageService.findAll.mockResolvedValue(mockMessages);

      const result = await controller.findAll();

      expect(result).toEqual(mockMessages);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no messages exist', async () => {
      mockMessageService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a single message by id', async () => {
      const messageId = '67409b2f88a7c7eae01c4e91';

      mockMessageService.findOne.mockResolvedValue(mockMessage);

      const result = await controller.findOne(messageId);

      expect(result).toEqual(mockMessage);
      expect(service.findOne).toHaveBeenCalledWith(messageId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('findByUsers', () => {
    it('should return messages filtered by sender and receiver', async () => {
      const senderId = '673fa9b1d5f7a1b3e56a3e12';
      const receiverId = '673fa9b1d5f7a1b3e56a3e13';
      const mockMessages = [mockMessage];

      mockMessageService.findByUsers.mockResolvedValue(mockMessages);

      const result = await controller.findByUsers(senderId, receiverId);

      expect(result).toEqual(mockMessages);
      expect(service.findByUsers).toHaveBeenCalledWith(senderId, receiverId);
      expect(service.findByUsers).toHaveBeenCalledTimes(1);
    });

    it('should return messages filtered by sender only', async () => {
      const senderId = '673fa9b1d5f7a1b3e56a3e12';
      const mockMessages = [mockMessage];

      mockMessageService.findByUsers.mockResolvedValue(mockMessages);

      const result = await controller.findByUsers(senderId, undefined);

      expect(result).toEqual(mockMessages);
      expect(service.findByUsers).toHaveBeenCalledWith(senderId, undefined);
    });

    it('should return messages filtered by receiver only', async () => {
      const receiverId = '673fa9b1d5f7a1b3e56a3e13';
      const mockMessages = [mockMessage];

      mockMessageService.findByUsers.mockResolvedValue(mockMessages);

      const result = await controller.findByUsers(undefined, receiverId);

      expect(result).toEqual(mockMessages);
      expect(service.findByUsers).toHaveBeenCalledWith(undefined, receiverId);
    });
  });

  describe('findByRoom', () => {
    it('should return messages by room id', async () => {
      const roomId = '67409b2f88a7c7eae01c4e91';
      const mockMessages = [{ ...mockMessage, roomId }];

      mockMessageService.findByRoom.mockResolvedValue(mockMessages);

      const result = await controller.findByRoom(roomId);

      expect(result).toEqual(mockMessages);
      expect(service.findByRoom).toHaveBeenCalledWith(roomId);
      expect(service.findByRoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('findConversation', () => {
    it('should return messages between two users', async () => {
      const userId1 = '673fa9b1d5f7a1b3e56a3e12';
      const userId2 = '673fa9b1d5f7a1b3e56a3e13';
      const mockMessages = [mockMessage];

      mockMessageService.findConversation.mockResolvedValue(mockMessages);

      const result = await controller.findConversation(userId1, userId2);

      expect(result).toEqual(mockMessages);
      expect(service.findConversation).toHaveBeenCalledWith(userId1, userId2);
      expect(service.findConversation).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('should update a message', async () => {
      const messageId = '67409b2f88a7c7eae01c4e91';
      const updateMessageDto: UpdateMessageDto = {
        content: 'Updated message content',
      };
      const updatedMessage = { ...mockMessage, ...updateMessageDto };

      mockMessageService.update.mockResolvedValue(updatedMessage);

      const result = await controller.update(messageId, updateMessageDto);

      expect(result).toEqual(updatedMessage);
      expect(service.update).toHaveBeenCalledWith(messageId, updateMessageDto);
      expect(service.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('should remove a message', async () => {
      const messageId = '67409b2f88a7c7eae01c4e91';

      mockMessageService.remove.mockResolvedValue(mockMessage);

      const result = await controller.remove(messageId);

      expect(result).toEqual(mockMessage);
      expect(service.remove).toHaveBeenCalledWith(messageId);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeByRoom', () => {
    it('should remove all messages from a room', async () => {
      const roomId = '67409b2f88a7c7eae01c4e91';
      const mockResponse = {
        deletedCount: 5,
        message: `Successfully deleted 5 messages from room ${roomId}`,
      };

      mockMessageService.removeByRoom.mockResolvedValue(mockResponse);

      const result = await controller.removeByRoom(roomId);

      expect(result).toEqual(mockResponse);
      expect(service.removeByRoom).toHaveBeenCalledWith(roomId);
      expect(service.removeByRoom).toHaveBeenCalledTimes(1);
    });
  });
});
