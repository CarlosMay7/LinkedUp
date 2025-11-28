import { SocketIOAdapter } from '../../src/modules/chat/infrastructure/adapters/socket-io.adapter';
import { INestApplication } from '@nestjs/common';

describe('SocketIOAdapter', () => {
  let adapter: SocketIOAdapter;
  let mockApp: Partial<INestApplication>;

  beforeEach(() => {
    mockApp = {
      getHttpServer: jest.fn().mockReturnValue({
        on: jest.fn(),
      }),
    } as Partial<INestApplication>;

    adapter = new SocketIOAdapter(mockApp as INestApplication);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should create a Socket.IO server instance', () => {
    const ioServer = adapter.createIOServer(3002, {
      cors: { origin: '*' },
      path: '',
      serveClient: false,
      adapter: undefined,
      parser: undefined,
      connectTimeout: 0,
      connectionStateRecovery: {
        maxDisconnectionDuration: 0,
        skipMiddlewares: false,
      },
      cleanupEmptyChildNamespaces: false,
    });
    expect(ioServer).toBeDefined();
  });

  it('should attach namespaces correctly', () => {
    const ioServer = adapter.createIOServer(3002, {
      cors: { origin: '*' },
      path: '',
      serveClient: false,
      adapter: undefined,
      parser: undefined,
      connectTimeout: 0,
      connectionStateRecovery: {
        maxDisconnectionDuration: 0,
        skipMiddlewares: false,
      },
      cleanupEmptyChildNamespaces: false,
    });
    expect(ioServer).toHaveProperty('on');
  });
});
