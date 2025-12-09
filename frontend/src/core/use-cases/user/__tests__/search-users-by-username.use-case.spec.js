import { SearchUsersByUsernameUseCase } from '../search-users-by-username.use-case';

describe('SearchUsersByUsernameUseCase', () => {
    let searchUsersByUsernameUseCase;
    let mockUserRepository;

    beforeEach(() => {
        mockUserRepository = {
            searchUserByUsername: jest.fn(),
        };
        searchUsersByUsernameUseCase = new SearchUsersByUsernameUseCase(
            mockUserRepository
        );
    });

    describe('execute', () => {
        it('should search and find users by username', async () => {
            const username = 'alice';
            const expectedUsers = [
                {
                    uuid: 'user1',
                    username: 'alice',
                    email: 'alice@example.com',
                    blocked: false,
                },
            ];
            mockUserRepository.searchUserByUsername.mockResolvedValue(
                expectedUsers
            );

            const result = await searchUsersByUsernameUseCase.execute(username);

            expect(result).toEqual(expectedUsers);
            expect(
                mockUserRepository.searchUserByUsername
            ).toHaveBeenCalledWith('alice');
        });

        it('should return empty array when no users found', async () => {
            const username = 'nonexistent';
            mockUserRepository.searchUserByUsername.mockResolvedValue([]);

            const result = await searchUsersByUsernameUseCase.execute(username);

            expect(result).toEqual([]);
        });

        it('should return empty array when username is empty', async () => {
            const username = '';

            const result = await searchUsersByUsernameUseCase.execute(username);

            expect(result).toEqual([]);
            expect(
                mockUserRepository.searchUserByUsername
            ).not.toHaveBeenCalled();
        });

        it('should return empty array when username is null', async () => {
            const username = null;

            const result = await searchUsersByUsernameUseCase.execute(username);

            expect(result).toEqual([]);
            expect(
                mockUserRepository.searchUserByUsername
            ).not.toHaveBeenCalled();
        });

        it('should return empty array when username is undefined', async () => {
            const username = undefined;

            const result = await searchUsersByUsernameUseCase.execute(username);

            expect(result).toEqual([]);
        });

        it('should trim whitespace from username', async () => {
            const username = '  alice  ';
            const expectedUsers = [
                {
                    uuid: 'user1',
                    username: 'alice',
                    email: 'alice@example.com',
                },
            ];
            mockUserRepository.searchUserByUsername.mockResolvedValue(
                expectedUsers
            );

            const result = await searchUsersByUsernameUseCase.execute(username);

            expect(result).toEqual(expectedUsers);
            expect(
                mockUserRepository.searchUserByUsername
            ).toHaveBeenCalledWith('alice');
        });

        it('should find multiple users with similar usernames', async () => {
            const username = 'ali';
            const expectedUsers = [
                {
                    uuid: 'user1',
                    username: 'alice',
                    email: 'alice@example.com',
                },
                {
                    uuid: 'user2',
                    username: 'alison',
                    email: 'alison@example.com',
                },
            ];
            mockUserRepository.searchUserByUsername.mockResolvedValue(
                expectedUsers
            );

            const result = await searchUsersByUsernameUseCase.execute(username);

            expect(result).toHaveLength(2);
        });

        it('should handle repository error', async () => {
            const username = 'alice';
            mockUserRepository.searchUserByUsername.mockRejectedValue(
                new Error('Database error')
            );

            await expect(
                searchUsersByUsernameUseCase.execute(username)
            ).rejects.toThrow('Database error');
        });

        it('should include blocked users in results', async () => {
            const username = 'test';
            const expectedUsers = [
                {
                    uuid: 'user1',
                    username: 'test_user1',
                    blocked: false,
                },
                {
                    uuid: 'user2',
                    username: 'test_user2',
                    blocked: true,
                },
            ];
            mockUserRepository.searchUserByUsername.mockResolvedValue(
                expectedUsers
            );

            const result = await searchUsersByUsernameUseCase.execute(username);

            expect(result).toHaveLength(2);
            expect(result.some(u => u.blocked)).toBe(true);
        });

        it('should handle case sensitivity based on repository implementation', async () => {
            const username = 'ALICE';
            const expectedUsers = [
                {
                    uuid: 'user1',
                    username: 'alice',
                    email: 'alice@example.com',
                },
            ];
            mockUserRepository.searchUserByUsername.mockResolvedValue(
                expectedUsers
            );

            const result = await searchUsersByUsernameUseCase.execute(username);

            expect(result).toEqual(expectedUsers);
        });

        it('should return empty array when username is whitespace only', async () => {
            const username = '   ';

            const result = await searchUsersByUsernameUseCase.execute(username);

            expect(result).toEqual([]);
        });
    });
});
