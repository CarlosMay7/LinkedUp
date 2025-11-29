import { Injectable, Logger } from '@nestjs/common';
import { ISessionManager } from '../../domain/interfaces/session-manager.interface';
import { UserSessionEntity } from '../../domain/entities/user-session.entity';

@Injectable()
export class InMemorySessionManager implements ISessionManager {
  private readonly logger = new Logger(InMemorySessionManager.name);
  private readonly userSessions = new Map<string, UserSessionEntity>();
  private readonly socketToUser = new Map<string, string>();

  registerUser(userId: string, socketId: string): void {
    const session = new UserSessionEntity(userId, socketId, new Date());
    this.userSessions.set(userId, session);
    this.socketToUser.set(socketId, userId);
    this.logger.log(`User ${userId} registered with socket ${socketId}`);
  }

  unregisterUser(socketId: string): string | null {
    const userId = this.socketToUser.get(socketId);
    if (userId) {
      this.userSessions.delete(userId);
      this.socketToUser.delete(socketId);
      this.logger.log(`User ${userId} unregistered (socket: ${socketId})`);
      return userId;
    }
    return null;
  }

  getUserSocketId(userId: string): string | null {
    const session = this.userSessions.get(userId);
    return session ? session.socketId : null;
  }

  getUserIdBySocketId(socketId: string): string | null {
    return this.socketToUser.get(socketId) || null;
  }

  isUserOnline(userId: string): boolean {
    return this.userSessions.has(userId);
  }

  getAllOnlineUsers(): string[] {
    return Array.from(this.userSessions.keys());
  }
}
