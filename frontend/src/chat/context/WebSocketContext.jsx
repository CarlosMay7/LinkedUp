import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { WebSocketFactory } from '../../infrastructure/factories/websocket.factory';

const WebSocketContext = createContext();

// Create dependencies once
const {
    websocketRepository,
    finalizeWebSocketUseCase,
    initializeWebSocketUseCase,
    joinRoomUseCase,
    leaveRoomUseCase,
    registerUserUseCase,
    sendMessageUseCase,
} = WebSocketFactory.createWebSocketDependencies();

export const WebSocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    useEffect(() => {
        if (!user) {
            // Finalize WebSocket when user logs out
            finalizeWebSocketUseCase.execute();
            setIsConnected(false);
            return;
        }

        const connectWebSocket = async () => {
            try {
                setConnectionError(null);
                await initializeWebSocketUseCase.execute(user.id);
                setIsConnected(true);
            } catch (error) {
                console.error('Error connecting WebSocket:', error);
                setConnectionError(error.message);
                setIsConnected(false);
            }
        };

        connectWebSocket();

        // Listen for connection changes
        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        websocketRepository.on('connect', handleConnect);
        websocketRepository.on('disconnect', handleDisconnect);

        return () => {
            websocketRepository.off('connect', handleConnect);
            websocketRepository.off('disconnect', handleDisconnect);
        };
    }, [user]);

    const emit = useCallback((event, data) => {
        websocketRepository.emit(event, data);
    }, []);

    const on = useCallback((event, callback) => {
        websocketRepository.on(event, callback);
    }, []);

    const off = useCallback((event, callback) => {
        websocketRepository.off(event, callback);
    }, []);

    const disconnect = async () => {
        try {
            await finalizeWebSocketUseCase.execute();
            setIsConnected(false);
        } catch (error) {
            console.error('Error finalizing WebSocket:', error);
        }
    };

    const joinRoom = async (roomId, userId) => {
        try {
            await joinRoomUseCase.execute(roomId, userId);
            return { joined: true, roomId };
        } catch (error) {
            console.error('Error joining room:', error);
            throw error;
        }
    };

    const leaveRoom = async (roomId, userId) => {
        try {
            await leaveRoomUseCase.execute(roomId, userId);
            return { left: true, roomId };
        } catch (error) {
            console.error('Error leaving room:', error);
            throw error;
        }
    };

    const registerUser = async userId => {
        try {
            await registerUserUseCase.execute(userId);
            return { registered: true, userId };
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    };

    const sendMessage = async (senderId, roomId, content) => {
        try {
            await sendMessageUseCase.execute({ senderId, roomId, content });
            return { sent: true };
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    const getOnlineUsers = async roomId => {
        try {
            emit('getOnlineUsers', { roomId });
            return { roomId };
        } catch (error) {
            console.error('Error getting online users:', error);
            throw error;
        }
    };

    const value = {
        isConnected,
        connectionError,
        emit,
        on,
        off,
        disconnect,
        joinRoom,
        leaveRoom,
        registerUser,
        sendMessage,
        getOnlineUsers,
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
