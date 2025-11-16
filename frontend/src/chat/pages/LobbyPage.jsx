import { FaSearch, FaUser, FaCommentDots, FaGamepad, FaMusic, FaArchive, FaPlus } from 'react-icons/fa';

export const LobbyPage = () => {
  
  const privateChats = [
    { name: 'Usuario Activo 1', status: 'active' },
    { name: 'Usuario Activo 2', status: 'active' },
    { name: 'Usuario Activo 2', status: 'active' },
    { name: 'Usuario Inactivo 3', status: 'inactive' },
    { name: 'Usuario Inactivo 1', status: 'inactive' },
    { name: 'Usuario Activo 4', status: 'active' },
  ];

  const publicRooms = [
    { name: 'Sala General', count: 15, icon: <FaCommentDots /> },
    { name: 'Sala de Juegos', count: 8, icon: <FaGamepad /> },
    { name: 'Sala de Música', count: 22, icon: <FaMusic /> },
  ];

  return (
    <div className="chat-wrapper">
  
      <main className="lobby-content">
        
        <section className="lobby-card">
          <h2>CHATS PRIVADOS</h2>
          
          <div className="list-search-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar usuario..." 
              className="list-search-input"
            />
          </div>
          
          <ul className="user-list">
            {privateChats.map((user, index) => (
              <li key={index} className="user-item">
                <div className="user-icon-bg">
                  <FaUser />
                </div>
                <span className={`user-name ${user.status === 'inactive' ? 'inactive' : ''}`}>
                  {user.name}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="lobby-card">
          <div className="lobby-card-header">
            <h2>SALAS PÚBLICAS</h2>
            <div className="button">
              <FaPlus />
            </div>
          </div>

          <div className="list-search-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar sala por nombre..." 
              className="list-search-input"
            />
          </div>
          
          <ul>
            {publicRooms.map((room, index) => (
              <li key={index} className="room-item">
                <div className="room-icon-bg">
                  {room.icon}
                </div>
                <div className="room-info">
                  <span className="room-name">{room.name} ({room.count})</span>
                </div>
                <a href="#" className="button">Entrar</a>
              </li>
            ))}
          </ul>
        </section>

      </main>
    </div>
  );
};