import { FaSearch, FaUser, FaPlus } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../config/constants';
import { useUsers } from '../hooks/useUsers';
import { useRooms } from '../hooks/useRooms';
import { useState } from 'react';
import { CreateRoomModal } from '../components/CreateRoomModal';
import roomIcon from '../../assets/icon/room.svg';
import { useAuth } from '../../auth/context/AuthContext';
import { RoomRepository } from '../../infrastructure/repositories/room.repository';

const roomRepository = new RoomRepository();

export const LobbyPage = () => {
    const { user: currentUser } = useAuth();
    const { users, loading: loadingUsers, searchUsers } = useUsers();
    const { rooms, loading: loadingRooms, searchRoomByName } = useRooms();
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();

    const createRoom = () => {
        setModalOpen(true);
    };

    const createDirectChatRoom = async user => {
        try {
            const newRoomData = await roomRepository.createRoom(
                user.username,
                `Private chat between ${currentUser.username} and ${user.username}`,
                [currentUser.id, user.uuid],
                currentUser.id,
                true
            );
            navigate(`${ROUTES.ROOM}/${newRoomData.id}`);
        } catch (err) {
            console.error('Error creating direct chat room:', err);
        }
    };

    const openChatWithUser = userToChat => {
        console.log(rooms);
        const existingRoom = rooms.find(
            room =>
                room.isDirectMessage &&
                room.members.includes(currentUser.id) &&
                room.members.includes(userToChat.uuid)
        );

        if (existingRoom) {
            navigate(`${ROUTES.ROOM}/${existingRoom.id}`);
            return;
        }

        createDirectChatRoom(userToChat);
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
                                        {room.name} ({room.members.length})
                                    </span>
                                </div>
                                <Link
                                    to={`${ROUTES.ROOM}/${room.id}`}
                                    className="button"
                                >
                                    Join
                                </Link>
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
