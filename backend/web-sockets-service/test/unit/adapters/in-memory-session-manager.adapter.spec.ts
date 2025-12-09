import { InMemorySessionManager } from '../../../src/modules/chat/infrastructure/adapters/in-memory-session-manager.adapter';

describe('InMemorySessionManager', () => {
  let sessionManager: InMemorySessionManager;

  beforeEach(() => {
    sessionManager = new InMemorySessionManager();
  });

  describe('registerUser', () => {
    it('should register a user with socket ID', () => {
      sessionManager.registerUser('user1', 'socket123');
      const socketId = sessionManager.getUserSocketId('user1');
      expect(socketId).toBe('socket123');
    });

    it('should update socket ID if user registers again', () => {
      sessionManager.registerUser('user1', 'socket123');
      sessionManager.registerUser('user1', 'socket456');
      const socketId = sessionManager.getUserSocketId('user1');
      expect(socketId).toBe('socket456');
    });
  });

  describe('unregisterUser', () => {
    it('should unregister a user by socket ID', () => {
      sessionManager.registerUser('user1', 'socket123');
      sessionManager.unregisterUser('socket123');
      const socketId = sessionManager.getUserSocketId('user1');
      expect(socketId).toBeNull();
    });

    it('should handle unregistering non-existent socket', () => {
      expect(() => sessionManager.unregisterUser('nonexistent')).not.toThrow();
    });
  });

  describe('getUserSocketId', () => {
    it('should return socket ID for registered user', () => {
      sessionManager.registerUser('user1', 'socket123');
      const socketId = sessionManager.getUserSocketId('user1');
      expect(socketId).toBe('socket123');
    });

    it('should return null for unregistered user', () => {
      const socketId = sessionManager.getUserSocketId('unknown');
      expect(socketId).toBeNull();
    });
  });

  describe('getAllOnlineUsers', () => {
    it('should return list of online user IDs', () => {
      sessionManager.registerUser('user1', 'socket1');
      sessionManager.registerUser('user2', 'socket2');
      sessionManager.registerUser('user3', 'socket3');

      const users = sessionManager.getAllOnlineUsers();
      expect(users).toEqual(['user1', 'user2', 'user3']);
    });

    it('should return empty array when no users online', () => {
      const users = sessionManager.getAllOnlineUsers();
      expect(users).toEqual([]);
    });

    it('should not include unregistered users', () => {
      sessionManager.registerUser('user1', 'socket1');
      sessionManager.registerUser('user2', 'socket2');
      sessionManager.unregisterUser('socket2');

      const users = sessionManager.getAllOnlineUsers();
      expect(users).toEqual(['user1']);
    });
  });
});
