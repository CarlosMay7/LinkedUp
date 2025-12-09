import { SignOutUseCase } from '../sign-out.use-case';

describe('SignOutUseCase', () => {
    let signOutUseCase;
    let mockAuthRepository;

    beforeEach(() => {
        mockAuthRepository = {
            signOut: jest.fn(),
        };
        signOutUseCase = new SignOutUseCase(mockAuthRepository);
    });

    describe('execute', () => {
        it('should successfully sign out user', async () => {
            mockAuthRepository.signOut.mockResolvedValue({
                error: null,
            });

            await signOutUseCase.execute();

            expect(mockAuthRepository.signOut).toHaveBeenCalled();
        });

        it('should throw error when sign out fails', async () => {
            const error = new Error('Sign out failed');
            mockAuthRepository.signOut.mockResolvedValue({
                error,
            });

            await expect(signOutUseCase.execute()).rejects.toThrow(
                'Sign out failed'
            );
        });

        it('should handle network error during sign out', async () => {
            const networkError = new Error('Network connection lost');
            mockAuthRepository.signOut.mockResolvedValue({
                error: networkError,
            });

            await expect(signOutUseCase.execute()).rejects.toThrow(
                'Network connection lost'
            );
        });
    });
});
