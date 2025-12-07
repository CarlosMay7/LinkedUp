import { Test, TestingModule } from '@nestjs/testing';
import { TypingService } from '../../../src/modules/chat/application/services/typing.service';
import { MESSAGE_BROKER } from '../../../src/modules/chat/infrastructure/interfaces/message-broker.interface';

describe('TypingService', () => {
  let service: TypingService;
  let mockMessageBroker: any;

  beforeEach(async () => {
    mockMessageBroker = {
      broadcastToRoom: jest.fn(),
      notifyUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypingService,
        {
          provide: MESSAGE_BROKER,
          useValue: mockMessageBroker,
        },
      ],
    }).compile();

    service = module.get<TypingService>(TypingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('notifyTyping', () => {
    it('should broadcast typing event to room', () => {
      service.notifyTyping('user1', 'room1');
      
      expect(mockMessageBroker.broadcastToRoom).toHaveBeenCalledWith(
        'room1',
        'typing',
        expect.objectContaining({
          userId: 'user1',
          roomId: 'room1',
        })
      );
    });

    it('should notify private typing to specific user', () => {
      service.notifyTyping('user1', undefined, 'user2');
      
      expect(mockMessageBroker.notifyUser).toHaveBeenCalledWith(
        'user2',
        'typing',
        expect.objectContaining({
          userId: 'user1',
          receiverId: 'user2',
        })
      );
    });

    it('should not notify if neither roomId nor receiverId provided', () => {
      service.notifyTyping('user1');
      
      expect(mockMessageBroker.broadcastToRoom).not.toHaveBeenCalled();
      expect(mockMessageBroker.notifyUser).not.toHaveBeenCalled();
    });
  });
});
