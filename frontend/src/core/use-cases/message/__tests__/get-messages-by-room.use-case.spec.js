import { GetMessagesByRoomUseCase } from '../get-messages-by-room.use-case';

describe('GetMessagesByRoomUseCase', () => {
    let getMessagesByRoomUseCase;
    let mockMessageRepository;

    beforeEach(() => {
        mockMessageRepository = {
            getMessagesByRoom: jest.fn(),
        };
        getMessagesByRoomUseCase = new GetMessagesByRoomUseCase(
            mockMessageRepository
        );
    });

    describe('execute', () => {
        it('should retrieve and sort messages by room', async () => {
            const roomId = 'room123';
            const unsortedMessages = [
                {
                    id: 'msg3',
                    content: 'Third message',
                    sentAt: '2024-01-01T12:03:00Z',
                    senderId: 'user123',
                },
                {
                    id: 'msg1',
                    content: 'First message',
                    sentAt: '2024-01-01T12:01:00Z',
                    senderId: 'user123',
                },
                {
                    id: 'msg2',
                    content: 'Second message',
                    sentAt: '2024-01-01T12:02:00Z',
                    senderId: 'user456',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(
                unsortedMessages
            );

            const result = await getMessagesByRoomUseCase.execute({ roomId });

            expect(result).toHaveLength(3);
            expect(result[0].id).toBe('msg1');
            expect(result[1].id).toBe('msg2');
            expect(result[2].id).toBe('msg3');
        });

        it('should throw error when room ID is missing', async () => {
            const roomData = {
                roomId: null,
            };

            await expect(
                getMessagesByRoomUseCase.execute(roomData)
            ).rejects.toThrow('Room ID is required');
        });

        it('should return empty array when no messages exist', async () => {
            const roomId = 'empty_room';
            mockMessageRepository.getMessagesByRoom.mockResolvedValue([]);

            const result = await getMessagesByRoomUseCase.execute({ roomId });

            expect(result).toEqual([]);
        });

        it('should handle messages with same timestamp', async () => {
            const roomId = 'room123';
            const messages = [
                {
                    id: 'msg1',
                    content: 'First',
                    sentAt: '2024-01-01T12:00:00Z',
                    senderId: 'user123',
                },
                {
                    id: 'msg2',
                    content: 'Second',
                    sentAt: '2024-01-01T12:00:00Z',
                    senderId: 'user456',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(messages);

            const result = await getMessagesByRoomUseCase.execute({ roomId });

            expect(result).toHaveLength(2);
        });

        it('should throw error when repository fails', async () => {
            const roomId = 'room123';
            mockMessageRepository.getMessagesByRoom.mockRejectedValue(
                new Error('Database error')
            );

            await expect(
                getMessagesByRoomUseCase.execute({ roomId })
            ).rejects.toThrow('Error fetching messages');
        });

        it('should sort messages in ascending order by time', async () => {
            const roomId = 'room123';
            const messages = [
                {
                    id: 'msg1',
                    content: 'Old message',
                    sentAt: '2024-01-01T08:00:00Z',
                    senderId: 'user123',
                },
                {
                    id: 'msg2',
                    content: 'New message',
                    sentAt: '2024-01-01T20:00:00Z',
                    senderId: 'user456',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(
                messages.reverse()
            );

            const result = await getMessagesByRoomUseCase.execute({ roomId });

            expect(new Date(result[0].sentAt).getTime()).toBeLessThan(
                new Date(result[1].sentAt).getTime()
            );
        });

        it('should handle messages with various date formats', async () => {
            const roomId = 'room123';
            const messages = [
                {
                    id: 'msg1',
                    content: 'Message 1',
                    sentAt: new Date('2024-01-01T10:00:00').toISOString(),
                    senderId: 'user123',
                },
                {
                    id: 'msg2',
                    content: 'Message 2',
                    sentAt: new Date('2024-01-01T11:00:00').toISOString(),
                    senderId: 'user456',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(messages);

            const result = await getMessagesByRoomUseCase.execute({ roomId });

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('msg1');
            expect(result[1].id).toBe('msg2');
        });

        it('should handle network error', async () => {
            const roomId = 'room123';
            mockMessageRepository.getMessagesByRoom.mockRejectedValue(
                new Error('Network error')
            );

            await expect(
                getMessagesByRoomUseCase.execute({ roomId })
            ).rejects.toThrow('Error fetching messages');
        });
    });
});
