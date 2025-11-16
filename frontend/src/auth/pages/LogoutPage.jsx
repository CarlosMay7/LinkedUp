import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../../config/constants';

export const LogoutPage = () => {
    const navigate = useNavigate();
    const { signOut } = useAuth();

    useEffect(() => {
        const logout = async () => {
            const { error } = await signOut();

            if (error) {
                console.error('Error logging out:', error.message);
            } else {
                navigate(ROUTES.AUTH_LOGIN, { replace: true });
            }
        };

        logout();
    }, [navigate, signOut]);
};
