export class UnblockUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId) {
        await this.userRepository.unblockUser(userId);
    }
}
