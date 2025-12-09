export interface ISessionManager {
  registerUser(userId: string, socketId: string): void;
  unregisterUser(socketId: string): string | null;
  getUserSocketId(userId: string): string | null;
  getUserIdBySocketId(socketId: string): string | null;
  isUserOnline(userId: string): boolean;
}

export const SESSION_MANAGER = Symbol('SESSION_MANAGER');
