import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '../../components/Alert';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../../config/constants';
import { getErrorMessage } from '../../infrastructure/errors/error-mapper';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async e => {
        e.preventDefault();
        const { error } = await signIn({ email, password });
        if (error) {
            return setError(getErrorMessage(error));
        }
        console.log('pasé');
        navigate(ROUTES.HOME);
    };

    return (
        <form onSubmit={handleLogin} className="form">
            {error && <Alert type="error">{error}</Alert>}
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
            />
            <button type="submit" className="button">
                Log In
            </button>
        </form>
    );
};
