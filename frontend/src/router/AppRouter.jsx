import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthRoutes } from '../auth/routes/AuthRoutes';
import { ChatRoutes } from '../chat/routes/ChatRoutes';
import { useAuth } from '../auth/context/AuthContext';

const ProtectedAuthRoutes = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (user && location.pathname === '/auth/logout') {
        return <AuthRoutes />;
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return <AuthRoutes />;
};

export const AppRouter = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/auth/*" element={<ProtectedAuthRoutes />} />

            {user ? (
                <Route path="/*" element={<ChatRoutes />} />
            ) : (
                <Route path="/*" element={<Navigate to="/auth/login" />} />
            )}
        </Routes>
    );
};
