import { SignUpUseCase } from '../sign-up.use-case';

describe('SignUpUseCase', () => {
    let signUpUseCase;
    let mockAuthRepository;

    beforeEach(() => {
        mockAuthRepository = {
            signUp: jest.fn(),
        };
        signUpUseCase = new SignUpUseCase(mockAuthRepository);
    });

    describe('execute', () => {
        it('should successfully sign up a user with email and password', async () => {
            const signUpData = {
                email: 'newuser@example.com',
                password: 'SecurePassword123',
                data: { username: 'newuser' },
                emailRedirectTo: 'https://example.com/confirm',
            };
            const expectedUserData = {
                user: { id: '123', email: 'newuser@example.com' },
            };
            mockAuthRepository.signUp.mockResolvedValue({
                data: expectedUserData,
                error: null,
            });

            const result = await signUpUseCase.execute(signUpData);

            expect(result).toEqual(expectedUserData);
            expect(mockAuthRepository.signUp).toHaveBeenCalledWith({
                email: signUpData.email,
                password: signUpData.password,
                options: {
                    data: signUpData.data,
                    emailRedirectTo: signUpData.emailRedirectTo,
                },
            });
        });

        it('should throw error when sign up fails', async () => {
            const signUpData = {
                email: 'existing@example.com',
                password: 'password123',
                data: { username: 'existinguser' },
                emailRedirectTo: 'https://example.com/confirm',
            };
            const error = new Error('User already exists');
            mockAuthRepository.signUp.mockResolvedValue({
                data: null,
                error,
            });

            await expect(signUpUseCase.execute(signUpData)).rejects.toThrow(
                'User already exists'
            );
        });

        it('should sign up user without additional data', async () => {
            const signUpData = {
                email: 'user@example.com',
                password: 'password123',
                data: undefined,
                emailRedirectTo: undefined,
            };
            const expectedUserData = {
                user: { id: '456', email: 'user@example.com' },
            };
            mockAuthRepository.signUp.mockResolvedValue({
                data: expectedUserData,
                error: null,
            });

            const result = await signUpUseCase.execute(signUpData);

            expect(result).toEqual(expectedUserData);
            expect(mockAuthRepository.signUp).toHaveBeenCalledWith({
                email: signUpData.email,
                password: signUpData.password,
                options: {
                    data: signUpData.data,
                    emailRedirectTo: signUpData.emailRedirectTo,
                },
            });
        });

        it('should handle network error during sign up', async () => {
            const signUpData = {
                email: 'user@example.com',
                password: 'password123',
                data: { username: 'user' },
                emailRedirectTo: 'https://example.com/confirm',
            };
            const networkError = new Error('Network error');
            mockAuthRepository.signUp.mockResolvedValue({
                data: null,
                error: networkError,
            });

            await expect(signUpUseCase.execute(signUpData)).rejects.toThrow(
                'Network error'
            );
        });
    });
});
