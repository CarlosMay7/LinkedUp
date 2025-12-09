import { UpdateUserUseCase } from '../update-user.use-case';

describe('UpdateUserUseCase', () => {
    let updateUserUseCase;
    let mockAuthRepository;

    beforeEach(() => {
        mockAuthRepository = {
            updateUser: jest.fn(),
        };
        updateUserUseCase = new UpdateUserUseCase(mockAuthRepository);
    });

    describe('execute', () => {
        it('should successfully update user data', async () => {
            const updates = {
                data: {
                    username: 'newusername',
                    avatar_url: 'https://example.com/avatar.jpg',
                },
            };
            const expectedUserData = {
                user: {
                    id: '123',
                    email: 'user@example.com',
                    user_metadata: {
                        username: 'newusername',
                        avatar_url: 'https://example.com/avatar.jpg',
                    },
                },
            };
            mockAuthRepository.updateUser.mockResolvedValue({
                data: expectedUserData,
                error: null,
            });

            const result = await updateUserUseCase.execute(updates);

            expect(result).toEqual(expectedUserData);
            expect(mockAuthRepository.updateUser).toHaveBeenCalledWith(updates);
        });

        it('should update user email', async () => {
            const updates = {
                email: 'newemail@example.com',
            };
            const expectedUserData = {
                user: {
                    id: '123',
                    email: 'newemail@example.com',
                },
            };
            mockAuthRepository.updateUser.mockResolvedValue({
                data: expectedUserData,
                error: null,
            });

            const result = await updateUserUseCase.execute(updates);

            expect(result).toEqual(expectedUserData);
            expect(mockAuthRepository.updateUser).toHaveBeenCalledWith(updates);
        });

        it('should update user password', async () => {
            const updates = {
                password: 'NewSecurePassword123',
            };
            const expectedUserData = {
                user: {
                    id: '123',
                    email: 'user@example.com',
                },
            };
            mockAuthRepository.updateUser.mockResolvedValue({
                data: expectedUserData,
                error: null,
            });

            const result = await updateUserUseCase.execute(updates);

            expect(result).toEqual(expectedUserData);
            expect(mockAuthRepository.updateUser).toHaveBeenCalledWith(updates);
        });

        it('should throw error when update fails', async () => {
            const updates = {
                email: 'existing@example.com',
            };
            const error = new Error('Email already in use');
            mockAuthRepository.updateUser.mockResolvedValue({
                data: null,
                error,
            });

            await expect(updateUserUseCase.execute(updates)).rejects.toThrow(
                'Email already in use'
            );
        });

        it('should handle network error during update', async () => {
            const updates = {
                data: { username: 'newname' },
            };
            const networkError = new Error('Network error');
            mockAuthRepository.updateUser.mockResolvedValue({
                data: null,
                error: networkError,
            });

            await expect(updateUserUseCase.execute(updates)).rejects.toThrow(
                'Network error'
            );
        });

        it('should handle validation error', async () => {
            const updates = {
                data: { invalid_field: 'value' },
            };
            const validationError = new Error('Invalid field');
            mockAuthRepository.updateUser.mockResolvedValue({
                data: null,
                error: validationError,
            });

            await expect(updateUserUseCase.execute(updates)).rejects.toThrow(
                'Invalid field'
            );
        });
    });
});
