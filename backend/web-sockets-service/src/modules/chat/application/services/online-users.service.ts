import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  SESSION_MANAGER,
  ISessionManager,
} from '../../infrastructure/interfaces/session-manager.interface';

@Injectable()
export class OnlineUsersService {
  private readonly logger = new Logger(OnlineUsersService.name);

  constructor(
    @Inject(SESSION_MANAGER) private readonly sessionManager: ISessionManager,
  ) {}

  getOnlineUsersInRoom(roomId: string, sockets: Set<string>): string[] {
    try {
      if (!roomId || !sockets) {
        this.logger.warn('Cannot get online users: missing roomId or sockets');
        return [];
      }

      const onlineUsers: string[] = [];
      sockets.forEach((socketId) => {
        const userId = this.sessionManager.getUserIdBySocketId(socketId);
        if (userId) {
          onlineUsers.push(userId);
        }
      });

      this.logger.debug(
        `Retrieved ${onlineUsers.length} online users in room ${roomId}`,
      );
      return onlineUsers;
    } catch (error) {
      this.logger.error(`Error getting online users: ${error.message}`);
      return [];
    }
  }
}
