import { useState } from 'react';
import { avatars } from '../../assets/avatar';
import { AccountConfirmationModal } from '../components/AccountConfirmationModal';
import { useAuth } from '../context/AuthContext';

export const CreateAccountPage = () => {
    const { signUp } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        const { error } = await signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    role: 'student',
                    profilePicture: avatars['avatar1.png'],
                },
                emailRedirectTo: window.location.origin + '/auth/login',
            },
        });

        if (error) {
            setErrorMessage(error.message || 'Sign up failed');
            return;
        }

        setShowSuccess(true);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="form">
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
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
                {errorMessage && (
                    <p className="form-error" role="alert">
                        {errorMessage}
                    </p>
                )}
                <button type="submit" className="button">
                    Create Account
                </button>
            </form>

            {showSuccess && (
                <AccountConfirmationModal setShowSuccess={setShowSuccess} />
            )}
        </>
    );
};
