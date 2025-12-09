import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { WebSocketProvider, useWebSocket } from '../WebSocketContext';
import { useAuth } from '../../context/AuthContext';
import { WebSocketFactory } from '../../../infrastructure/factories/websocket.factory';

jest.mock('../../context/AuthContext');
jest.mock('../../../infrastructure/factories/websocket.factory');

const mockWebSocketRepository = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    connected: true,
};

const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
};

const TestComponent = () => {
    const ws = useWebSocket();
    return (
        <div>
            <div>{ws.isConnected ? 'Connected' : 'Disconnected'}</div>
            <button onClick={() => ws.joinRoom('room-1', 'user-123')}>
                Join Room
            </button>
            <button onClick={() => ws.disconnect()}>Disconnect</button>
        </div>
    );
};

describe('WebSocketContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock useAuth
        useAuth.mockReturnValue({
            user: mockUser,
        });

        // Mock WebSocketFactory
        WebSocketFactory.createWebSocketDependencies.mockReturnValue({
            websocketRepository: mockWebSocketRepository,
            finalizeWebSocketUseCase: {
                execute: jest.fn().mockResolvedValue({}),
            },
            initializeWebSocketUseCase: {
                execute: jest.fn().mockResolvedValue({}),
            },
            joinRoomUseCase: {
                execute: jest.fn().mockResolvedValue({}),
            },
            leaveRoomUseCase: {
                execute: jest.fn().mockResolvedValue({}),
            },
            registerUserUseCase: {
                execute: jest.fn().mockResolvedValue({}),
            },
            sendMessageUseCase: {
                execute: jest.fn().mockResolvedValue({}),
            },
        });
    });

    describe('WebSocketProvider', () => {
        it('should render children', () => {
            render(
                <WebSocketProvider>
                    <div>Test Child</div>
                </WebSocketProvider>
            );

            expect(screen.getByText('Test Child')).toBeInTheDocument();
        });

        it('should initialize connection when user is present', async () => {
            const initializeSpy = jest.fn().mockResolvedValue({});
            const dependencies = WebSocketFactory.createWebSocketDependencies();
            dependencies.initializeWebSocketUseCase.execute = initializeSpy;

            WebSocketFactory.createWebSocketDependencies.mockReturnValue(
                dependencies
            );

            render(
                <WebSocketProvider>
                    <TestComponent />
                </WebSocketProvider>
            );

            await waitFor(() => {
                expect(screen.getByText('Connected')).toBeInTheDocument();
            });
        });

        it('should disconnect when user logs out', async () => {
            const finalizeSpy = jest.fn().mockResolvedValue({});
            const dependencies = WebSocketFactory.createWebSocketDependencies();
            dependencies.finalizeWebSocketUseCase.execute = finalizeSpy;

            WebSocketFactory.createWebSocketDependencies.mockReturnValue(
                dependencies
            );

            const { rerender } = render(
                <WebSocketProvider>
                    <TestComponent />
                </WebSocketProvider>
            );

            // Simulate user logout
            useAuth.mockReturnValue({
                user: null,
            });

            rerender(
                <WebSocketProvider>
                    <TestComponent />
                </WebSocketProvider>
            );

            await waitFor(() => {
                expect(screen.getByText('Disconnected')).toBeInTheDocument();
            });
        });

        it('should retry connection on failure', async () => {
            const initializeSpy = jest
                .fn()
                .mockRejectedValueOnce(new Error('Connection failed'));

            const dependencies = WebSocketFactory.createWebSocketDependencies();
            dependencies.initializeWebSocketUseCase.execute = initializeSpy;

            WebSocketFactory.createWebSocketDependencies.mockReturnValue(
                dependencies
            );

            jest.useFakeTimers();

            render(
                <WebSocketProvider>
                    <TestComponent />
                </WebSocketProvider>
            );

            // Fast-forward timers
            jest.advanceTimersByTime(5000);

            expect(initializeSpy).toHaveBeenCalled();

            jest.useRealTimers();
        });
    });

    describe('useWebSocket hook', () => {
        it('should provide websocket context', () => {
            render(
                <WebSocketProvider>
                    <TestComponent />
                </WebSocketProvider>
            );

            expect(screen.getByText('Connected')).toBeInTheDocument();
        });

        it('should throw error when used outside provider', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation();

            expect(() => {
                render(<TestComponent />);
            }).toThrow();

            spy.mockRestore();
        });

        it('should provide joinRoom method', async () => {
            const joinRoomSpy = jest.fn().mockResolvedValue({});
            const dependencies = WebSocketFactory.createWebSocketDependencies();
            dependencies.joinRoomUseCase.execute = joinRoomSpy;

            WebSocketFactory.createWebSocketDependencies.mockReturnValue(
                dependencies
            );

            render(
                <WebSocketProvider>
                    <TestComponent />
                </WebSocketProvider>
            );

            const joinButton = screen.getByText('Join Room');
            joinButton.click();

            await waitFor(() => {
                expect(joinRoomSpy).toHaveBeenCalledWith('room-1', 'user-123');
            });
        });

        it('should provide disconnect method', async () => {
            const finalizeSpy = jest.fn().mockResolvedValue({});
            const dependencies = WebSocketFactory.createWebSocketDependencies();
            dependencies.finalizeWebSocketUseCase.execute = finalizeSpy;

            WebSocketFactory.createWebSocketDependencies.mockReturnValue(
                dependencies
            );

            render(
                <WebSocketProvider>
                    <TestComponent />
                </WebSocketProvider>
            );

            const disconnectButton = screen.getByText('Disconnect');
            disconnectButton.click();

            await waitFor(() => {
                expect(finalizeSpy).toHaveBeenCalled();
            });
        });
    });

    describe('context methods', () => {
        it('should provide emit method', async () => {
            const EmitTestComponent = () => {
                const { emit } = useWebSocket();
                const [emitted, setEmitted] = React.useState(false);

                const handleEmit = () => {
                    emit('testEvent', { data: 'test' });
                    setEmitted(true);
                };

                return (
                    <div>
                        <button onClick={handleEmit}>Emit</button>
                        {emitted && <div>Emitted</div>}
                    </div>
                );
            };

            render(
                <WebSocketProvider>
                    <EmitTestComponent />
                </WebSocketProvider>
            );

            const button = screen.getByText('Emit');
            button.click();

            await waitFor(() => {
                expect(screen.getByText('Emitted')).toBeInTheDocument();
            });
        });

        it('should provide on method', async () => {
            const OnTestComponent = () => {
                const { on } = useWebSocket();
                const [listening, setListening] = React.useState(false);

                React.useEffect(() => {
                    on('testEvent', () => {
                        setListening(true);
                    });
                }, [on]);

                return <div>{listening ? 'Listening' : 'Not listening'}</div>;
            };

            render(
                <WebSocketProvider>
                    <OnTestComponent />
                </WebSocketProvider>
            );

            expect(mockWebSocketRepository.on).toHaveBeenCalled();
        });

        it('should provide off method', async () => {
            const OffTestComponent = () => {
                const { off } = useWebSocket();
                const callback = jest.fn();

                const handleOff = () => {
                    off('testEvent', callback);
                };

                return <button onClick={handleOff}>Remove Listener</button>;
            };

            render(
                <WebSocketProvider>
                    <OffTestComponent />
                </WebSocketProvider>
            );

            const button = screen.getByText('Remove Listener');
            button.click();

            expect(mockWebSocketRepository.off).toHaveBeenCalled();
        });

        it('should provide leaveRoom method', async () => {
            const leaveSpy = jest.fn().mockResolvedValue({});
            const dependencies = WebSocketFactory.createWebSocketDependencies();
            dependencies.leaveRoomUseCase.execute = leaveSpy;

            WebSocketFactory.createWebSocketDependencies.mockReturnValue(
                dependencies
            );

            const LeaveTestComponent = () => {
                const { leaveRoom } = useWebSocket();

                const handleLeave = async () => {
                    await leaveRoom('room-1', 'user-123');
                };

                return <button onClick={handleLeave}>Leave</button>;
            };

            render(
                <WebSocketProvider>
                    <LeaveTestComponent />
                </WebSocketProvider>
            );

            const button = screen.getByText('Leave');
            button.click();

            await waitFor(() => {
                expect(leaveSpy).toHaveBeenCalledWith('room-1', 'user-123');
            });
        });

        it('should provide registerUser method', async () => {
            const registerSpy = jest.fn().mockResolvedValue({});
            const dependencies = WebSocketFactory.createWebSocketDependencies();
            dependencies.registerUserUseCase.execute = registerSpy;

            WebSocketFactory.createWebSocketDependencies.mockReturnValue(
                dependencies
            );

            const RegisterTestComponent = () => {
                const { registerUser } = useWebSocket();

                const handleRegister = async () => {
                    await registerUser('user-123');
                };

                return <button onClick={handleRegister}>Register</button>;
            };

            render(
                <WebSocketProvider>
                    <RegisterTestComponent />
                </WebSocketProvider>
            );

            const button = screen.getByText('Register');
            button.click();

            await waitFor(() => {
                expect(registerSpy).toHaveBeenCalledWith('user-123');
            });
        });

        it('should provide sendMessage method', async () => {
            const sendSpy = jest.fn().mockResolvedValue({});
            const dependencies = WebSocketFactory.createWebSocketDependencies();
            dependencies.sendMessageUseCase.execute = sendSpy;

            WebSocketFactory.createWebSocketDependencies.mockReturnValue(
                dependencies
            );

            const SendTestComponent = () => {
                const { sendMessage } = useWebSocket();

                const handleSend = async () => {
                    await sendMessage('user-123', 'room-1', 'Hello');
                };

                return <button onClick={handleSend}>Send</button>;
            };

            render(
                <WebSocketProvider>
                    <SendTestComponent />
                </WebSocketProvider>
            );

            const button = screen.getByText('Send');
            button.click();

            await waitFor(() => {
                expect(sendSpy).toHaveBeenCalledWith({
                    senderId: 'user-123',
                    roomId: 'room-1',
                    content: 'Hello',
                });
            });
        });

        it('should provide getOnlineUsers method', async () => {
            const GetOnlineTestComponent = () => {
                const { getOnlineUsers } = useWebSocket();
                const [called, setCalled] = React.useState(false);

                const handleGetOnline = async () => {
                    await getOnlineUsers('room-1');
                    setCalled(true);
                };

                return (
                    <div>
                        <button onClick={handleGetOnline}>Get Online</button>
                        {called && <div>Called</div>}
                    </div>
                );
            };

            render(
                <WebSocketProvider>
                    <GetOnlineTestComponent />
                </WebSocketProvider>
            );

            const button = screen.getByText('Get Online');
            button.click();

            await waitFor(() => {
                expect(screen.getByText('Called')).toBeInTheDocument();
            });
        });
    });
});
