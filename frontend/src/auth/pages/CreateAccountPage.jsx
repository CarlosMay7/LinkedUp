import { useState } from 'react';
import { avatars } from '../../assets/avatar';
import { AccountConfirmationModal } from '../components/AccountConfirmationModal';
import { useAuth } from '../context/AuthContext';
import { Role } from '../../core/entities/Role';
import { DEFAULTS, ROUTES } from '../../config/constants';
import { getErrorMessage } from '../../infrastructure/errors/error-mapper';

export const CreateAccountPage = () => {
    const { signUp } = useAuth();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setIsSubmitting(true);
        const { error } = await signUp({
            email,
            password,
            data: {
                username,
                role: Role.STUDENT,
                profilePicture: avatars[DEFAULTS.AVATAR],
            },
            emailRedirectTo: window.location.origin + ROUTES.AUTH_LOGIN,
        });

        if (error) {
            setErrorMessage(getErrorMessage(error));
            setIsSubmitting(false);
            return;
        }

        setUsername('');
        setEmail('');
        setPassword('');
        setIsSubmitting(false);
        setShowSuccess(true);
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="form">
                <input
                    type="text"
                    placeholder="Enter your name"
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
                <button
                    type="submit"
                    className="button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
            </form>

            {showSuccess && (
                <AccountConfirmationModal setShowSuccess={setShowSuccess} />
            )}
        </>
    );
};
