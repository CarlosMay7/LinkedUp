import { AuthRepository } from '../auth.repository';

describe('AuthRepository', () => {
    let authRepository;
    let mockClient;

    beforeEach(() => {
        mockClient = {
            auth: {
                signInWithPassword: jest.fn(),
                signUp: jest.fn(),
                signOut: jest.fn(),
                updateUser: jest.fn(),
                getSession: jest.fn(),
                onAuthStateChange: jest.fn(),
                getUser: jest.fn(),
            },
        };
        authRepository = new AuthRepository(mockClient);
    });

    describe('signIn', () => {
        it('should call signInWithPassword with email and password', async () => {
            const credentials = {
                email: 'test@example.com',
                password: 'password123',
            };
            mockClient.auth.signInWithPassword.mockResolvedValue({
                data: { user: { id: '123' } },
            });

            const result = await authRepository.signIn(credentials);

            expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith(
                credentials
            );
            expect(result.data.user.id).toBe('123');
        });

        it('should throw error on sign in failure', async () => {
            mockClient.auth.signInWithPassword.mockRejectedValue(
                new Error('Invalid credentials')
            );

            await expect(
                authRepository.signIn({
                    email: 'test@example.com',
                    password: 'wrong',
                })
            ).rejects.toThrow('Invalid credentials');
        });
    });

    describe('signUp', () => {
        it('should call signUp with email, password and options', async () => {
            const signUpData = {
                email: 'new@example.com',
                password: 'password123',
                options: { data: { username: 'testuser' } },
            };
            mockClient.auth.signUp.mockResolvedValue({
                data: { user: { id: '456' } },
            });

            const result = await authRepository.signUp(signUpData);

            expect(mockClient.auth.signUp).toHaveBeenCalledWith(signUpData);
            expect(result.data.user.id).toBe('456');
        });

        it('should throw error on sign up failure', async () => {
            mockClient.auth.signUp.mockRejectedValue(
                new Error('Email already exists')
            );

            await expect(
                authRepository.signUp({
                    email: 'existing@example.com',
                    password: 'password123',
                    options: {},
                })
            ).rejects.toThrow('Email already exists');
        });
    });

    describe('signOut', () => {
        it('should call signOut', async () => {
            mockClient.auth.signOut.mockResolvedValue({});

            await authRepository.signOut();

            expect(mockClient.auth.signOut).toHaveBeenCalled();
        });

        it('should throw error on sign out failure', async () => {
            mockClient.auth.signOut.mockRejectedValue(
                new Error('Sign out failed')
            );

            await expect(authRepository.signOut()).rejects.toThrow(
                'Sign out failed'
            );
        });
    });

    describe('updateUser', () => {
        it('should call updateUser with updates', async () => {
            const updates = { data: { username: 'newusername' } };
            mockClient.auth.updateUser.mockResolvedValue({
                data: { user: { id: '123', username: 'newusername' } },
            });

            const result = await authRepository.updateUser(updates);

            expect(mockClient.auth.updateUser).toHaveBeenCalledWith(updates);
            expect(result.data.user.username).toBe('newusername');
        });

        it('should throw error on update failure', async () => {
            mockClient.auth.updateUser.mockRejectedValue(
                new Error('Update failed')
            );

            await expect(authRepository.updateUser({})).rejects.toThrow(
                'Update failed'
            );
        });
    });

    describe('getSession', () => {
        it('should return current session', async () => {
            const sessionData = { session: { user: { id: '123' } } };
            mockClient.auth.getSession.mockResolvedValue(sessionData);

            const result = await authRepository.getSession();

            expect(mockClient.auth.getSession).toHaveBeenCalled();
            expect(result.session.user.id).toBe('123');
        });

        it('should handle null session', async () => {
            mockClient.auth.getSession.mockResolvedValue({ session: null });

            const result = await authRepository.getSession();

            expect(result.session).toBeNull();
        });
    });

    describe('onAuthStateChange', () => {
        it('should register auth state change callback', () => {
            const callback = jest.fn();
            mockClient.auth.onAuthStateChange.mockReturnValue({
                data: { subscription: { unsubscribe: jest.fn() } },
            });

            authRepository.onAuthStateChange(callback);

            expect(mockClient.auth.onAuthStateChange).toHaveBeenCalledWith(
                callback
            );
        });
    });

    describe('getUser', () => {
        it('should return current user', async () => {
            const userData = {
                data: { user: { id: '123', email: 'test@example.com' } },
            };
            mockClient.auth.getUser.mockResolvedValue(userData);

            const result = await authRepository.getUser();

            expect(mockClient.auth.getUser).toHaveBeenCalled();
            expect(result.data.user.email).toBe('test@example.com');
        });

        it('should handle no user', async () => {
            mockClient.auth.getUser.mockResolvedValue({ data: { user: null } });

            const result = await authRepository.getUser();

            expect(result.data.user).toBeNull();
        });
    });
});
