import { Test, TestingModule } from '@nestjs/testing';
import { MessageStatusService } from '../../../src/modules/chat/application/services/message-status.service';
import { MESSAGE_BROKER } from '../../../src/modules/chat/domain/interfaces/message-broker.interface';

describe('MessageStatusService', () => {
  let service: MessageStatusService;
  let mockMessageBroker: any;

  beforeEach(async () => {
    mockMessageBroker = {
      notifyUser: jest.fn(),
      broadcastToRoom: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageStatusService,
        {
          provide: MESSAGE_BROKER,
          useValue: mockMessageBroker,
        },
      ],
    }).compile();

    service = module.get<MessageStatusService>(MessageStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('notifyMessageDelivered', () => {
    it('should notify sender that private message was delivered', () => {
      service.notifyMessageDelivered('msg123', 'user1', 'user2');
      
      expect(mockMessageBroker.notifyUser).toHaveBeenCalledWith(
        'user1',
        'message:delivered',
        expect.objectContaining({
          messageId: 'msg123',
        })
      );
    });

    it('should broadcast that room message was delivered', () => {
      service.notifyMessageDelivered('msg123', 'user1', undefined, 'room1');
      
      expect(mockMessageBroker.broadcastToRoom).toHaveBeenCalledWith(
        'room1',
        'message:delivered',
        expect.objectContaining({
          messageId: 'msg123',
        })
      );
    });
  });

  describe('notifyMessageRead', () => {
    it('should notify sender that private message was read', () => {
      service.notifyMessageRead('msg123', 'user1', 'user2');
      
      expect(mockMessageBroker.notifyUser).toHaveBeenCalledWith(
        'user1',
        'message:read',
        expect.objectContaining({
          messageId: 'msg123',
        })
      );
    });

    it('should broadcast that room message was read', () => {
      service.notifyMessageRead('msg123', 'user1', undefined, 'room1');
      
      expect(mockMessageBroker.broadcastToRoom).toHaveBeenCalledWith(
        'room1',
        'message:read',
        expect.objectContaining({
          messageId: 'msg123',
        })
      );
    });
  });
});
