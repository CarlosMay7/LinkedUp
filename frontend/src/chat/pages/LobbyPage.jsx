import {
    FaSearch,
    FaUser,
    FaCommentDots,
    FaGamepad,
    FaMusic,
    FaPlus,
} from 'react-icons/fa';

export const LobbyPage = () => {
    const privateChats = [
        { name: 'Active User 1' },
        { name: 'Active User 2' },
        { name: 'Active User 3' },
        { name: 'Inactive User 1' },
        { name: 'Inactive User 2' },
        { name: 'Active User 4' },
    ];

    const publicRooms = [
        { name: 'General Room', count: 15, icon: <FaCommentDots /> },
        { name: 'Games Room', count: 8, icon: <FaGamepad /> },
        { name: 'Music Room', count: 22, icon: <FaMusic /> },
    ];

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
                    />
                </div>

                <ul className="user-list">
                    {privateChats.map((user, index) => (
                        <li key={index} className="user-item">
                            <div className="user-icon-bg">
                                <FaUser />
                            </div>
                            <span className="user-name">{user.name}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="lobby-card">
                <div className="lobby-card-header">
                    <h2>PUBLIC ROOMS</h2>
                    <div className="create-room-btn">
                        <FaPlus />
                    </div>
                </div>

                <div className="list-search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search room by name..."
                        className="list-search-input"
                    />
                </div>

                <ul className="user-list">
                    {publicRooms.map((room, index) => (
                        <li key={index} className="room-item">
                            <div className="room-icon-bg">{room.icon}</div>
                            <div className="room-info">
                                <span className="room-name">
                                    {room.name} ({room.count})
                                </span>
                            </div>
                            <a href="#" className="button">
                                Join
                            </a>
                        </li>
                    ))}
                </ul>
            </section>
        </>
    );
};
