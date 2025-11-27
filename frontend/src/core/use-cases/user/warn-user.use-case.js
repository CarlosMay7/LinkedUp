export class WarnUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId) {
        await this.userRepository.warnUser(userId);
    }
}
