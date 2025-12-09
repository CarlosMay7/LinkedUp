import { SearchMessagesUseCase } from '../search-messages.use-case';

describe('SearchMessagesUseCase', () => {
    let searchMessagesUseCase;
    let mockMessageRepository;

    beforeEach(() => {
        mockMessageRepository = {
            getMessagesByRoom: jest.fn(),
        };
        searchMessagesUseCase = new SearchMessagesUseCase(
            mockMessageRepository
        );
    });

    describe('execute', () => {
        it('should search and find matching messages', async () => {
            const searchData = {
                roomId: 'room123',
                query: 'hello',
            };
            const messages = [
                {
                    id: 'msg1',
                    content: 'Hello world',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:00:00Z',
                },
                {
                    id: 'msg2',
                    content: 'How are you',
                    senderId: 'user456',
                    sentAt: '2024-01-01T12:01:00Z',
                },
                {
                    id: 'msg3',
                    content: 'Hello again',
                    senderId: 'user789',
                    sentAt: '2024-01-01T12:02:00Z',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(messages);

            const result = await searchMessagesUseCase.execute(searchData);

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('msg1');
            expect(result[1].id).toBe('msg3');
        });

        it('should be case insensitive', async () => {
            const searchData = {
                roomId: 'room123',
                query: 'HELLO',
            };
            const messages = [
                {
                    id: 'msg1',
                    content: 'hello world',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:00:00Z',
                },
                {
                    id: 'msg2',
                    content: 'Hello there',
                    senderId: 'user456',
                    sentAt: '2024-01-01T12:01:00Z',
                },
                {
                    id: 'msg3',
                    content: 'goodbye',
                    senderId: 'user789',
                    sentAt: '2024-01-01T12:02:00Z',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(messages);

            const result = await searchMessagesUseCase.execute(searchData);

            expect(result).toHaveLength(2);
        });

        it('should throw error when room ID is missing', async () => {
            const searchData = {
                roomId: null,
                query: 'test',
            };

            await expect(
                searchMessagesUseCase.execute(searchData)
            ).rejects.toThrow('Room ID and search query are required');
        });

        it('should throw error when search query is missing', async () => {
            const searchData = {
                roomId: 'room123',
                query: null,
            };

            await expect(
                searchMessagesUseCase.execute(searchData)
            ).rejects.toThrow('Room ID and search query are required');
        });

        it('should return empty array when no matches found', async () => {
            const searchData = {
                roomId: 'room123',
                query: 'xyz',
            };
            const messages = [
                {
                    id: 'msg1',
                    content: 'Hello world',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:00:00Z',
                },
                {
                    id: 'msg2',
                    content: 'How are you',
                    senderId: 'user456',
                    sentAt: '2024-01-01T12:01:00Z',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(messages);

            const result = await searchMessagesUseCase.execute(searchData);

            expect(result).toEqual([]);
        });

        it('should find partial word matches', async () => {
            const searchData = {
                roomId: 'room123',
                query: 'world',
            };
            const messages = [
                {
                    id: 'msg1',
                    content: 'Hello world',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:00:00Z',
                },
                {
                    id: 'msg2',
                    content: 'worldwide shipping',
                    senderId: 'user456',
                    sentAt: '2024-01-01T12:01:00Z',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(messages);

            const result = await searchMessagesUseCase.execute(searchData);

            expect(result).toHaveLength(2);
        });

        it('should handle repository error', async () => {
            const searchData = {
                roomId: 'room123',
                query: 'test',
            };
            mockMessageRepository.getMessagesByRoom.mockRejectedValue(
                new Error('Database error')
            );

            await expect(
                searchMessagesUseCase.execute(searchData)
            ).rejects.toThrow('Error searching messages');
        });

        it('should search with special characters', async () => {
            const searchData = {
                roomId: 'room123',
                query: '@mention',
            };
            const messages = [
                {
                    id: 'msg1',
                    content: 'Hey @mention this is important',
                    senderId: 'user123',
                    sentAt: '2024-01-01T12:00:00Z',
                },
            ];
            mockMessageRepository.getMessagesByRoom.mockResolvedValue(messages);

            const result = await searchMessagesUseCase.execute(searchData);

            expect(result).toHaveLength(1);
        });

        it('should handle empty search query', async () => {
            const searchData = {
                roomId: 'room123',
                query: '',
            };

            await expect(
                searchMessagesUseCase.execute(searchData)
            ).rejects.toThrow('Room ID and search query are required');
        });
    });
});
