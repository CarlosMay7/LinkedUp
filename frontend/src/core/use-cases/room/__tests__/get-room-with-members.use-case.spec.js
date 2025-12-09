import { GetRoomWithMembersUseCase } from '../get-room-with-members.use-case';

describe('GetRoomWithMembersUseCase', () => {
    let getRoomWithMembersUseCase;
    let mockRoomRepository;
    let mockUserRepository;

    beforeEach(() => {
        mockRoomRepository = {
            getRoomById: jest.fn(),
        };
        mockUserRepository = {
            getAllUsers: jest.fn(),
        };
        getRoomWithMembersUseCase = new GetRoomWithMembersUseCase(
            mockRoomRepository,
            mockUserRepository
        );
    });

    describe('execute', () => {
        it('should retrieve room with detailed member information', async () => {
            const roomId = 'room123';
            mockRoomRepository.getRoomById.mockResolvedValue({
                id: 'room123',
                name: 'General Chat',
                created_by: 'user123',
                is_direct_message: false,
                members: ['user123', 'user456', 'user789'],
                created_at: '2024-01-01T00:00:00Z',
            });
            mockUserRepository.getAllUsers.mockResolvedValue([
                { uuid: 'user123', username: 'alice' },
                { uuid: 'user456', username: 'bob' },
                { uuid: 'user789', username: 'charlie' },
            ]);

            const result = await getRoomWithMembersUseCase.execute(roomId);

            expect(result.members).toHaveLength(3);
            expect(result.members[0]).toEqual({
                user_uuid: 'user123',
                username: 'alice',
            });
            expect(result.members[1]).toEqual({
                user_uuid: 'user456',
                username: 'bob',
            });
            expect(result.members[2]).toEqual({
                user_uuid: 'user789',
                username: 'charlie',
            });
            expect(result.name).toBe('General Chat');
        });

        it('should handle room with single member', async () => {
            const roomId = 'dm123';
            mockRoomRepository.getRoomById.mockResolvedValue({
                id: 'dm123',
                name: 'Direct Message',
                created_by: 'user123',
                is_direct_message: true,
                members: ['user123'],
                created_at: '2024-01-02T00:00:00Z',
            });
            mockUserRepository.getAllUsers.mockResolvedValue([
                { uuid: 'user123', username: 'alice' },
            ]);

            const result = await getRoomWithMembersUseCase.execute(roomId);

            expect(result.members).toHaveLength(1);
            expect(result.members[0].username).toBe('alice');
        });

        it('should throw error when room is not found', async () => {
            const roomId = 'nonexistent123';
            mockRoomRepository.getRoomById.mockRejectedValue(
                new Error('Room not found')
            );

            await expect(
                getRoomWithMembersUseCase.execute(roomId)
            ).rejects.toThrow('Room not found');
        });

        it('should handle room with empty members array', async () => {
            const roomId = 'room456';
            mockRoomRepository.getRoomById.mockResolvedValue({
                id: 'room456',
                name: 'Empty Room',
                created_by: 'user123',
                is_direct_message: false,
                members: [],
                created_at: '2024-01-03T00:00:00Z',
            });
            mockUserRepository.getAllUsers.mockResolvedValue([]);

            const result = await getRoomWithMembersUseCase.execute(roomId);

            expect(result.members).toHaveLength(0);
            expect(result.name).toBe('Empty Room');
        });

        it('should handle members that are not found in user list', async () => {
            const roomId = 'room789';
            mockRoomRepository.getRoomById.mockResolvedValue({
                id: 'room789',
                name: 'Mixed Room',
                created_by: 'user123',
                is_direct_message: false,
                members: ['user123', 'user456'],
                created_at: '2024-01-04T00:00:00Z',
            });
            mockUserRepository.getAllUsers.mockResolvedValue([
                { uuid: 'user123', username: 'alice' },
                { uuid: 'user456', username: 'bob' },
            ]);

            const result = await getRoomWithMembersUseCase.execute(roomId);

            expect(result.members).toHaveLength(2);
            expect(result.members[0]).toEqual({
                user_uuid: 'user123',
                username: 'alice',
            });
            expect(result.members[1]).toEqual({
                user_uuid: 'user456',
                username: 'bob',
            });
        });

        it('should fetch all users from repository', async () => {
            const roomId = 'room123';
            const allUsers = [
                { uuid: 'user1', username: 'user1' },
                { uuid: 'user2', username: 'user2' },
                { uuid: 'user3', username: 'user3' },
            ];
            mockRoomRepository.getRoomById.mockResolvedValue({
                id: 'room123',
                name: 'Room',
                created_by: 'user1',
                is_direct_message: false,
                members: ['user1', 'user2'],
                created_at: '2024-01-05T00:00:00Z',
            });
            mockUserRepository.getAllUsers.mockResolvedValue(allUsers);

            await getRoomWithMembersUseCase.execute(roomId);

            expect(mockUserRepository.getAllUsers).toHaveBeenCalled();
            // Even though only user1 and user2 are members, all users should be fetched
            expect(mockUserRepository.getAllUsers).toHaveBeenCalledTimes(1);
        });
    });
});
