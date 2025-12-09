import { WarnUserUseCase } from '../warn-user.use-case';

describe('WarnUserUseCase', () => {
    let warnUserUseCase;
    let mockUserRepository;

    beforeEach(() => {
        mockUserRepository = {
            warnUser: jest.fn(),
        };
        warnUserUseCase = new WarnUserUseCase(mockUserRepository);
    });

    describe('execute', () => {
        it('should successfully warn a user', async () => {
            const userId = 'user123';
            mockUserRepository.warnUser.mockResolvedValue({ success: true });

            await warnUserUseCase.execute(userId);

            expect(mockUserRepository.warnUser).toHaveBeenCalledWith(userId);
        });

        it('should throw error when user not found', async () => {
            const userId = 'nonexistent_user';
            mockUserRepository.warnUser.mockRejectedValue(
                new Error('User not found')
            );

            await expect(warnUserUseCase.execute(userId)).rejects.toThrow(
                'User not found'
            );
        });

        it('should handle database error', async () => {
            const userId = 'user123';
            mockUserRepository.warnUser.mockRejectedValue(
                new Error('Database error')
            );

            await expect(warnUserUseCase.execute(userId)).rejects.toThrow(
                'Database error'
            );
        });

        it('should warn user with UUID format', async () => {
            const userId = '550e8400-e29b-41d4-a716-446655440000';
            mockUserRepository.warnUser.mockResolvedValue({ success: true });

            await warnUserUseCase.execute(userId);

            expect(mockUserRepository.warnUser).toHaveBeenCalledWith(userId);
        });

        it('should warn user multiple times', async () => {
            const userId = 'user123';
            mockUserRepository.warnUser.mockResolvedValue({ success: true });

            await warnUserUseCase.execute(userId);
            await warnUserUseCase.execute(userId);
            await warnUserUseCase.execute(userId);

            expect(mockUserRepository.warnUser).toHaveBeenCalledTimes(3);
        });

        it('should handle network error', async () => {
            const userId = 'user123';
            mockUserRepository.warnUser.mockRejectedValue(
                new Error('Network error')
            );

            await expect(warnUserUseCase.execute(userId)).rejects.toThrow(
                'Network error'
            );
        });

        it('should warn multiple different users', async () => {
            mockUserRepository.warnUser.mockResolvedValue({ success: true });

            await warnUserUseCase.execute('user1');
            await warnUserUseCase.execute('user2');
            await warnUserUseCase.execute('user3');

            expect(mockUserRepository.warnUser).toHaveBeenCalledTimes(3);
            expect(mockUserRepository.warnUser).toHaveBeenNthCalledWith(
                1,
                'user1'
            );
            expect(mockUserRepository.warnUser).toHaveBeenNthCalledWith(
                2,
                'user2'
            );
            expect(mockUserRepository.warnUser).toHaveBeenNthCalledWith(
                3,
                'user3'
            );
        });

        it('should handle permission error', async () => {
            const userId = 'user123';
            mockUserRepository.warnUser.mockRejectedValue(
                new Error('Permission denied')
            );

            await expect(warnUserUseCase.execute(userId)).rejects.toThrow(
                'Permission denied'
            );
        });

        it('should increment warning count', async () => {
            const userId = 'user123';
            mockUserRepository.warnUser.mockResolvedValue({
                success: true,
                warnings: 1,
            });

            await warnUserUseCase.execute(userId);

            expect(mockUserRepository.warnUser).toHaveBeenCalledWith(userId);
        });
    });
});
