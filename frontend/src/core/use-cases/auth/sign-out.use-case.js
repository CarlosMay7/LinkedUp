export class SignOutUseCase {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    async execute() {
        const { error } = await this.authRepository.signOut();

        if (error) {
            throw error;
        }
    }
}
