import { MessageRepository } from '../message.repository';

describe('MessageRepository', () => {
    let messageRepository;
    let mockDbClient;

    beforeEach(() => {
        mockDbClient = {};
        messageRepository = new MessageRepository(mockDbClient);

        // Mock fetch globally
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getMessagesByRoom', () => {
        it('should fetch messages by room ID', async () => {
            const mockMessages = [
                {
                    id: '1',
                    content: 'Hello',
                    roomId: 'room-123',
                    senderId: 'user-1',
                },
                {
                    id: '2',
                    content: 'Hi there',
                    roomId: 'room-123',
                    senderId: 'user-2',
                },
            ];

            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockMessages),
            });

            const result =
                await messageRepository.getMessagesByRoom('room-123');

            expect(global.fetch).toHaveBeenCalled();
            expect(result).toEqual(mockMessages);
            expect(result).toHaveLength(2);
        });

        it('should throw error on HTTP error', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                status: 500,
            });

            await expect(
                messageRepository.getMessagesByRoom('room-123')
            ).rejects.toThrow('HTTP error! status: 500');
        });

        it('should handle network errors', async () => {
            const networkError = new Error('Network error');
            global.fetch.mockRejectedValue(networkError);

            await expect(
                messageRepository.getMessagesByRoom('room-123')
            ).rejects.toThrow('Network error');
        });

        it('should use correct API endpoint', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue([]),
            });

            await messageRepository.getMessagesByRoom('room-456');

            const callUrl = global.fetch.mock.calls[0][0];
            expect(callUrl).toContain('/messages/room/room-456');
        });

        it('should handle empty messages response', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue([]),
            });

            const result =
                await messageRepository.getMessagesByRoom('room-empty');

            expect(result).toEqual([]);
        });
    });
});
