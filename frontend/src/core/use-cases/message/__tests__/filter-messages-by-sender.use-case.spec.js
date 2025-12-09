import { FilterMessagesBySenderUseCase } from '../filter-messages-by-sender.use-case';

describe('FilterMessagesBySenderUseCase', () => {
    let filterMessagesBySenderUseCase;
    let mockMessageRepository;

    beforeEach(() => {
        mockMessageRepository = {
            getMessagesByRoom: jest.fn(),
        };
        filterMessagesBySenderUseCase = new FilterMessagesBySenderUseCase(
            mockMessageRepository
        );
    });

    describe('execute', () => {
        it('should filter messages by sender', async () => {
            const filterData = {
                roomId: 'room123',
                senderId: 'user123',
            };
            const messages = [
                {
                    id: 'msg1',
                    content: 'Message from user123',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:00:00Z',
                },
                {
                    id: 'msg2',
                    content: 'Message from user456',
                    senderId: 'user456',
                    sentAt: '2024-01-01T12:01:00Z',
                },
                {
                    id: 'msg3',
                    content: 'Another from user123',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:02:00Z',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(messages);

            const result =
                await filterMessagesBySenderUseCase.execute(filterData);

            expect(result).toHaveLength(2);
            expect(result[0].senderId).toBe('user123');
            expect(result[1].senderId).toBe('user123');
        });

        it('should throw error when room ID is missing', async () => {
            const filterData = {
                roomId: null,
                senderId: 'user123',
            };

            await expect(
                filterMessagesBySenderUseCase.execute(filterData)
            ).rejects.toThrow('Room ID and Sender ID are required');
        });

        it('should throw error when sender ID is missing', async () => {
            const filterData = {
                roomId: 'room123',
                senderId: null,
            };

            await expect(
                filterMessagesBySenderUseCase.execute(filterData)
            ).rejects.toThrow('Room ID and Sender ID are required');
        });

        it('should return empty array when no messages from sender', async () => {
            const filterData = {
                roomId: 'room123',
                senderId: 'nonexistent_user',
            };
            const messages = [
                {
                    id: 'msg1',
                    content: 'From user123',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:00:00Z',
                },
                {
                    id: 'msg2',
                    content: 'From user456',
                    senderId: 'user456',
                    sentAt: '2024-01-01T12:01:00Z',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(messages);

            const result =
                await filterMessagesBySenderUseCase.execute(filterData);

            expect(result).toEqual([]);
        });

        it('should return all messages when filtering by single sender', async () => {
            const filterData = {
                roomId: 'room123',
                senderId: 'user123',
            };
            const messages = [
                {
                    id: 'msg1',
                    content: 'Message 1',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:00:00Z',
                },
                {
                    id: 'msg2',
                    content: 'Message 2',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:01:00Z',
                },
                {
                    id: 'msg3',
                    content: 'Message 3',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:02:00Z',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(messages);

            const result =
                await filterMessagesBySenderUseCase.execute(filterData);

            expect(result).toHaveLength(3);
            result.forEach(msg => {
                expect(msg.senderId).toBe('user123');
            });
        });

        it('should handle repository error', async () => {
            const filterData = {
                roomId: 'room123',
                senderId: 'user123',
            };
            mockMessageRepository.getMessagesByRoom.mockRejectedValue(
                new Error('Database error')
            );

            await expect(
                filterMessagesBySenderUseCase.execute(filterData)
            ).rejects.toThrow('Error filtering messages');
        });

        it('should filter with exact sender ID match', async () => {
            const filterData = {
                roomId: 'room123',
                senderId: 'user123_exact',
            };
            const messages = [
                {
                    id: 'msg1',
                    content: 'From exact user',
                    senderId: 'user123_exact',
                    sentAt: '2024-01-01T12:00:00Z',
                },
                {
                    id: 'msg2',
                    content: 'From similar user',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:01:00Z',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(messages);

            const result =
                await filterMessagesBySenderUseCase.execute(filterData);

            expect(result).toHaveLength(1);
            expect(result[0].senderId).toBe('user123_exact');
        });

        it('should maintain message order after filtering', async () => {
            const filterData = {
                roomId: 'room123',
                senderId: 'user123',
            };
            const messages = [
                {
                    id: 'msg1',
                    content: 'First',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:00:00Z',
                },
                {
                    id: 'msg2',
                    content: 'From other user',
                    senderId: 'user456',
                    sentAt: '2024-01-01T12:01:00Z',
                },
                {
                    id: 'msg3',
                    content: 'Second',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:02:00Z',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(messages);

            const result =
                await filterMessagesBySenderUseCase.execute(filterData);

            expect(result[0].id).toBe('msg1');
            expect(result[1].id).toBe('msg3');
        });

        it('should handle network error', async () => {
            const filterData = {
                roomId: 'room123',
                senderId: 'user123',
            };
            mockMessageRepository.getMessagesByRoom.mockRejectedValue(
                new Error('Network error')
            );

            await expect(
                filterMessagesBySenderUseCase.execute(filterData)
            ).rejects.toThrow('Error filtering messages');
        });
    });
});
