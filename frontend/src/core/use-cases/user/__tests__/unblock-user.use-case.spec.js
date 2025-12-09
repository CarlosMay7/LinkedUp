import { UnblockUserUseCase } from '../unblock-user.use-case';

describe('UnblockUserUseCase', () => {
    let unblockUserUseCase;
    let mockUserRepository;

    beforeEach(() => {
        mockUserRepository = {
            unblockUser: jest.fn(),
        };
        unblockUserUseCase = new UnblockUserUseCase(mockUserRepository);
    });

    describe('execute', () => {
        it('should successfully unblock a user', async () => {
            const userId = 'user123';
            mockUserRepository.unblockUser.mockResolvedValue({ success: true });

            await unblockUserUseCase.execute(userId);

            expect(mockUserRepository.unblockUser).toHaveBeenCalledWith(userId);
        });

        it('should throw error when user not found', async () => {
            const userId = 'nonexistent_user';
            mockUserRepository.unblockUser.mockRejectedValue(
                new Error('User not found')
            );

            await expect(unblockUserUseCase.execute(userId)).rejects.toThrow(
                'User not found'
            );
        });

        it('should handle database error', async () => {
            const userId = 'user123';
            mockUserRepository.unblockUser.mockRejectedValue(
                new Error('Database error')
            );

            await expect(unblockUserUseCase.execute(userId)).rejects.toThrow(
                'Database error'
            );
        });

        it('should unblock user with UUID format', async () => {
            const userId = '550e8400-e29b-41d4-a716-446655440000';
            mockUserRepository.unblockUser.mockResolvedValue({ success: true });

            await unblockUserUseCase.execute(userId);

            expect(mockUserRepository.unblockUser).toHaveBeenCalledWith(userId);
        });

        it('should handle already unblocked user', async () => {
            const userId = 'user123';
            mockUserRepository.unblockUser.mockResolvedValue({ success: true });

            await unblockUserUseCase.execute(userId);

            expect(mockUserRepository.unblockUser).toHaveBeenCalled();
        });

        it('should handle network error', async () => {
            const userId = 'user123';
            mockUserRepository.unblockUser.mockRejectedValue(
                new Error('Network error')
            );

            await expect(unblockUserUseCase.execute(userId)).rejects.toThrow(
                'Network error'
            );
        });

        it('should unblock multiple users', async () => {
            mockUserRepository.unblockUser.mockResolvedValue({ success: true });

            await unblockUserUseCase.execute('user1');
            await unblockUserUseCase.execute('user2');
            await unblockUserUseCase.execute('user3');

            expect(mockUserRepository.unblockUser).toHaveBeenCalledTimes(3);
            expect(mockUserRepository.unblockUser).toHaveBeenNthCalledWith(
                1,
                'user1'
            );
            expect(mockUserRepository.unblockUser).toHaveBeenNthCalledWith(
                2,
                'user2'
            );
            expect(mockUserRepository.unblockUser).toHaveBeenNthCalledWith(
                3,
                'user3'
            );
        });

        it('should handle permission error', async () => {
            const userId = 'user123';
            mockUserRepository.unblockUser.mockRejectedValue(
                new Error('Permission denied')
            );

            await expect(unblockUserUseCase.execute(userId)).rejects.toThrow(
                'Permission denied'
            );
        });
    });
});
