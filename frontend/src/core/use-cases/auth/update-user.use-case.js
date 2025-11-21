export class UpdateUserUseCase {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    async execute(updates) {
        const { data, error } = await this.authRepository.updateUser(updates);

        if (error) {
            throw error;
        }

        return data;
    }
}
