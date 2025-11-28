import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRooms } from '../hooks/useRooms';
import { useOnlineUsers } from '../hooks/useOnlineUsers';
import { useAuth } from '../../auth/context/AuthContext';
import { useWebSocket } from '../../chat/context/WebSocketContext';
import { useMessages } from '../hooks/useMessages';

export const RoomPage = () => {
    const { getRoomById } = useRooms();
    const { user } = useAuth();
    const navigate = useNavigate();
    const roomId = useLocation().pathname.split('/').pop();

    const [roomName, setRoomName] = useState('');
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDirectMessage, setIsDirectMessage] = useState(false);
    const [messageInput, setMessageInput] = useState('');

    const { leaveRoom } = useWebSocket();
    const { messages, isTyping, error, sendMessage } = useMessages(
        roomId,
        user?.id
    );
    const { onlineUsers } = useOnlineUsers(roomId);

    const goBack = async () => {
        await leaveRoom(roomId, user?.id);
        navigate(-1);
    };

    const memberMap = members.reduce((map, member) => {
        map[member.user_uuid] = member.username;
        return map;
    }, {});

    useEffect(() => {
        const loadRoomData = async () => {
            setLoading(true);
            const { name, members, isDirectMessage } =
                await getRoomById(roomId);
            setRoomName(name);
            setMembers(members);
            setIsDirectMessage(isDirectMessage);
            setLoading(false);
        };

        loadRoomData();
    }, [roomId]);

    const handleSendMessage = async e => {
        e.preventDefault();
        if (!messageInput.trim()) {
            return;
        }

        try {
            await sendMessage(messageInput);
            setMessageInput('');
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const formatTime = timestamp => {
        if (!timestamp) {
            return '';
        }
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <div className="room-header">
                <button className="back-button" onClick={goBack}>
                    &lt; Back
                </button>
                <h2 className="room-title">
                    {loading ? 'Loading...' : roomName}
                </h2>
            </div>
            <div className="room-content">
                <div className="messages-area">
                    <div className="messages-list">
                        {messages.length === 0 ? (
                            <div className="no-messages">No messages yet</div>
                        ) : (
                            messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message ${
                                        msg.senderId === user?.id
                                            ? 'mine'
                                            : 'other'
                                    }`}
                                >
                                    {msg.senderId !== user?.id && (
                                        <span className="user-name">
                                            {memberMap[msg.senderId] ||
                                                msg.senderId}
                                        </span>
                                    )}
                                    <p className="message-text">
                                        {msg.content}
                                    </p>
                                    <span className="timestamp">
                                        {msg.senderId === user?.id
                                            ? '[You]'
                                            : ''}{' '}
                                        {formatTime(msg.timestamp)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div
                    className={`room-members-container ${
                        isDirectMessage ? 'dont-show' : ''
                    }`}
                >
                    <h3 className="area-title">Users: {members.length}</h3>
                    <ul className="members-list">
                        {members.map((member, index) => (
                            <li key={index}>
                                <span
                                    className={`user-icon ${
                                        onlineUsers.includes(member.user_uuid)
                                            ? 'online'
                                            : 'offline'
                                    }`}
                                ></span>
                                <span className="member-name">
                                    {member.user_uuid === user?.id
                                        ? `${member.username} (You)`
                                        : member.username}
                                </span>
                                {onlineUsers.includes(member.user_uuid) && (
                                    <span className="online-badge">online</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {isTyping && (
                <div className="typing-indicator">Someone is typing...</div>
            )}
            {error && <div className="error-message">{error}</div>}

            <form
                className="message-input-container"
                onSubmit={handleSendMessage}
            >
                <input
                    type="text"
                    placeholder="Message..."
                    className="message-input"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    disabled={loading}
                />
                <button
                    type="submit"
                    className="send-button button"
                    disabled={loading || !messageInput.trim()}
                >
                    SEND
                </button>
            </form>
        </>
    );
};

export default RoomPage;
