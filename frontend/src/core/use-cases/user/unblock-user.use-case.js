export class UnblockUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId) {
        const user = await this.userRepository.unblockUser(userId);
        return user;
    }
}
