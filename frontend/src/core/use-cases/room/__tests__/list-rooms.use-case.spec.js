import { ListRoomsUseCase } from '../list-rooms.use-case';

describe('ListRoomsUseCase', () => {
    let listRoomsUseCase;
    let mockRoomRepository;

    beforeEach(() => {
        mockRoomRepository = {
            findAll: jest.fn(),
        };
        listRoomsUseCase = new ListRoomsUseCase(mockRoomRepository);
    });

    describe('execute', () => {
        it('should successfully retrieve all rooms', async () => {
            const expectedRooms = [
                {
                    id: 'room1',
                    name: 'General',
                    created_by: 'user123',
                    is_direct_message: false,
                    members: ['user123', 'user456'],
                    created_at: '2024-01-01T00:00:00Z',
                },
                {
                    id: 'room2',
                    name: 'Development',
                    created_by: 'user456',
                    is_direct_message: false,
                    members: ['user123', 'user456', 'user789'],
                    created_at: '2024-01-02T00:00:00Z',
                },
            ];
            mockRoomRepository.findAll.mockResolvedValue(expectedRooms);

            const result = await listRoomsUseCase.execute();

            expect(result).toEqual(expectedRooms);
            expect(mockRoomRepository.findAll).toHaveBeenCalled();
        });

        it('should return empty array when no rooms exist', async () => {
            mockRoomRepository.findAll.mockResolvedValue([]);

            const result = await listRoomsUseCase.execute();

            expect(result).toEqual([]);
        });

        it('should throw error when repository fails', async () => {
            mockRoomRepository.findAll.mockRejectedValue(
                new Error('Database error')
            );

            await expect(listRoomsUseCase.execute()).rejects.toThrow(
                'Error listing rooms'
            );
        });

        it('should include direct message rooms in list', async () => {
            const expectedRooms = [
                {
                    id: 'dm1',
                    name: 'Direct Message with user456',
                    created_by: 'user123',
                    is_direct_message: true,
                    members: ['user123', 'user456'],
                    created_at: '2024-01-03T00:00:00Z',
                },
                {
                    id: 'room3',
                    name: 'Team Room',
                    created_by: 'user789',
                    is_direct_message: false,
                    members: ['user123', 'user789'],
                    created_at: '2024-01-04T00:00:00Z',
                },
            ];
            mockRoomRepository.findAll.mockResolvedValue(expectedRooms);

            const result = await listRoomsUseCase.execute();

            expect(result).toEqual(expectedRooms);
            expect(result.some(room => room.is_direct_message)).toBe(true);
            expect(result.some(room => !room.is_direct_message)).toBe(true);
        });

        it('should handle network error', async () => {
            mockRoomRepository.findAll.mockRejectedValue(
                new Error('Network error')
            );

            await expect(listRoomsUseCase.execute()).rejects.toThrow(
                'Error listing rooms'
            );
        });
    });
});
