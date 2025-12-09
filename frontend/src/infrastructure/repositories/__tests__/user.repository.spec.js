import { UserRepository } from '../user.repository';

describe('UserRepository', () => {
    let userRepository;
    let mockDbClient;

    beforeEach(() => {
        mockDbClient = {
            from: jest.fn(),
        };
        userRepository = new UserRepository(mockDbClient);
    });

    describe('getAllUsers', () => {
        it('should fetch all users', async () => {
            const mockUsers = [
                { id: '1', email: 'user1@example.com', username: 'user1' },
                { id: '2', email: 'user2@example.com', username: 'user2' },
            ];

            mockDbClient.from.mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    data: mockUsers,
                    error: null,
                }),
            });

            const result = await userRepository.getAllUsers();

            expect(mockDbClient.from).toHaveBeenCalledWith('users');
            expect(result).toHaveLength(2);
        });

        it('should throw error if fetch fails', async () => {
            mockDbClient.from.mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    data: null,
                    error: new Error('Database error'),
                }),
            });

            await expect(userRepository.getAllUsers()).rejects.toThrow();
        });
    });

    describe('getUserById', () => {
        it('should fetch user by id', async () => {
            const mockUser = {
                id: '1',
                email: 'user@example.com',
                username: 'testuser',
                user_uuid: 'uuid-123',
            };

            mockDbClient.from.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: mockUser,
                            error: null,
                        }),
                    }),
                }),
            });

            const result = await userRepository.getUserById('1');

            expect(mockDbClient.from).toHaveBeenCalledWith('users');
            expect(result.id).toBe('1');
        });

        it('should throw error if user not found', async () => {
            mockDbClient.from.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    eq: jest.fn().mockReturnValue({
                        single: jest.fn().mockResolvedValue({
                            data: null,
                            error: new Error('Not found'),
                        }),
                    }),
                }),
            });

            await expect(
                userRepository.getUserById('nonexistent')
            ).rejects.toThrow();
        });
    });

    describe('searchUserByUsername', () => {
        it('should search users by username', async () => {
            const mockUsers = [
                { id: '1', username: 'testuser', email: 'test@example.com' },
            ];

            mockDbClient.from.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    ilike: jest.fn().mockResolvedValue({
                        data: mockUsers,
                        error: null,
                    }),
                }),
            });

            const result = await userRepository.searchUserByUsername('test');

            expect(mockDbClient.from).toHaveBeenCalledWith('users');
            expect(result).toHaveLength(1);
            expect(result[0].username).toBe('testuser');
        });

        it('should return empty array if no users found', async () => {
            mockDbClient.from.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    ilike: jest.fn().mockResolvedValue({
                        data: [],
                        error: null,
                    }),
                }),
            });

            const result =
                await userRepository.searchUserByUsername('notfound');

            expect(result).toEqual([]);
        });
    });

    describe('blockUser', () => {
        it('should block a user', async () => {
            mockDbClient.from.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            });

            await userRepository.blockUser('user-123');

            expect(mockDbClient.from).toHaveBeenCalledWith('users');
        });

        it('should throw error if block fails', async () => {
            mockDbClient.from.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: new Error('Block failed'),
                    }),
                }),
            });

            await expect(
                userRepository.blockUser('user-123')
            ).rejects.toThrow();
        });
    });

    describe('unblockUser', () => {
        it('should unblock a user', async () => {
            mockDbClient.from.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            });

            await userRepository.unblockUser('user-123');

            expect(mockDbClient.from).toHaveBeenCalledWith('users');
        });
    });

    describe('warnUser', () => {
        it('should warn a user', async () => {
            mockDbClient.from.mockReturnValue({
                update: jest.fn().mockReturnValue({
                    eq: jest.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            });

            await userRepository.warnUser('user-123');

            expect(mockDbClient.from).toHaveBeenCalledWith('users');
        });
    });
});
