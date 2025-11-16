export const TIMEOUTS = {
    MESSAGE_DISMISS: 2000,
    LOGOUT_DELAY: 1000,
};

export const ROUTES = {
    HOME: '/',
    AUTH_LOGIN: '/auth/login',
    AUTH_REGISTER: '/auth/register',
    AUTH_LOGOUT: '/auth/logout',
    PROFILE: 'profile',
    ROOM: '/room',
};

export const PASSWORD_CONSTRAINTS = {
    MIN_LENGTH: 6,
};

export const VALIDATION_MESSAGES = {
    PASSWORD_REQUIRED: 'Fill both password fields to change password',
    PASSWORD_TOO_SHORT: `New password must be at least ${PASSWORD_CONSTRAINTS.MIN_LENGTH} characters`,
    PASSWORD_INCORRECT: 'Current password is incorrect',
    PASSWORD_UPDATE_FAILED: 'Failed to update password',
    PROFILE_UPDATE_FAILED: 'Failed to update profile data',
    PROFILE_UPDATED: 'Profile updated',
    SIGNUP_FAILED: 'Sign up failed',
};

export const USER_ROLES = {
    STUDENT: 'student',
    PROFESSOR: 'professor',
    ADMIN: 'admin',
};

export const DEFAULTS = {
    ROLE: USER_ROLES.STUDENT,
    AVATAR: 'avatar1.png',
};
