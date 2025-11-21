export class SignUpUseCase {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    async execute({ email, password, data, emailRedirectTo }) {
        const { data: userData, error } = await this.authRepository.signUp({
            email,
            password,
            options: {
                data,
                emailRedirectTo,
            },
        });

        if (error) {
            throw error;
        }

        return userData;
    }
}
