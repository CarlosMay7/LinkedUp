export class AppError extends Error {
    constructor(code, message, originalError = null) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.originalError = originalError;
    }
}

export class AuthError extends AppError {
    static CODES = {
        INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
        USER_NOT_FOUND: 'USER_NOT_FOUND',
        EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
        WEAK_PASSWORD: 'WEAK_PASSWORD',
        UNAUTHORIZED: 'UNAUTHORIZED',
        SESSION_EXPIRED: 'SESSION_EXPIRED',
        SIGNUP_FAILED: 'SIGNUP_FAILED',
        SIGNIN_FAILED: 'SIGNIN_FAILED',
        SIGNOUT_FAILED: 'SIGNOUT_FAILED',
        UPDATE_FAILED: 'UPDATE_FAILED',
        AUTH_ERROR: 'AUTH_ERROR',
        UNKNOWN_ERROR: 'UNKNOWN_ERROR',
    };

    constructor(code, message, originalError = null) {
        super(code, message, originalError);
    }
}

export class ValidationError extends AppError {
    static CODES = {
        INVALID_EMAIL: 'INVALID_EMAIL',
        INVALID_PASSWORD: 'INVALID_PASSWORD',
        INVALID_ROLE: 'INVALID_ROLE',
        MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
    };

    constructor(code, message, originalError = null) {
        super(code, message, originalError);
    }
}
