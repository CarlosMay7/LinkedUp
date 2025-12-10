export class RegisterUserUseCase {
    constructor(websocketRepository) {
        this.websocketRepository = websocketRepository;
    }

    async execute(userId) {
        if (!userId) {
            throw new Error('User ID is required to register');
        }

        try {
            this.websocketRepository.register(userId);

            return { registered: true, userId };
        } catch (error) {
            throw new Error(`Error registering user: ${error.message}`);
        }
    }
}
