import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Error } from '../components/Error';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleLogin = async e => {
        e.preventDefault();
        console.log(email, password);
        const { error } = await signIn({ email, password });
        if (error) {
            return setError(error.message);
        }
        navigate('/');
    };

    return (
        <form onSubmit={handleLogin} className="form">
            {error && <Error error={error} />}
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
