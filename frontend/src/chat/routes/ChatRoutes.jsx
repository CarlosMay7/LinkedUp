import { Navigate, Route, Routes } from 'react-router-dom';
import { ProfilePage } from '../pages/ProfilePage';
import { RoomPage } from '../pages/RoomPage';
import { ChatLayout } from '../components/ChatLayout';
import '../chat.css';

export const ChatRoutes = () => {
    return (
        <Routes>
            <Route element={<ChatLayout />}>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="room/:id" element={<RoomPage />} />
                <Route path="/*" element={<Navigate to={'/'} />} />
            </Route>
        </Routes>
    );
};
