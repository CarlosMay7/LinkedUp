import { InitializeWebSocketUseCase } from '../initialize-websocket.use-case';

describe('InitializeWebSocketUseCase', () => {
    let initializeWebSocketUseCase;
    let mockWebsocketRepository;

    beforeEach(() => {
        mockWebsocketRepository = {
            connect: jest.fn(),
            isConnected: jest.fn(),
            socket: {
                once: jest.fn(),
                off: jest.fn(),
            },
        };
        initializeWebSocketUseCase = new InitializeWebSocketUseCase(
            mockWebsocketRepository
        );
    });

    describe('execute', () => {
        it('should throw error when token is missing', async () => {
            const token = null;

            await expect(
                initializeWebSocketUseCase.execute(token)
            ).rejects.toThrow('Token required to initialize WebSocket');
        });

        it('should throw error when token is empty string', async () => {
            const token = '';

            await expect(
                initializeWebSocketUseCase.execute(token)
            ).rejects.toThrow('Token required to initialize WebSocket');
        });

        it('should successfully initialize websocket when already connected', async () => {
            const token = 'valid_token_123';
            mockWebsocketRepository.isConnected.mockReturnValue(true);

            const result = await initializeWebSocketUseCase.execute(token);

            expect(result).toEqual({ initialized: true });
            expect(mockWebsocketRepository.connect).toHaveBeenCalledWith(token);
        });

        it('should initialize websocket and wait for connection', async () => {
            const token = 'valid_token_123';
            mockWebsocketRepository.isConnected.mockReturnValue(false);

            // Simulate connection event being fired
            setTimeout(() => {
                const handleConnect =
                    mockWebsocketRepository.socket.once.mock.calls[0][1];
                handleConnect();
            }, 100);

            const result = await initializeWebSocketUseCase.execute(token);

            expect(result).toEqual({ initialized: true });
            expect(mockWebsocketRepository.socket.once).toHaveBeenCalledWith(
                'connect',
                expect.any(Function)
            );
        });

        it('should throw timeout error when connection takes too long', async () => {
            const token = 'valid_token_123';
            mockWebsocketRepository.isConnected.mockReturnValue(false);

            // Don't fire the connection event, let it timeout

            await expect(
                initializeWebSocketUseCase.execute(token)
            ).rejects.toThrow('Timeout initializing WebSocket');
        }, 20000);

        it('should handle websocket connection error', async () => {
            const token = 'valid_token_123';
            mockWebsocketRepository.isConnected.mockReturnValue(false);

            // Simulate connection error
            setTimeout(() => {
                const handleConnectError =
                    mockWebsocketRepository.socket.once.mock.calls[1][1];
                handleConnectError(new Error('Connection failed'));
            }, 100);

            await expect(
                initializeWebSocketUseCase.execute(token)
            ).rejects.toThrow('WebSocket connection error');
        });

        it('should clean up event listeners on successful connection', async () => {
            const token = 'valid_token_123';
            mockWebsocketRepository.isConnected.mockReturnValue(false);

            setTimeout(() => {
                const handleConnect =
                    mockWebsocketRepository.socket.once.mock.calls[0][1];
                handleConnect();
            }, 50);

            await initializeWebSocketUseCase.execute(token);

            expect(mockWebsocketRepository.socket.off).toHaveBeenCalled();
        });

        it('should handle initialization error wrapping', async () => {
            const token = 'valid_token_123';
            mockWebsocketRepository.connect.mockImplementation(() => {
                throw new Error('Connection initialization failed');
            });

            await expect(
                initializeWebSocketUseCase.execute(token)
            ).rejects.toThrow('Error initializing WebSocket');
        });

        it('should accept valid token format', async () => {
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
            mockWebsocketRepository.isConnected.mockReturnValue(true);

            const result = await initializeWebSocketUseCase.execute(token);

            expect(result.initialized).toBe(true);
            expect(mockWebsocketRepository.connect).toHaveBeenCalledWith(token);
        });
    });
});
