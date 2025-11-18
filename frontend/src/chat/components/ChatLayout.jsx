import { Outlet, useLocation } from 'react-router-dom';
import { NavBar } from './NavBar';

export const ChatLayout = () => {
    const location = useLocation();
    const isLobby = location.pathname === '/';

    return (
        <div className="chat-wrapper">
            <NavBar />
            <div
                className={`${isLobby ? 'lobby-content' : 'container content'}`}
            >
                <Outlet />
            </div>
        </div>
    );
};
