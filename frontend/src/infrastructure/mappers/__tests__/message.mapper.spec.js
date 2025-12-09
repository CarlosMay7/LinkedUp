import { MessageMapper } from '../message.mapper';
import { Message } from '../../../core/entities/Message';

jest.mock('../../../core/entities/Message');

describe('MessageMapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('toDomain', () => {
        it('should convert database record to domain entity', () => {
            const dbRecord = {
                id: '1',
                content: 'Hello',
                sender_id: 'user-1',
                room_id: 'room-1',
                sent_at: '2024-01-01T00:00:00Z',
            };

            Message.fromDatabase.mockReturnValue({
                id: '1',
                content: 'Hello',
            });

            const result = MessageMapper.toDomain(dbRecord);

            expect(Message.fromDatabase).toHaveBeenCalledWith(dbRecord);
            expect(result.content).toBe('Hello');
        });
    });

    describe('fromWebSocket', () => {
        it('should convert WebSocket data to message entity', () => {
            const wsData = {
                id: '1',
                content: 'WebSocket message',
                senderId: 'user-1',
            };

            Message.fromWebSocketData.mockReturnValue({
                id: '1',
                content: 'WebSocket message',
            });

            MessageMapper.fromWebSocket(wsData);

            expect(Message.fromWebSocketData).toHaveBeenCalledWith(wsData);
        });
    });

    describe('toDTO', () => {
        it('should convert message entity to DTO', () => {
            const message = {
                id: '1',
                content: 'Hello',
                senderId: 'user-1',
                roomId: 'room-1',
                sentAt: '2024-01-01T00:00:00Z',
                senderName: 'John',
                censored: false,
            };

            const result = MessageMapper.toDTO(message);

            expect(result).toEqual({
                id: '1',
                content: 'Hello',
                senderId: 'user-1',
                roomId: 'room-1',
                sentAt: '2024-01-01T00:00:00Z',
                senderName: 'John',
                censored: false,
            });
        });

        it('should handle all DTO fields', () => {
            const message = {
                id: '2',
                content: 'Test message',
                senderId: 'user-2',
                roomId: 'room-2',
                sentAt: '2024-01-02T00:00:00Z',
                senderName: 'Jane',
                censored: true,
            };

            const result = MessageMapper.toDTO(message);

            expect(result.id).toBe('2');
            expect(result.censored).toBe(true);
            expect(result.senderName).toBe('Jane');
        });
    });

    describe('toDTOList', () => {
        it('should convert array of messages to DTOs', () => {
            const messages = [
                {
                    id: '1',
                    content: 'Message 1',
                    senderId: 'user-1',
                    roomId: 'room-1',
                    sentAt: '2024-01-01T00:00:00Z',
                    senderName: 'John',
                    censored: false,
                },
                {
                    id: '2',
                    content: 'Message 2',
                    senderId: 'user-2',
                    roomId: 'room-1',
                    sentAt: '2024-01-02T00:00:00Z',
                    senderName: 'Jane',
                    censored: true,
                },
            ];

            const result = MessageMapper.toDTOList(messages);

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('1');
            expect(result[1].id).toBe('2');
        });

        it('should handle empty array', () => {
            const result = MessageMapper.toDTOList([]);

            expect(result).toEqual([]);
        });
    });

    describe('fromDTO', () => {
        it('should create message entity from DTO', () => {
            const dto = {
                id: '1',
                content: 'Hello',
                senderId: 'user-1',
                roomId: 'room-1',
            };

            Message.mockImplementation(() => ({
                id: '1',
                content: 'Hello',
            }));

            MessageMapper.fromDTO(dto);

            expect(Message).toHaveBeenCalledWith(dto);
        });
    });

    describe('toPersistence', () => {
        it('should convert message to persistence format', () => {
            const message = {
                id: '1',
                content: 'Hello',
                senderId: 'user-1',
                roomId: 'room-1',
                sentAt: '2024-01-01T00:00:00Z',
                senderName: 'John',
                censored: false,
            };

            const result = MessageMapper.toPersistence(message);

            expect(result).toEqual({
                id: '1',
                content: 'Hello',
                sender_id: 'user-1',
                room_id: 'room-1',
                sent_at: '2024-01-01T00:00:00Z',
                sender_name: 'John',
                censored: false,
            });
        });

        it('should convert camelCase to snake_case', () => {
            const message = {
                id: '1',
                content: 'Test',
                senderId: 'user-1',
                roomId: 'room-1',
                sentAt: '2024-01-01',
                senderName: 'Jane',
                censored: true,
            };

            const result = MessageMapper.toPersistence(message);

            expect(result.sender_id).toBe('user-1');
            expect(result.room_id).toBe('room-1');
            expect(result.sent_at).toBe('2024-01-01');
            expect(result.sender_name).toBe('Jane');
        });
    });
});
