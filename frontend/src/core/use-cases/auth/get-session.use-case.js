export class GetSessionUseCase {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    async execute() {
        const { data, error } = await this.authRepository.getSession();

        if (error) {
            throw error;
        }

        return data;
    }
}
