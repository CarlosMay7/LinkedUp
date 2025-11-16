import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LogoutPage = () => {
    const navigate = useNavigate();
    const { signOut } = useAuth();

    useEffect(() => {
        const logout = async () => {
            const { error } = await signOut();

            if (error) {
                console.error('Error logging out:', error.message);
            } else {
                navigate('/auth/login', { replace: true });
            }
        };

        logout();
    }, [navigate, signOut]);
};
