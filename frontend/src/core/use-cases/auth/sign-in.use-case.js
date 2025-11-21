export class SignInUseCase {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    async execute({ email, password }) {
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
