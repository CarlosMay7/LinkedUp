import { BlockUserUseCase } from '../block-user.use-case';

describe('BlockUserUseCase', () => {
    let blockUserUseCase;
    let mockUserRepository;

    beforeEach(() => {
        mockUserRepository = {
            blockUser: jest.fn(),
        };
        blockUserUseCase = new BlockUserUseCase(mockUserRepository);
    });

    describe('execute', () => {
        it('should successfully block a user', async () => {
            const userId = 'user123';
            mockUserRepository.blockUser.mockResolvedValue({ success: true });

            await blockUserUseCase.execute(userId);

            expect(mockUserRepository.blockUser).toHaveBeenCalledWith(userId);
        });

        it('should throw error when user not found', async () => {
            const userId = 'nonexistent_user';
            mockUserRepository.blockUser.mockRejectedValue(
                new Error('User not found')
            );

            await expect(blockUserUseCase.execute(userId)).rejects.toThrow(
                'User not found'
            );
        });

        it('should handle database error', async () => {
            const userId = 'user123';
            mockUserRepository.blockUser.mockRejectedValue(
                new Error('Database error')
            );

            await expect(blockUserUseCase.execute(userId)).rejects.toThrow(
                'Database error'
            );
        });

        it('should block user with UUID format', async () => {
            const userId = '550e8400-e29b-41d4-a716-446655440000';
            mockUserRepository.blockUser.mockResolvedValue({ success: true });

            await blockUserUseCase.execute(userId);

            expect(mockUserRepository.blockUser).toHaveBeenCalledWith(userId);
        });

        it('should handle already blocked user', async () => {
            const userId = 'user123';
            mockUserRepository.blockUser.mockResolvedValue({ success: true });

            await blockUserUseCase.execute(userId);

            expect(mockUserRepository.blockUser).toHaveBeenCalled();
        });

        it('should handle network error', async () => {
            const userId = 'user123';
            mockUserRepository.blockUser.mockRejectedValue(
                new Error('Network error')
            );

            await expect(blockUserUseCase.execute(userId)).rejects.toThrow(
                'Network error'
            );
        });

        it('should block multiple users', async () => {
            mockUserRepository.blockUser.mockResolvedValue({ success: true });

            await blockUserUseCase.execute('user1');
            await blockUserUseCase.execute('user2');
            await blockUserUseCase.execute('user3');

            expect(mockUserRepository.blockUser).toHaveBeenCalledTimes(3);
            expect(mockUserRepository.blockUser).toHaveBeenNthCalledWith(
                1,
                'user1'
            );
            expect(mockUserRepository.blockUser).toHaveBeenNthCalledWith(
                2,
                'user2'
            );
            expect(mockUserRepository.blockUser).toHaveBeenNthCalledWith(
                3,
                'user3'
            );
        });
    });
});
