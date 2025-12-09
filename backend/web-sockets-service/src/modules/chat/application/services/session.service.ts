import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  ISessionManager,
  SESSION_MANAGER,
} from '../../infrastructure/interfaces/session-manager.interface';

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    @Inject(SESSION_MANAGER)
    private readonly sessionManager: ISessionManager,
  ) {}

  registerUser(userId: string, socketId: string): void {
    try {
      if (!userId || !socketId) {
        this.logger.warn('Cannot register user: missing userId or socketId');
        return;
      }

      this.sessionManager.registerUser(userId, socketId);
      this.logger.debug(`User registered: ${userId} → ${socketId}`);
    } catch (error) {
      this.logger.error(`Error registering user: ${error.message}`);
    }
  }

  unregisterUser(socketId: string): string | null {
    try {
      if (!socketId) {
        this.logger.warn('Cannot unregister user: missing socketId');
        return null;
      }

      const userId = this.sessionManager.unregisterUser(socketId);
      if (userId) {
        this.logger.debug(`User unregistered: ${userId}`);
      }
      return userId;
    } catch (error) {
      this.logger.error(`Error unregistering user: ${error.message}`);
      return null;
    }
  }

  getUserSocketId(userId: string): string | null {
    try {
      if (!userId) {
        return null;
      }
      return this.sessionManager.getUserSocketId(userId);
    } catch (error) {
      this.logger.error(`Error getting user socket: ${error.message}`);
      return null;
    }
  }

  getUserIdBySocketId(socketId: string): string | null {
    try {
      if (!socketId) {
        return null;
      }
      return this.sessionManager.getUserIdBySocketId(socketId);
    } catch (error) {
      this.logger.error(`Error getting user by socket: ${error.message}`);
      return null;
    }
  }

  isUserOnline(userId: string): boolean {
    try {
      if (!userId) {
        return false;
      }
      return this.sessionManager.isUserOnline(userId);
    } catch (error) {
      this.logger.error(`Error checking user online status: ${error.message}`);
      return false;
    }
  }
}
