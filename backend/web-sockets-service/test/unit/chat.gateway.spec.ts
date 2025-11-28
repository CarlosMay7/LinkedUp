import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from '../../src/modules/chat/infrastructure/gateways/chat.gateway';
import { Socket } from 'socket.io';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let mockSocket: Partial<Socket>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatGateway],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    mockSocket = {
      id: 'socket-123',
      emit: jest.fn(),
      join: jest.fn(),
      leave: jest.fn(),
      on: jest.fn(),
    } as Partial<Socket>;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should handle client connection', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      gateway.handleConnection(mockSocket as Socket);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle client disconnection', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      gateway.handleDisconnect(mockSocket as Socket);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('handleRegister', () => {
    it('should register a user', () => {
      const data = { userId: 'user-1' };
      const result = gateway.handleRegister(data, mockSocket as Socket);
      expect(result).toBeDefined();
      expect(result.data?.userId).toBe('user-1');
    });
  });

  describe('handleJoinRoom', () => {
    it('should join a room', async () => {
      const data = { roomId: 'room-1', userId: 'user-1' };
      const result = await gateway.handleJoinRoom(data, mockSocket as Socket);
      expect(mockSocket.join).toHaveBeenCalledWith('room-1');
      expect(result.data?.roomId).toBe('room-1');
    });
  });

  describe('handleLeaveRoom', () => {
    it('should leave a room', () => {
      const data = { roomId: 'room-1', userId: 'user-1' };
      const result = gateway.handleLeaveRoom(data, mockSocket as Socket);
      expect(mockSocket.leave).toHaveBeenCalledWith('room-1');
      expect(result.data?.roomId).toBe('room-1');
    });
  });

  describe('handleSendMessage', () => {
    it('should send a message', async () => {
      const data = { roomId: 'room-1', senderId: 'user-1', content: 'Hello' };
      const result = await gateway.handleSendMessage(data, mockSocket as Socket);
      expect(result.data && 'roomId' in result.data && result.data.roomId).toBe('room-1');
    });
  });

  describe('handleTyping', () => {
    it('should handle typing event', () => {
      const data = { roomId: 'room-1', userId: 'user-1', isTyping: true };
      gateway.handleTyping(data);
      expect(gateway.handleTyping).toBeDefined();
    });
  });
});
