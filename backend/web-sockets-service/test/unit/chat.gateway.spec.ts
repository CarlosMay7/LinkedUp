import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from '../../src/modules/chat/infrastructure/gateways/chat.gateway';
import { SessionService } from '../../src/modules/chat/application/services/session.service';
import { TypingService } from '../../src/modules/chat/application/services/typing.service';
import { MessageStatusService } from '../../src/modules/chat/application/services/message-status.service';
import { MessageIdService } from '../../src/modules/chat/application/services/message-id.service';
import { OnlineUsersService } from '../../src/modules/chat/application/services/online-users.service';
import { SocketIOMessageBroker } from '../../src/modules/chat/infrastructure/adapters/socketio-message-broker.adapter';
import {
  IEventProducer,
  EVENT_PRODUCER,
} from '../../src/modules/chat/infrastructure/interfaces/event-producer.interface';
import { Socket, Server } from 'socket.io';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let mockSocket: Partial<Socket>;
  let mockSessionService: Partial<SessionService>;
  let mockTypingService: Partial<TypingService>;
  let mockMessageStatusService: Partial<MessageStatusService>;
  let mockMessageBroker: Partial<SocketIOMessageBroker>;
  let mockMessageIdService: Partial<MessageIdService>;
  let mockOnlineUsersService: Partial<OnlineUsersService>;
  let mockEventProducer: Partial<IEventProducer>;

  beforeEach(async () => {
    mockSessionService = {
      registerUser: jest.fn(),
      unregisterUser: jest.fn(),
      getUserSocketId: jest.fn(),
      getUserIdBySocketId: jest.fn(),
    };

    mockTypingService = {
      notifyTyping: jest.fn(),
    };

    mockMessageStatusService = {
      notifyMessageDelivered: jest.fn(),
      notifyMessageRead: jest.fn(),
    };

    mockMessageBroker = {
      setServer: jest.fn(),
    };

    mockMessageIdService = {
      registerMessage: jest.fn(),
      getSenderIdByMessageId: jest.fn().mockReturnValue('sender-1'),
      unregisterMessage: jest.fn(),
    };

    mockOnlineUsersService = {
      getOnlineUsersInRoom: jest.fn().mockReturnValue(['user-1', 'user-2']),
    };

    mockEventProducer = {
      publishMessageCreated: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
        {
          provide: TypingService,
          useValue: mockTypingService,
        },
        {
          provide: MessageStatusService,
          useValue: mockMessageStatusService,
        },
        {
          provide: SocketIOMessageBroker,
          useValue: mockMessageBroker,
        },
        {
          provide: MessageIdService,
          useValue: mockMessageIdService,
        },
        {
          provide: OnlineUsersService,
          useValue: mockOnlineUsersService,
        },
        {
          provide: EVENT_PRODUCER,
          useValue: mockEventProducer,
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    mockSocket = {
      id: 'socket-123',
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      on: jest.fn(),
      to: jest.fn().mockReturnThis(),
    } as Partial<Socket>;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit', () => {
    it('should initialize gateway with server', () => {
      const mockServer = {} as Server;
      gateway.afterInit(mockServer);
      expect(mockMessageBroker.setServer).toHaveBeenCalledWith(mockServer);
    });
  });

  describe('handleConnection', () => {
    it('should handle client connection', () => {
      gateway.handleConnection(mockSocket as Socket);
      expect(mockSocket.id).toBe('socket-123');
    });
  });

  describe('handleDisconnect', () => {
    it('should unregister user on disconnect', () => {
      gateway.handleDisconnect(mockSocket as Socket);
      expect(mockSessionService.unregisterUser).toHaveBeenCalledWith('socket-123');
    });
  });

  describe('handleRegister', () => {
    it('should register a user with socket', () => {
      const data = { userId: 'user-1' };
      const result = gateway.handleRegister(data, mockSocket as Socket);
      
      expect(mockSessionService.registerUser).toHaveBeenCalledWith('user-1', 'socket-123');
      expect(mockSocket.join).toHaveBeenCalledWith('user-1');
      expect(result).toBeDefined();
      expect(result.data?.userId).toBe('user-1');
    });
  });

  describe('handleJoinRoom', () => {
    it('should join a room', () => {
      const data = { roomId: 'room-1', userId: 'user-1' };
      // Ensure server.rooms and server.to are defined so gateway methods do not throw
      gateway.server = {
        sockets: { adapter: { rooms: new Map() } },
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      } as any;

      const result = gateway.handleJoinRoom(data, mockSocket as Socket);
      expect(mockSocket.join).toHaveBeenCalledWith('room-1');
      expect(result.data?.roomId).toBe('room-1');
    });
  });

  describe('handleLeaveRoom', () => {
    it('should leave a room', () => {
      const data = { roomId: 'room-1', userId: 'user-1' };
      // Ensure server.rooms and server.to are defined so gateway methods do not throw
      gateway.server = {
        sockets: { adapter: { rooms: new Map() } },
        to: jest.fn().mockReturnValue({ emit: jest.fn() }),
      } as any;

      const result = gateway.handleLeaveRoom(data, mockSocket as Socket);
      expect(mockSocket.leave).toHaveBeenCalledWith('room-1');
      expect(result.data?.roomId).toBe('room-1');
    });
  });

  describe('handleSendMessage', () => {
    it('should publish message to Kafka and emit queued acknowledgment', async () => {
      const data = { roomId: 'room-1', senderId: 'user-1', content: 'Hello' };
      const result = await gateway.handleSendMessage(data, mockSocket as Socket);
      
      expect(mockEventProducer.publishMessageCreated).toHaveBeenCalledWith({
        senderId: 'user-1',
        content: 'Hello',
        roomId: 'room-1',
        receiverId: undefined,
        timestamp: expect.any(Number),
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('messageQueued', expect.objectContaining({
        status: 'queued',
        roomId: 'room-1',
      }));
      expect(result.event).toBe('messageQueued');
    });

    it('should handle private messages', async () => {
      const data = { receiverId: 'user-2', senderId: 'user-1', content: 'Hello' };
      const result = await gateway.handleSendMessage(data, mockSocket as Socket);
      
      expect(mockEventProducer.publishMessageCreated).toHaveBeenCalledWith({
        senderId: 'user-1',
        content: 'Hello',
        roomId: undefined,
        receiverId: 'user-2',
        timestamp: expect.any(Number),
      });
      expect(result.event).toBe('messageQueued');
    });

    it('should handle Kafka errors gracefully', async () => {
      (mockEventProducer.publishMessageCreated as jest.Mock).mockRejectedValue(
        new Error('Kafka connection failed')
      );
      
      const data = { roomId: 'room-1', senderId: 'user-1', content: 'Hello' };
      const result = await gateway.handleSendMessage(data, mockSocket as Socket);
      
      expect(mockSocket.emit).toHaveBeenCalledWith('messageError', expect.objectContaining({
        error: expect.any(String),
      }));
      expect(result.event).toBe('messageError');
    });
  });

  describe('handleTyping', () => {
    it('should notify typing in room', () => {
      const data = { roomId: 'room-1', userId: 'user-1', isTyping: true };
      gateway.handleTyping(data);
      
      expect(mockTypingService.notifyTyping).toHaveBeenCalledWith(
        'user-1',
        'room-1',
        undefined
      );
    });

    it('should notify typing to specific user', () => {
      const data = { userId: 'user-1', receiverId: 'user-2', isTyping: true };
      gateway.handleTyping(data);
      
      expect(mockTypingService.notifyTyping).toHaveBeenCalledWith(
        'user-1',
        undefined,
        'user-2'
      );
    });
  });

  describe('handleMessageDelivered', () => {
    it('should mark message as delivered when sender is found', () => {
      const data = { messageId: 'msg-1', userId: 'user-1' };
      
      gateway.handleMessageDelivered(data);
      
      expect(mockMessageStatusService.notifyMessageDelivered).toHaveBeenCalledWith(
        'msg-1',
        'sender-1',
        'user-1'
      );
      expect(mockMessageIdService.unregisterMessage).toHaveBeenCalledWith('msg-1');
    });

    it('should not notify when sender is not found', () => {
      const data = { messageId: 'msg-2', userId: 'user-1' };
      
      // Mock getSenderIdByMessageId to return null
      (mockMessageIdService.getSenderIdByMessageId as jest.Mock).mockReturnValueOnce(null);
      
      gateway.handleMessageDelivered(data);
      
      expect(mockMessageStatusService.notifyMessageDelivered).not.toHaveBeenCalled();
    });
  });

  describe('handleMessageRead', () => {
    it('should mark message as read when sender is found', () => {
      const data = { messageId: 'msg-1', userId: 'user-1' };
      
      gateway.handleMessageRead(data);
      
      expect(mockMessageStatusService.notifyMessageRead).toHaveBeenCalledWith(
        'msg-1',
        'sender-1',
        'user-1'
      );
      expect(mockMessageIdService.unregisterMessage).toHaveBeenCalledWith('msg-1');
    });

    it('should not notify when sender is not found', () => {
      const data = { messageId: 'msg-2', userId: 'user-1' };
      
      // Mock getSenderIdByMessageId to return null
      (mockMessageIdService.getSenderIdByMessageId as jest.Mock).mockReturnValueOnce(null);
      
      gateway.handleMessageRead(data);
      
      expect(mockMessageStatusService.notifyMessageRead).not.toHaveBeenCalled();
    });
  });

  describe('handleGetOnlineUsers', () => {
    it('should return list of online users in room', () => {
      const data = { roomId: 'room-1' };
      
      // Mock server and room sockets
      gateway.server = {
        sockets: {
          adapter: {
            rooms: new Map([['room-1', new Set(['socket1', 'socket2'])]])
          }
        }
      } as any;
      
      (mockSessionService.getUserIdBySocketId as jest.Mock)
        .mockReturnValueOnce('user-1')
        .mockReturnValueOnce('user-2');
      
      gateway.handleGetOnlineUsers(data, mockSocket as Socket);

      expect(mockSocket.emit).toHaveBeenCalledWith('onlineUsers', ['user-1', 'user-2']);
    });
  });
});
