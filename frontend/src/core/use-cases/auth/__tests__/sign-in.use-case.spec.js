import { SignInUseCase } from '../sign-in.use-case';

describe('SignInUseCase', () => {
    let signInUseCase;
    let mockAuthRepository;
    let mockUserRepository;

    beforeEach(() => {
        mockAuthRepository = {
            signIn: jest.fn(),
        };
        mockUserRepository = {
            getUserByEmail: jest.fn(),
        };
        signInUseCase = new SignInUseCase(
            mockAuthRepository,
            mockUserRepository
        );
    });

    describe('execute', () => {
        it('should successfully sign in a user with valid credentials', async () => {
            const credentials = {
                email: 'user@example.com',
                password: 'password123',
            };
            const expectedUserData = {
                user: { id: '123', email: 'user@example.com' },
                session: { access_token: 'token123' },
            };
            mockUserRepository.getUserByEmail.mockResolvedValue({
                uuid: '123',
                email: 'user@example.com',
                blocked: false,
            });
            mockAuthRepository.signIn.mockResolvedValue({
                data: expectedUserData,
                error: null,
            });

            const result = await signInUseCase.execute(credentials);

            expect(result).toEqual(expectedUserData);
            expect(mockUserRepository.getUserByEmail).toHaveBeenCalledWith(
                credentials.email
            );
            expect(mockAuthRepository.signIn).toHaveBeenCalledWith(credentials);
        });

        it('should throw USER_BLOCKED error when user is blocked', async () => {
            const credentials = {
                email: 'blocked@example.com',
                password: 'password123',
            };
            mockUserRepository.getUserByEmail.mockResolvedValue({
                uuid: '123',
                email: 'blocked@example.com',
                blocked: true,
            });

            await expect(signInUseCase.execute(credentials)).rejects.toThrow(
                'Your account has been blocked due to a code of conduct violation.'
            );
            expect(mockAuthRepository.signIn).not.toHaveBeenCalled();
        });

        it('should throw error for invalid credentials', async () => {
            const credentials = {
                email: 'user@example.com',
                password: 'wrongpassword',
            };
            mockUserRepository.getUserByEmail.mockResolvedValue({
                uuid: '123',
                email: 'user@example.com',
                blocked: false,
            });
            mockAuthRepository.signIn.mockResolvedValue({
                data: null,
                error: new Error('Invalid login credentials'),
            });

            await expect(signInUseCase.execute(credentials)).rejects.toThrow(
                'Invalid login credentials'
            );
        });

        it('should continue sign in when user is not found', async () => {
            const credentials = {
                email: 'notfound@example.com',
                password: 'password123',
            };
            const expectedUserData = {
                user: { id: '456', email: 'notfound@example.com' },
            };
            mockUserRepository.getUserByEmail.mockRejectedValue(
                new Error('User not found')
            );
            mockAuthRepository.signIn.mockResolvedValue({
                data: expectedUserData,
                error: null,
            });

            const result = await signInUseCase.execute(credentials);

            expect(result).toEqual(expectedUserData);
            expect(mockAuthRepository.signIn).toHaveBeenCalledWith(credentials);
        });

        it('should handle network error during sign in', async () => {
            const credentials = {
                email: 'user@example.com',
                password: 'password123',
            };
            mockUserRepository.getUserByEmail.mockResolvedValue({
                uuid: '123',
                email: 'user@example.com',
                blocked: false,
            });
            mockAuthRepository.signIn.mockResolvedValue({
                data: null,
                error: new Error('Network error'),
            });

            await expect(signInUseCase.execute(credentials)).rejects.toThrow(
                'Network error'
            );
        });
    });
});
