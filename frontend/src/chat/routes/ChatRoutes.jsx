import { Navigate, Route, Routes } from 'react-router-dom';
import { ProfilePage } from '../pages/ProfilePage';
import { RoomPage } from '../pages/RoomPage';
import { ChatLayout } from '../components/ChatLayout';
import { ROUTES } from '../../config/constants';
import '../chat.css';

export const ChatRoutes = () => {
    return (
        <Routes>
            <Route element={<ChatLayout />}>
                <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                <Route path={`${ROUTES.ROOM}/:id`} element={<RoomPage />} />
                <Route path="/*" element={<Navigate to={ROUTES.HOME} />} />
            </Route>
        </Routes>
    );
};
