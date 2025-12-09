import { Test, TestingModule } from '@nestjs/testing';
import { OnlineUsersService } from '../../../src/modules/chat/application/services/online-users.service';
import { SESSION_MANAGER } from '../../../src/modules/chat/infrastructure/interfaces/session-manager.interface';

describe('OnlineUsersService', () => {
  let service: OnlineUsersService;
  let mockSessionManager: any;

  beforeEach(async () => {
    mockSessionManager = {
      getUserIdBySocketId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnlineUsersService,
        {
          provide: SESSION_MANAGER,
          useValue: mockSessionManager,
        },
      ],
    }).compile();

    service = module.get<OnlineUsersService>(OnlineUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return online users in room', () => {
    const sockets = new Set<string>(['s1', 's2', 's3']);
    mockSessionManager.getUserIdBySocketId.mockImplementation(
      (socketId: string) => {
        const map: Record<string, string> = { s1: 'u1', s2: 'u2' };
        return map[socketId];
      },
    );

    const result = service.getOnlineUsersInRoom('room-1', sockets);
    expect(result).toEqual(['u1', 'u2']);
  });

  it('should return empty array when roomId or sockets missing', () => {
    expect(service.getOnlineUsersInRoom('', new Set())).toEqual([]);
    expect(service.getOnlineUsersInRoom('room-1', undefined as any)).toEqual(
      [],
    );
  });
});
