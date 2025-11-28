import { io } from 'socket.io-client';

export class WebSocketRepository {
    constructor(
        serverUrl = import.meta.env.VITE_WEBSOCKET_URL ||
            'http://localhost:3002'
    ) {
        this.serverUrl = serverUrl;
        this.socket = null;
        this.listeners = new Map();
    }

    connect(token) {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(this.serverUrl, {
            auth: {
                token,
            },
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            // WebSocket connected
        });

        this.socket.on('disconnect', reason => {
            // WebSocket disconnected
        });

        this.socket.on('connect_error', error => {
            console.error('WebSocket connection error:', error);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinRoom(roomId, userId) {
        this.emit('joinRoom', { roomId, userId });
    }

    leaveRoom(roomId, userId) {
        this.emit('leaveRoom', { roomId, userId });
    }

    register(userId) {
        this.emit('register', { userId });
    }

    sendMessage(senderId, roomId, content) {
        this.emit('sendMessage', {
            senderId,
            roomId,
            content,
        });
    }

    emit(event, data) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        }
    }

    on(event, callback) {
        if (!this.socket) {
            return;
        }

        this.socket.on(event, callback);

        // Save listener to clean it up later
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.socket) {
            this.socket.off(event, callback);

            if (this.listeners.has(event)) {
                const callbacks = this.listeners.get(event);
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            }
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}
