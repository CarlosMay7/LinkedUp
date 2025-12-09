import { MessageIdService } from '../../../src/modules/chat/application/services/message-id.service';

describe('MessageIdService', () => {
  let service: MessageIdService;

  beforeEach(() => {
    service = new MessageIdService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register and retrieve sender by messageId', () => {
    service.registerMessage('msg-1', 'user-1');
    const sender = service.getSenderIdByMessageId('msg-1');
    expect(sender).toBe('user-1');
  });

  it('should return null for unknown messageId', () => {
    const sender = service.getSenderIdByMessageId('unknown');
    expect(sender).toBeNull();
  });

  it('should unregister messageId', () => {
    service.registerMessage('msg-2', 'user-2');
    service.unregisterMessage('msg-2');
    const sender = service.getSenderIdByMessageId('msg-2');
    expect(sender).toBeNull();
  });
});
