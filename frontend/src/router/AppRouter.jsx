import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthRoutes } from '../auth/routes/AuthRoutes';
import { ChatRoutes } from '../chat/routes/ChatRoutes';
import { useAuth } from '../auth/context/AuthContext';
import { ROUTES } from '../config/constants';

const ProtectedAuthRoutes = () => {
    const { user } = useAuth();
    const location = useLocation();

    if (user && location.pathname === ROUTES.AUTH_LOGOUT) {
        return <AuthRoutes />;
    }

    if (user) {
        if (user.isAdmin()) {
            return <Navigate to={ROUTES.ADMIN} replace />;
        }
        return <Navigate to={ROUTES.HOME} replace />;
    }

    return <AuthRoutes />;
};

export const AppRouter = () => {
    const { user } = useAuth();

    return (
        <Routes>
            <Route
                path={`${ROUTES.AUTH}/*`}
                element={<ProtectedAuthRoutes />}
            />

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
