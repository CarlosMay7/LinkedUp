import { WebSocketRepository } from '../websocket.repository';
import { io } from 'socket.io-client';

jest.mock('socket.io-client');

describe('WebSocketRepository', () => {
    let webSocketRepository;
    let mockSocket;

    beforeEach(() => {
        mockSocket = {
            on: jest.fn(),
            off: jest.fn(),
            emit: jest.fn(),
            connected: true,
            disconnect: jest.fn(),
        };

        io.mockReturnValue(mockSocket);
        webSocketRepository = new WebSocketRepository('http://localhost:3002');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('connect', () => {
        it('should connect to WebSocket server', () => {
            const token = 'test-token';
            webSocketRepository.connect(token);

            expect(io).toHaveBeenCalledWith(
                'http://localhost:3002',
                expect.objectContaining({
                    auth: { token },
                })
            );
        });

        it('should return socket if already connected', () => {
            webSocketRepository.connect('token1');
            const firstSocket = webSocketRepository.socket;

            webSocketRepository.connect('token2');
            const secondSocket = webSocketRepository.socket;

            expect(firstSocket).toBe(secondSocket);
            expect(io).toHaveBeenCalledTimes(1);
        });

        it('should use default server URL from env', () => {
            new WebSocketRepository().connect('token');

            expect(io).toHaveBeenCalledWith(
                'http://localhost:3002',
                expect.any(Object)
            );
        });

        it('should register event listeners', () => {
            webSocketRepository.connect('token');

            expect(mockSocket.on).toHaveBeenCalledWith(
                'connect',
                expect.any(Function)
            );
            expect(mockSocket.on).toHaveBeenCalledWith(
                'disconnect',
                expect.any(Function)
            );
            expect(mockSocket.on).toHaveBeenCalledWith(
                'connect_error',
                expect.any(Function)
            );
        });
    });

    describe('disconnect', () => {
        it('should disconnect socket', () => {
            webSocketRepository.connect('token');
            webSocketRepository.disconnect();

            expect(mockSocket.disconnect).toHaveBeenCalled();
            expect(webSocketRepository.socket).toBeNull();
        });

        it('should handle disconnect when not connected', () => {
            webSocketRepository.disconnect();

            expect(webSocketRepository.socket).toBeNull();
        });
    });

    describe('joinRoom', () => {
        it('should emit joinRoom event', () => {
            webSocketRepository.connect('token');
            webSocketRepository.joinRoom('room-123', 'user-456');

            expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', {
                roomId: 'room-123',
                userId: 'user-456',
            });
        });
    });

    describe('leaveRoom', () => {
        it('should emit leaveRoom event', () => {
            webSocketRepository.connect('token');
            webSocketRepository.leaveRoom('room-123', 'user-456');

            expect(mockSocket.emit).toHaveBeenCalledWith('leaveRoom', {
                roomId: 'room-123',
                userId: 'user-456',
            });
        });
    });

    describe('register', () => {
        it('should emit register event', () => {
            webSocketRepository.connect('token');
            webSocketRepository.register('user-123');

            expect(mockSocket.emit).toHaveBeenCalledWith('register', {
                userId: 'user-123',
            });
        });
    });

    describe('sendMessage', () => {
        it('should emit sendMessage event with message data', () => {
            webSocketRepository.connect('token');
            webSocketRepository.sendMessage('user-1', 'room-1', 'Hello');

            expect(mockSocket.emit).toHaveBeenCalledWith('sendMessage', {
                senderId: 'user-1',
                roomId: 'room-1',
                content: 'Hello',
            });
        });
    });

    describe('emit', () => {
        it('should emit event if connected', () => {
            webSocketRepository.connect('token');
            webSocketRepository.emit('customEvent', { data: 'test' });

            expect(mockSocket.emit).toHaveBeenCalledWith('customEvent', {
                data: 'test',
            });
        });

        it('should not emit if not connected', () => {
            mockSocket.connected = false;
            webSocketRepository.connect('token');
            webSocketRepository.emit('customEvent', { data: 'test' });

            expect(mockSocket.emit).not.toHaveBeenCalledWith(
                'customEvent',
                expect.anything()
            );
        });
    });

    describe('on', () => {
        it('should register event listener', () => {
            const callback = jest.fn();
            webSocketRepository.connect('token');
            webSocketRepository.on('messageReceived', callback);

            expect(mockSocket.on).toHaveBeenCalledWith(
                'messageReceived',
                callback
            );
            expect(webSocketRepository.listeners.has('messageReceived')).toBe(
                true
            );
        });

        it('should store multiple listeners for same event', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            webSocketRepository.connect('token');
            webSocketRepository.on('event', callback1);
            webSocketRepository.on('event', callback2);

            const listeners = webSocketRepository.listeners.get('event');
            expect(listeners).toContain(callback1);
            expect(listeners).toContain(callback2);
        });

        it('should handle on when socket is null', () => {
            const callback = jest.fn();
            webSocketRepository.on('event', callback);

            expect(mockSocket.on).not.toHaveBeenCalled();
        });
    });

    describe('off', () => {
        it('should remove event listener', () => {
            const callback = jest.fn();
            webSocketRepository.connect('token');
            webSocketRepository.on('event', callback);
            webSocketRepository.off('event', callback);

            expect(mockSocket.off).toHaveBeenCalledWith('event', callback);
            const listeners = webSocketRepository.listeners.get('event');
            expect(listeners).not.toContain(callback);
        });

        it('should handle off when socket is null', () => {
            const callback = jest.fn();
            webSocketRepository.off('event', callback);

            expect(mockSocket.off).not.toHaveBeenCalled();
        });
    });

    describe('isConnected', () => {
        it('should return connection status', () => {
            webSocketRepository.connect('token');
            expect(webSocketRepository.isConnected()).toBe(true);
        });

        it('should return false when not connected', () => {
            expect(webSocketRepository.isConnected()).toBe(false);
        });

        it('should return false when disconnected', () => {
            webSocketRepository.connect('token');
            mockSocket.connected = false;
            expect(webSocketRepository.isConnected()).toBe(false);
        });
    });
});
