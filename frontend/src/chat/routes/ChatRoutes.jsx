import { Navigate, Route, Routes } from 'react-router-dom';
import { ProfilePage } from '../pages/ProfilePage';
import { AdminPage } from '../pages/admin/AdminPage';
import { ChatLayout } from '../components/ChatLayout';
import '../chat.css';

export const ChatRoutes = () => {
    return (
        <Routes>
            <Route element={<ChatLayout />}>
                <Route path="profile" element={<ProfilePage />} />
                <Route path="admin" element={<AdminPage />} /> 
                <Route path="/*" element={<Navigate to={'/'} />} />
            </Route>
        </Routes>
    );
};
