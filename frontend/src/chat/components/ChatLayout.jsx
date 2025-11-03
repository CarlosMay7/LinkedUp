import { Outlet } from 'react-router-dom';
import { NavBar } from './NavBar';

export const ChatLayout = () => {
    return (
        <>
            <div className="chat-wrapper">
                <NavBar />
                <div className="container content">
                    <Outlet />
                </div>
            </div>
        </>
    );
};
