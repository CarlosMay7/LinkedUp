import { SocketIOAdapter } from '../../src/modules/chat/infrastructure/adapters/socket-io.adapter';
import { INestApplication } from '@nestjs/common';

describe('SocketIOAdapter', () => {
  let adapter: SocketIOAdapter;
  let mockApp: Partial<INestApplication>;

  beforeEach(() => {
    mockApp = {
      getHttpServer: jest.fn().mockReturnValue({
        on: jest.fn(),
        listen: jest.fn(),
      }),
    } as Partial<INestApplication>;

    adapter = new SocketIOAdapter(mockApp as INestApplication);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  it('should extend IoAdapter', () => {
    expect(adapter).toBeInstanceOf(SocketIOAdapter);
  });
});
