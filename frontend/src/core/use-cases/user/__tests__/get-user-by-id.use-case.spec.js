import { GetUserByIdUseCase } from '../get-user-by-id.use-case';

describe('GetUserByIdUseCase', () => {
    let getUserByIdUseCase;
    let mockUserRepository;

    beforeEach(() => {
        mockUserRepository = {
            getUserById: jest.fn(),
        };
        getUserByIdUseCase = new GetUserByIdUseCase(mockUserRepository);
    });

    describe('execute', () => {
        it('should retrieve user by ID', async () => {
            const userId = 'user123';
            const expectedUser = {
                uuid: 'user123',
                username: 'alice',
                email: 'alice@example.com',
                avatar_url: 'https://example.com/alice.jpg',
                blocked: false,
                warnings: 0,
                created_at: '2024-01-01T00:00:00Z',
            };
            mockUserRepository.getUserById.mockResolvedValue(expectedUser);

            const result = await getUserByIdUseCase.execute(userId);

            expect(result).toEqual(expectedUser);
            expect(mockUserRepository.getUserById).toHaveBeenCalledWith(userId);
        });

        it('should return null when user not found', async () => {
            const userId = 'nonexistent_user';
            mockUserRepository.getUserById.mockResolvedValue(null);

            const result = await getUserByIdUseCase.execute(userId);

            expect(result).toBeNull();
        });

        it('should throw error on repository failure', async () => {
            const userId = 'user123';
            mockUserRepository.getUserById.mockRejectedValue(
                new Error('Database error')
            );

            await expect(getUserByIdUseCase.execute(userId)).rejects.toThrow(
                'Database error'
            );
        });

        it('should retrieve blocked user', async () => {
            const userId = 'blocked_user';
            const blockedUser = {
                uuid: 'blocked_user',
                username: 'badactor',
                email: 'bad@example.com',
                blocked: true,
                warnings: 10,
            };
            mockUserRepository.getUserById.mockResolvedValue(blockedUser);

            const result = await getUserByIdUseCase.execute(userId);

            expect(result.blocked).toBe(true);
            expect(result.warnings).toBe(10);
        });

        it('should handle UUID format user ID', async () => {
            const userId = '550e8400-e29b-41d4-a716-446655440000';
            const expectedUser = {
                uuid: userId,
                username: 'uuiduser',
                email: 'uuid@example.com',
            };
            mockUserRepository.getUserById.mockResolvedValue(expectedUser);

            const result = await getUserByIdUseCase.execute(userId);

            expect(result.uuid).toBe(userId);
            expect(mockUserRepository.getUserById).toHaveBeenCalledWith(userId);
        });

        it('should return user with all properties', async () => {
            const userId = 'user123';
            const completeUser = {
                uuid: 'user123',
                username: 'alice',
                email: 'alice@example.com',
                avatar_url: 'https://example.com/alice.jpg',
                blocked: false,
                warnings: 0,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-05T00:00:00Z',
            };
            mockUserRepository.getUserById.mockResolvedValue(completeUser);

            const result = await getUserByIdUseCase.execute(userId);

            expect(result).toHaveProperty('uuid');
            expect(result).toHaveProperty('username');
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('avatar_url');
            expect(result).toHaveProperty('blocked');
            expect(result).toHaveProperty('warnings');
        });

        it('should handle network error', async () => {
            const userId = 'user123';
            mockUserRepository.getUserById.mockRejectedValue(
                new Error('Network error')
            );

            await expect(getUserByIdUseCase.execute(userId)).rejects.toThrow(
                'Network error'
            );
        });
    });
});
