import { SendMessageUseCase } from '../send-message.use-case';

describe('SendMessageUseCase', () => {
    let sendMessageUseCase;
    let mockWebsocketRepository;

    beforeEach(() => {
        mockWebsocketRepository = {
            emit: jest.fn(),
            sendMessage: jest.fn(),
        };
        sendMessageUseCase = new SendMessageUseCase(mockWebsocketRepository);
    });

    describe('execute', () => {
        it('should successfully send a message', async () => {
            const messageData = {
                senderId: 'user123',
                roomId: 'room456',
                content: 'Hello, this is a test message',
            };

            const result = await sendMessageUseCase.execute(messageData);

            expect(result).toEqual({
                sent: true,
            });
            expect(mockWebsocketRepository.sendMessage).toHaveBeenCalledWith(
                'user123',
                'room456',
                'Hello, this is a test message'
            );
        });

        it('should throw error when sender ID is missing', async () => {
            const messageData = {
                senderId: null,
                roomId: 'room456',
                content: 'Hello',
            };

            await expect(
                sendMessageUseCase.execute(messageData)
            ).rejects.toThrow(
                'SenderId, roomId, and content are required to send a message'
            );
            expect(mockWebsocketRepository.sendMessage).not.toHaveBeenCalled();
        });

        it('should throw error when room ID is missing', async () => {
            const messageData = {
                senderId: 'user123',
                roomId: null,
                content: 'Hello',
            };

            await expect(
                sendMessageUseCase.execute(messageData)
            ).rejects.toThrow(
                'SenderId, roomId, and content are required to send a message'
            );
            expect(mockWebsocketRepository.sendMessage).not.toHaveBeenCalled();
        });

        it('should throw error when content is missing', async () => {
            const messageData = {
                senderId: 'user123',
                roomId: 'room456',
                content: null,
            };

            await expect(
                sendMessageUseCase.execute(messageData)
            ).rejects.toThrow(
                'SenderId, roomId, and content are required to send a message'
            );
            expect(mockWebsocketRepository.sendMessage).not.toHaveBeenCalled();
        });

        it('should send message with empty content string', async () => {
            const messageData = {
                senderId: 'user123',
                roomId: 'room456',
                content: '',
            };

            await expect(
                sendMessageUseCase.execute(messageData)
            ).rejects.toThrow(
                'SenderId, roomId, and content are required to send a message'
            );
        });

        it('should handle websocket sendMessage error', async () => {
            const messageData = {
                senderId: 'user123',
                roomId: 'room456',
                content: 'Test message',
            };
            mockWebsocketRepository.sendMessage.mockImplementation(() => {
                throw new Error('WebSocket not connected');
            });

            await expect(
                sendMessageUseCase.execute(messageData)
            ).rejects.toThrow('Error sending message');
        });

        it('should send message with special characters', async () => {
            const messageData = {
                senderId: 'user123',
                roomId: 'room456',
                content: 'Hello! @#$%^&*() "quotes" \'apostrophes\'',
            };

            const result = await sendMessageUseCase.execute(messageData);

            expect(result.sent).toBe(true);
            expect(mockWebsocketRepository.sendMessage).toHaveBeenCalled();
        });

        it('should send message with long content', async () => {
            const longContent = 'a'.repeat(5000);
            const messageData = {
                senderId: 'user123',
                roomId: 'room456',
                content: longContent,
            };

            const result = await sendMessageUseCase.execute(messageData);

            expect(result.sent).toBe(true);
            expect(mockWebsocketRepository.sendMessage).toHaveBeenCalledWith(
                'user123',
                'room456',
                longContent
            );
        });
    });
});
