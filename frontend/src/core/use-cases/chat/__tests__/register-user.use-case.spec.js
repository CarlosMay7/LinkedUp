import { RegisterUserUseCase } from '../register-user.use-case';

describe('RegisterUserUseCase', () => {
    let registerUserUseCase;
    let mockWebsocketRepository;

    beforeEach(() => {
        mockWebsocketRepository = {
            emit: jest.fn(),
        };
        registerUserUseCase = new RegisterUserUseCase(mockWebsocketRepository);
    });

    describe('execute', () => {
        it('should successfully register a user', async () => {
            const userId = 'user123';

            const result = await registerUserUseCase.execute(userId);

            expect(result).toEqual({
                registered: true,
                userId: 'user123',
            });
            expect(mockWebsocketRepository.emit).toHaveBeenCalledWith(
                'register',
                {
                    userId,
                }
            );
        });

        it('should throw error when user ID is missing', async () => {
            const userId = null;

            await expect(registerUserUseCase.execute(userId)).rejects.toThrow(
                'User ID is required to register'
            );
            expect(mockWebsocketRepository.emit).not.toHaveBeenCalled();
        });

        it('should throw error when user ID is empty string', async () => {
            const userId = '';

            await expect(registerUserUseCase.execute(userId)).rejects.toThrow(
                'User ID is required to register'
            );
        });

        it('should handle websocket emit error', async () => {
            const userId = 'user123';
            mockWebsocketRepository.emit.mockImplementation(() => {
                throw new Error('WebSocket not connected');
            });

            await expect(registerUserUseCase.execute(userId)).rejects.toThrow(
                'Error registering user'
            );
        });

        it('should register user with valid UUID format', async () => {
            const userId = '550e8400-e29b-41d4-a716-446655440000';

            const result = await registerUserUseCase.execute(userId);

            expect(result.registered).toBe(true);
            expect(result.userId).toBe('550e8400-e29b-41d4-a716-446655440000');
        });

        it('should emit register event with correct user ID', async () => {
            const userId = 'custom_user_id_123';

            await registerUserUseCase.execute(userId);

            expect(mockWebsocketRepository.emit).toHaveBeenCalledWith(
                'register',
                {
                    userId: 'custom_user_id_123',
                }
            );
        });

        it('should register multiple users sequentially', async () => {
            await registerUserUseCase.execute('user1');
            await registerUserUseCase.execute('user2');
            await registerUserUseCase.execute('user3');

            expect(mockWebsocketRepository.emit).toHaveBeenCalledTimes(3);
            expect(mockWebsocketRepository.emit).toHaveBeenNthCalledWith(
                1,
                'register',
                { userId: 'user1' }
            );
            expect(mockWebsocketRepository.emit).toHaveBeenNthCalledWith(
                2,
                'register',
                { userId: 'user2' }
            );
            expect(mockWebsocketRepository.emit).toHaveBeenNthCalledWith(
                3,
                'register',
                { userId: 'user3' }
            );
        });

        it('should handle special characters in user ID', async () => {
            const userId = 'user_123-456.789';

            const result = await registerUserUseCase.execute(userId);

            expect(result.registered).toBe(true);
            expect(result.userId).toBe('user_123-456.789');
        });

        it('should handle network error gracefully', async () => {
            const userId = 'user123';
            mockWebsocketRepository.emit.mockImplementation(() => {
                throw new Error('Network timeout');
            });

            await expect(registerUserUseCase.execute(userId)).rejects.toThrow(
                'Error registering user'
            );
        });
    });
});
