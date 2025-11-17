import { Navigate, Route, Routes } from 'react-router-dom';
import { ProfilePage } from '../pages/ProfilePage';
import { AdminPage } from '../pages/admin/AdminPage';
import { RoomPage } from '../pages/RoomPage';
import { ChatLayout } from '../components/ChatLayout';
import { ROUTES } from '../../config/constants';
import { LobbyPage } from '../pages/LobbyPage';
import '../chat.css';

export const ChatRoutes = () => {
    return (
        <Routes>
            <Route element={<ChatLayout />}>
                <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                <Route path={`${ROUTES.ROOM}/:id`} element={<RoomPage />} />
                <Route path="/*" element={<Navigate to={ROUTES.HOME} />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="/" element={<LobbyPage />} />
            </Route>
        </Routes>
    );
};
