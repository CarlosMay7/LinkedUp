import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthRoutes } from '../auth/routes/AuthRoutes';
import { ChatRoutes } from '../chat/routes/ChatRoutes';
import { useAuth } from '../auth/context/AuthContext';
import { ROUTES, USER_ROLES } from '../config/constants';

const ProtectedAuthRoutes = () => {
    const { user, metaData } = useAuth();
    const location = useLocation();

    if (user && location.pathname === '/auth/logout') {
        return <AuthRoutes />;
    }

    if (user) {
        if (metaData.role === USER_ROLES.ADMIN) {
            return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
        }
        return <Navigate to={ROUTES.HOME} replace />;
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
                <Route
                    path="/*"
                    element={<Navigate to={ROUTES.AUTH_LOGIN} />}
                />
            )}
        </Routes>
    );
};
