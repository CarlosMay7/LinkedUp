import { AuthError } from '../../core/errors/AppError';

export const mapSupabaseError = error => {
    if (!error) {
        return null;
    }

    const message = error.message?.toLowerCase() || '';

    if (
        message.includes('invalid login credentials') ||
        message.includes('invalid email or password')
    ) {
        return new AuthError(
            AuthError.CODES.INVALID_CREDENTIALS,
            'Email or password is incorrect',
            error
        );
    }

    if (message.includes('user not found')) {
        return new AuthError(
            AuthError.CODES.USER_NOT_FOUND,
            'User not found',
            error
        );
    }

    if (
        message.includes('user already registered') ||
        message.includes('email already exists')
    ) {
        return new AuthError(
            AuthError.CODES.EMAIL_ALREADY_EXISTS,
            'Email already registered',
            error
        );
    }

    if (
        message.includes('password') &&
        (message.includes('weak') || message.includes('short'))
    ) {
        return new AuthError(
            AuthError.CODES.WEAK_PASSWORD,
            'Password is too weak',
            error
        );
    }

    if (message.includes('session') && message.includes('expired')) {
        return new AuthError(
            AuthError.CODES.SESSION_EXPIRED,
            'Session expired. Please log in again',
            error
        );
    }

    if (message.includes('unauthorized') || message.includes('forbidden')) {
        return new AuthError(
            AuthError.CODES.UNAUTHORIZED,
            'Unauthorized access',
            error
        );
    }

    return new AuthError(
        AuthError.CODES.AUTH_ERROR,
        error.message || 'An authentication error occurred',
        error
    );
};

export const getErrorMessage = error => {
    if (!error) {
        return 'An unexpected error occurred';
    }

    if (error instanceof AuthError) {
        return error.message;
    }

    return error.message || 'An unexpected error occurred';
};
