import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRooms } from '../hooks/useRooms';
import { useAuth } from '../../auth/context/AuthContext';

export const RoomPage = () => {
    const { getRoomById } = useRooms();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [roomName, setRoomName] = useState('');
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const roomId = useLocation().pathname.split('/').pop();
    const [isDirectMessage, setIsDirectMessage] = useState(false);
    const goBack = () => {
        navigate(-1);
    };

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
                        <div className="message other">
                            <span className="user-name">User A</span>
                            <p className="message-text">Hello World!.</p>
                            <span className="timestamp">10:30 AM</span>
                        </div>

                        <div className="message mine">
                            <p className="message-text">...</p>
                            <span className="timestamp">[You] 10:31 AM</span>
                        </div>

                        <div className="message other">
                            <span className="user-name">User B</span>
                            <p className="message-text">
                                This is a{' '}
                                <span className="censored">********</span>
                                message
                            </p>
                            <span className="timestamp">10:31 AM</span>
                        </div>

                        <div className="message mine hola-style">
                            <p className="message-text">Hi!</p>
                            <span className="timestamp">10:32 AM</span>
                        </div>
                    </div>
                </div>

                <div
                    className={`room-members-container ${isDirectMessage ? 'dont-show' : ''}`}
                >
                    <h3 className="area-title">Users: {members.length}</h3>
                    <ul className="members-list">
                        {members.map((member, index) => (
                            <li key={index}>
                                <span className="user-icon"></span>
                                <span className="member-name">
                                    {member.user_uuid === user.id
                                        ? `${member.username} (You)`
                                        : member.username}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <form className="message-input-container">
                <input
                    type="text"
                    placeholder="Message..."
                    className="message-input"
                />
                <button type="submit" className="send-button button">
                    SEND
                </button>
            </form>
        </>
    );
};

export default RoomPage;
