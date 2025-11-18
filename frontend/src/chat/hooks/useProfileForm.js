import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { PasswordChange } from '../../core/entities/Password';
import {
    TIMEOUTS,
    VALIDATION_MESSAGES,
    DEFAULTS,
} from '../../config/constants';
import { getErrorMessage } from '../../infrastructure/errors/error-mapper';
import { avatars } from '../../assets/avatar';

export const useProfileForm = () => {
    const { metaData, user, signIn, updateUser } = useAuth();
    const [currentIcon, setCurrentIcon] = useState(
        metaData?.profilePicture ?? avatars[DEFAULTS.AVATAR]
    );
    const [name, setName] = useState(metaData?.username || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resultMessage, setResultMessage] = useState({
        type: null,
        text: '',
    });

    const email = user?.email || '';
    const role = metaData?.role || '';

    useEffect(() => {
        if (resultMessage.type) {
            const t = setTimeout(() => {
                setResultMessage({ type: null, text: '' });
            }, TIMEOUTS.MESSAGE_DISMISS);
            return () => clearTimeout(t);
        }
    }, [resultMessage.type]);

    const validatePasswordChange = (current, newPwd) => {
        const passwordChange = new PasswordChange(current, newPwd);
        return passwordChange.validate();
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (isSubmitting) {
            return;
        }
        setResultMessage({ type: null, text: '' });
        setIsSubmitting(true);

        if (currentPassword || newPassword) {
            const validationError = validatePasswordChange(
                currentPassword,
                newPassword
            );
            if (validationError) {
                setResultMessage({
                    type: 'error',
                    text: validationError,
                });
                setIsSubmitting(false);
                return;
            }
            const { error: reauthError } = await signIn({
                email,
                password: currentPassword,
            });
            if (reauthError) {
                setResultMessage({
                    type: 'error',
                    text: VALIDATION_MESSAGES.PASSWORD_INCORRECT,
                });
                setIsSubmitting(false);
                return;
            }
            const { error: pwError } = await updateUser({
                password: newPassword,
            });
            if (pwError) {
                setResultMessage({
                    type: 'error',
                    text: getErrorMessage(pwError),
                });
                setIsSubmitting(false);
                return;
            }
            setResultMessage({
                type: 'success',
                text: VALIDATION_MESSAGES.PROFILE_UPDATED,
            });
            setCurrentPassword('');
            setNewPassword('');
        }

        if (
            name !== metaData?.username ||
            currentIcon !== metaData?.profilePicture
        ) {
            const { error: dataError } = await updateUser({
                data: {
                    username: name,
                    profilePicture: currentIcon,
                },
            });
            if (dataError) {
                setResultMessage({
                    type: 'error',
                    text: getErrorMessage(dataError),
                });
                setIsSubmitting(false);
                return;
            }
            if (resultMessage.type !== 'success') {
                setResultMessage({
                    type: 'success',
                    text: VALIDATION_MESSAGES.PROFILE_UPDATED,
                });
            }
        }

        setIsSubmitting(false);
    };

    return {
        currentIcon,
        setCurrentIcon,
        name,
        setName,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        email,
        role,
        isSubmitting,
        resultMessage,
        handleSubmit,
    };
};
