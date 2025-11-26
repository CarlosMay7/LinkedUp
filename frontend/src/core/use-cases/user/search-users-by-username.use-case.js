export class SearchUsersByUsernameUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(username) {
        if (!username || username.trim() === '') {
            return [];
        }

        const users = await this.userRepository.searchUserByUsername(
            username.trim()
        );
        return users;
    }
}
