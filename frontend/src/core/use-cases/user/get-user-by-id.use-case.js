export class GetUserByIdUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(userId) {
        return await this.userRepository.getUserById(userId);
    }
}
