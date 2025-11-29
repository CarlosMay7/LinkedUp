import { AuthError } from '../../errors/AppError';

export class SignInUseCase {
    constructor(authRepository, userRepository) {
        this.authRepository = authRepository;
        this.userRepository = userRepository;
    }

    async execute({ email, password }) {
        // Check if user is blocked in public.users table
        try {
            const userRecord = await this.userRepository.getUserByEmail(email);

            if (userRecord && userRecord.blocked) {
                const blockedError = new AuthError(
                    AuthError.CODES.USER_BLOCKED,
                    'Your account has been blocked due to a code of conduct violation.',
                    null
                );
                blockedError.code = 'USER_BLOCKED';
                throw blockedError;
            }
        } catch (err) {
            // If it's a blocked error, re-throw it
            if (err.code === 'USER_BLOCKED' || err instanceof AuthError) {
                throw err;
            }
            // Otherwise ignore the error and continue
        }

           const { data: userData, error } = await this.authRepository.signIn({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        return userData;
    }
}
