export class GetAllUsersUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute() {
        const users = await this.userRepository.getAllUsers();
        return users;
    }
}
