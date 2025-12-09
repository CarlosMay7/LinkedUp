import { io } from 'socket.io-client';

export class WebSocketRepository {
    constructor(serverUrl) {
        this.serverUrl = serverUrl || 'http://localhost:3002';
        this.socket = null;
        this.listeners = new Map();
    }

    connect(token) {
        if (this.socket && this.socket.connected) {
            return this.socket;
        }

        this.socket = io(this.serverUrl, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this._registerDefaultListeners();

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
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

    sendMessage(senderId, roomId, content, receiverId = null) {
        const messageData = {
            senderId,
            roomId,
            content,
        };

        if (receiverId) {
            messageData.receiverId = receiverId;
        }

        this.emit('sendMessage', messageData);
    }

    emit(event, data) {
        if (this.socket && this.socket.connected) {
            this.socket.emit(event, data);
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }

        this.listeners.get(event).push(callback);

        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }

            if (callbacks.length === 0) {
                this.listeners.delete(event);
            }
        }

        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    isConnected() {
        return this.socket !== null && this.socket.connected;
    }

    _registerDefaultListeners() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            console.log('WebSocket connected:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('WebSocket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
        });
    }
}
