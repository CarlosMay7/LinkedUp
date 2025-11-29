import { FaSearch, FaUser, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import { useUsers } from '../hooks/useUsers';
import { useRooms } from '../hooks/useRooms';
import { useState } from 'react';
import { CreateRoomModal } from '../components/CreateRoomModal';
import roomIcon from '../../assets/icon/room.svg';
import { useAuth } from '../../auth/context/AuthContext';
import { useWebSocket } from '../../chat/context/WebSocketContext';

export const LobbyPage = () => {
    const { user: currentUser } = useAuth();
    const { users, loading: loadingUsers, searchUsers } = useUsers();
    const {
        rooms,
        loading: loadingRooms,
        searchRoomByName,
        addMemberToRoom,
        findOrCreateDirectMessage,
    } = useRooms();
    const { joinRoom, registerUser } = useWebSocket();
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();

    const createRoom = () => {
        setModalOpen(true);
    };

    const openChatWithUser = async userToChat => {
        try {
            const room = await findOrCreateDirectMessage(
                currentUser.id,
                userToChat.uuid,
                currentUser.id
            );
            navigate(`${ROUTES.ROOM}/${room.id}`);
        } catch (err) {
            console.error('Error opening direct chat:', err);
        }
    };

    const handleJoinRoom = async roomId => {
        try {
            await registerUser(currentUser.id);
            await joinRoom(roomId, currentUser.id);

            const room = rooms.find(r => r.id === roomId);
            if (room && !room.members.includes(currentUser.id)) {
                await addMemberToRoom(roomId, currentUser.id);
            }

            navigate(`${ROUTES.ROOM}/${roomId}`);
        } catch (err) {
            console.error('Error joining room:', err);
        }
    };

    return (
        <>
            <section className="lobby-card">
                <h2>PRIVATE CHATS</h2>

                <div className="list-search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search user..."
                        className="list-search-input"
                        onChange={e => searchUsers(e.target.value)}
                    />
                </div>

                <ul className="user-list">
                    {loadingUsers ? (
                        <li>Loading users...</li>
                    ) : (
                        users.map((user, index) => (
                            <li key={index} className="user-item">
                                <div className="user-icon-bg">
                                    <FaUser />
                                </div>
                                <span className="user-name">
                                    {user.username}
                                </span>
                                <button
                                    className="button"
                                    onClick={() => openChatWithUser(user)}
                                >
                                    Chat
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </section>

            <section className="lobby-card">
                <div className="lobby-card-header">
                    <h2>PUBLIC ROOMS</h2>
                    <div className="create-room-btn" onClick={createRoom}>
                        <FaPlus />
                    </div>
                </div>

                <div className="list-search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search room by name..."
                        className="list-search-input"
                        onChange={e => searchRoomByName(e.target.value)}
                    />
                </div>

                <ul className="user-list">
                    {loadingRooms ? (
                        <li>Loading rooms...</li>
                    ) : (
                        rooms.map((room, index) => (
                            <li key={index} className="room-item">
                                <div className="room-icon-bg">
                                    <img src={roomIcon} alt="" />
                                </div>
                                <div className="room-info">
                                    <span className="room-name">
                                        {room.name}
                                    </span>
                                </div>
                                <button
                                    className="button"
                                    onClick={() => handleJoinRoom(room.id)}
                                >
                                    Join
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </section>
            <CreateRoomModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
};
