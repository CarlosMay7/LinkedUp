import { Navigate, Route, Routes } from 'react-router-dom';
import { ProfilePage } from '../pages/ProfilePage';
import { AdminPage } from '../pages/admin/AdminPage';
import { RoomPage } from '../pages/RoomPage';
import { ChatLayout } from '../components/ChatLayout';
import { LobbyPage } from '../pages/LobbyPage';
import '../chat.css';

export const ChatRoutes = () => {
    return (
        <Routes>
            <Route element={<ChatLayout />}>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="room/:id" element={<RoomPage />} />
                <Route path="/" element={<LobbyPage />} />
                <Route path="/*" element={<Navigate to={'/'} />} />
            </Route>
        </Routes>
    );
};
