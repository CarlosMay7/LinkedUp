import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from '../../../src/modules/chat/application/services/session.service';
import { SESSION_MANAGER } from '../../../src/modules/chat/infrastructure/interfaces/session-manager.interface';

describe('SessionService', () => {
  let service: SessionService;
  let mockSessionManager: any;

  beforeEach(async () => {
    mockSessionManager = {
      registerUser: jest.fn(),
      unregisterUser: jest.fn(),
      getUserSocketId: jest.fn(),
      getUserIdBySocketId: jest.fn(),
      isUserOnline: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: SESSION_MANAGER,
          useValue: mockSessionManager,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerUser', () => {
    it('should register a user with socket ID', () => {
      service.registerUser('user1', 'socket123');
      expect(mockSessionManager.registerUser).toHaveBeenCalledWith('user1', 'socket123');
    });
  });

  describe('unregisterUser', () => {
    it('should unregister a user by socket ID', () => {
      service.unregisterUser('socket123');
      expect(mockSessionManager.unregisterUser).toHaveBeenCalledWith('socket123');
    });
  });

  describe('getUserSocketId', () => {
    it('should return socket ID for a user', () => {
      mockSessionManager.getUserSocketId.mockReturnValue('socket123');
      const result = service.getUserSocketId('user1');
      expect(mockSessionManager.getUserSocketId).toHaveBeenCalledWith('user1');
      expect(result).toBe('socket123');
    });

    it('should return undefined if user not found', () => {
      mockSessionManager.getUserSocketId.mockReturnValue(undefined);
      const result = service.getUserSocketId('unknown');
      expect(result).toBeUndefined();
    });
  });

  describe('getUserIdBySocketId', () => {
    it('should return userId for a socket ID', () => {
      mockSessionManager.getUserIdBySocketId.mockReturnValue('user1');
      const result = service.getUserIdBySocketId('socket123');
      expect(mockSessionManager.getUserIdBySocketId).toHaveBeenCalledWith('socket123');
      expect(result).toBe('user1');
    });
  });

  describe('isUserOnline', () => {
    it('should return true if user is online', () => {
      mockSessionManager.isUserOnline.mockReturnValue(true);
      const result = service.isUserOnline('user1');
      expect(mockSessionManager.isUserOnline).toHaveBeenCalledWith('user1');
      expect(result).toBe(true);
    });

    it('should return false if user is not online', () => {
      mockSessionManager.isUserOnline.mockReturnValue(false);
      const result = service.isUserOnline('user1');
      expect(result).toBe(false);
    });
  });
});
