import { GetAllUsersUseCase } from '../get-all-users.use-case';

describe('GetAllUsersUseCase', () => {
    let getAllUsersUseCase;
    let mockUserRepository;

    beforeEach(() => {
        mockUserRepository = {
            getAllUsers: jest.fn(),
        };
        getAllUsersUseCase = new GetAllUsersUseCase(mockUserRepository);
    });

    describe('execute', () => {
        it('should retrieve all users', async () => {
            const expectedUsers = [
                {
                    uuid: 'user1',
                    username: 'alice',
                    email: 'alice@example.com',
                    avatar_url: 'https://example.com/alice.jpg',
                    blocked: false,
                    warnings: 0,
                },
                {
                    uuid: 'user2',
                    username: 'bob',
                    email: 'bob@example.com',
                    avatar_url: 'https://example.com/bob.jpg',
                    blocked: false,
                    warnings: 1,
                },
                {
                    uuid: 'user3',
                    username: 'charlie',
                    email: 'charlie@example.com',
                    avatar_url: 'https://example.com/charlie.jpg',
                    blocked: true,
                    warnings: 3,
                },
            ];
            mockUserRepository.getAllUsers.mockResolvedValue(expectedUsers);

            const result = await getAllUsersUseCase.execute();

            expect(result).toEqual(expectedUsers);
            expect(result).toHaveLength(3);
            expect(mockUserRepository.getAllUsers).toHaveBeenCalled();
        });

        it('should return empty array when no users exist', async () => {
            mockUserRepository.getAllUsers.mockResolvedValue([]);

            const result = await getAllUsersUseCase.execute();

            expect(result).toEqual([]);
        });

        it('should include blocked users in results', async () => {
            const users = [
                {
                    uuid: 'user1',
                    username: 'alice',
                    blocked: false,
                },
                {
                    uuid: 'user2',
                    username: 'bob',
                    blocked: true,
                },
            ];
            mockUserRepository.getAllUsers.mockResolvedValue(users);

            const result = await getAllUsersUseCase.execute();

            expect(result).toHaveLength(2);
            expect(result.some(u => u.blocked)).toBe(true);
        });

        it('should handle repository error', async () => {
            mockUserRepository.getAllUsers.mockRejectedValue(
                new Error('Database error')
            );

            await expect(getAllUsersUseCase.execute()).rejects.toThrow(
                'Database error'
            );
        });

        it('should include users with warnings', async () => {
            const users = [
                {
                    uuid: 'user1',
                    username: 'alice',
                    warnings: 0,
                },
                {
                    uuid: 'user2',
                    username: 'bob',
                    warnings: 5,
                },
            ];
            mockUserRepository.getAllUsers.mockResolvedValue(users);

            const result = await getAllUsersUseCase.execute();

            expect(result[1].warnings).toBe(5);
        });

        it('should return all user properties', async () => {
            const users = [
                {
                    uuid: 'user123',
                    username: 'testuser',
                    email: 'test@example.com',
                    avatar_url: 'https://example.com/avatar.jpg',
                    blocked: false,
                    warnings: 0,
                    created_at: '2024-01-01T00:00:00Z',
                },
            ];
            mockUserRepository.getAllUsers.mockResolvedValue(users);

            const result = await getAllUsersUseCase.execute();

            expect(result[0].uuid).toBe('user123');
            expect(result[0].username).toBe('testuser');
            expect(result[0].email).toBe('test@example.com');
            expect(result[0].avatar_url).toBe('https://example.com/avatar.jpg');
            expect(result[0].blocked).toBe(false);
            expect(result[0].warnings).toBe(0);
        });

        it('should handle network error', async () => {
            mockUserRepository.getAllUsers.mockRejectedValue(
                new Error('Network error')
            );

            await expect(getAllUsersUseCase.execute()).rejects.toThrow(
                'Network error'
            );
        });
    });
});
