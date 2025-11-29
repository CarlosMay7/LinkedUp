import { Inject, Injectable } from '@nestjs/common';
import {
  ISessionManager,
  SESSION_MANAGER,
} from '../../domain/interfaces/session-manager.interface';

@Injectable()
export class SessionService {
  constructor(
    @Inject(SESSION_MANAGER)
    private readonly sessionManager: ISessionManager,
  ) {}

  registerUser(userId: string, socketId: string): void {
    this.sessionManager.registerUser(userId, socketId);
  }

  unregisterUser(socketId: string): string | null {
    return this.sessionManager.unregisterUser(socketId);
  }

  getUserSocketId(userId: string): string | null {
    return this.sessionManager.getUserSocketId(userId);
  }

  getUserIdBySocketId(socketId: string): string | null {
    return this.sessionManager.getUserIdBySocketId(socketId);
  }

  isUserOnline(userId: string): boolean {
    return this.sessionManager.isUserOnline(userId);
  }
}
