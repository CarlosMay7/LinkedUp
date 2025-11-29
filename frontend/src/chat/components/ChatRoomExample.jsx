import { useEffect, useState } from 'react';
import { useWebSocket } from '../../chat/context/WebSocketContext';
import { useMessages } from '../../chat/hooks/useMessages';

/**
 * Example component showing how to use WebSocket functionality
 * following Clean Architecture principles
 */
export const ChatRoomExample = ({ roomId, userId }) => {
    const { isConnected, joinRoom, leaveRoom, registerUser, on, off } =
        useWebSocket();
    const { messages, isTyping, error, sendMessage } = useMessages(
        roomId,
        userId
    );
    const [messageInput, setMessageInput] = useState('');
    const [userJoined, setUserJoined] = useState(false);

    // Initialize room and register user
    useEffect(() => {
        if (!isConnected || !roomId || !userId) {
            return;
        }

        const setupRoom = async () => {
            try {
                await registerUser(userId);
                await joinRoom(roomId);
                setUserJoined(true);
            } catch (err) {
                console.error('Error setting up room:', err);
            }
        };

        setupRoom();

        return () => {
            leaveRoom(roomId);
            setUserJoined(false);
        };
    }, [isConnected, roomId, userId, registerUser, joinRoom, leaveRoom]);

    // Listen for user events
    useEffect(() => {
        const handleUserJoined = data => {
            console.log('User joined:', data.userId);
        };

        const handleUserLeft = data => {
            console.log('User left:', data.userId);
        };

        on('userJoined', handleUserJoined);
        on('userLeft', handleUserLeft);

        return () => {
            off('userJoined', handleUserJoined);
            off('userLeft', handleUserLeft);
        };
    }, [on, off]);

    const handleSendMessage = async e => {
        e.preventDefault();
        if (!messageInput.trim()) {
            return;
        }

        await sendMessage(messageInput);
        setMessageInput('');
    };

    if (!isConnected) {
        return <div className="error">Connecting to server...</div>;
    }

    if (!userJoined) {
        return <div className="loading">Joining room...</div>;
    }

    return (
        <div className="chat-room">
            <div className="messages-list">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${
                            msg.senderId === userId ? 'own' : 'other'
                        }`}
                    >
                        <div className="sender">{msg.senderId}</div>
                        <div className="content">{msg.content}</div>
                    </div>
                ))}
            </div>

            {isTyping && <div className="typing">Someone is typing...</div>}

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSendMessage} className="message-form">
                <input
                    type="text"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={!userJoined}
                />
                <button type="submit" disabled={!userJoined || !messageInput}>
                    Send
                </button>
            </form>
        </div>
    );
};
