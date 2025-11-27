export class BlockUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId) {
        await this.userRepository.blockUser(userId);
    }
}
