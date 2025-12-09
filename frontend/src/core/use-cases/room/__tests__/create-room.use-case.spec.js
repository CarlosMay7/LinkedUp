import { CreateRoomUseCase } from '../create-room.use-case';

describe('CreateRoomUseCase', () => {
    let createRoomUseCase;
    let mockRoomRepository;

    beforeEach(() => {
        mockRoomRepository = {
            create: jest.fn(),
        };
        createRoomUseCase = new CreateRoomUseCase(mockRoomRepository);
    });

    describe('execute', () => {
        it('should successfully create a new room', async () => {
            const roomData = {
                name: 'General Chat',
                createdBy: 'user123',
                isDirectMessage: false,
                members: ['user123', 'user456'],
            };
            const expectedRoom = {
                id: 'room123',
                name: 'General Chat',
                created_by: 'user123',
                is_direct_message: false,
                members: ['user123', 'user456'],
                created_at: '2024-01-01T00:00:00Z',
            };
            mockRoomRepository.create.mockResolvedValue(expectedRoom);

            const result = await createRoomUseCase.execute(roomData);

            expect(result).toEqual(expectedRoom);
            expect(mockRoomRepository.create).toHaveBeenCalledWith({
                name: roomData.name,
                created_by: roomData.createdBy,
                is_direct_message: roomData.isDirectMessage,
                members: roomData.members,
            });
        });

        it('should create a direct message room', async () => {
            const roomData = {
                name: 'Direct Message with user456',
                createdBy: 'user123',
                isDirectMessage: true,
                members: ['user123', 'user456'],
            };
            const expectedRoom = {
                id: 'dm123',
                name: 'Direct Message with user456',
                created_by: 'user123',
                is_direct_message: true,
                members: ['user123', 'user456'],
                created_at: '2024-01-01T00:00:00Z',
            };
            mockRoomRepository.create.mockResolvedValue(expectedRoom);

            const result = await createRoomUseCase.execute(roomData);

            expect(result).toEqual(expectedRoom);
            expect(result.is_direct_message).toBe(true);
        });

        it('should throw error when room name is missing', async () => {
            const roomData = {
                name: null,
                createdBy: 'user123',
                isDirectMessage: false,
                members: [],
            };

            await expect(createRoomUseCase.execute(roomData)).rejects.toThrow(
                'Room name and creator are required'
            );
        });

        it('should throw error when creator is missing', async () => {
            const roomData = {
                name: 'Test Room',
                createdBy: null,
                isDirectMessage: false,
                members: [],
            };

            await expect(createRoomUseCase.execute(roomData)).rejects.toThrow(
                'Room name and creator are required'
            );
        });

        it('should create room with default values', async () => {
            const roomData = {
                name: 'New Room',
                createdBy: 'user123',
            };
            const expectedRoom = {
                id: 'room456',
                name: 'New Room',
                created_by: 'user123',
                is_direct_message: false,
                members: [],
                created_at: '2024-01-01T00:00:00Z',
            };
            mockRoomRepository.create.mockResolvedValue(expectedRoom);

            const result = await createRoomUseCase.execute(roomData);

            expect(result).toEqual(expectedRoom);
            expect(mockRoomRepository.create).toHaveBeenCalledWith({
                name: roomData.name,
                created_by: roomData.createdBy,
                is_direct_message: false,
                members: [],
            });
        });

        it('should handle database error', async () => {
            const roomData = {
                name: 'Test Room',
                createdBy: 'user123',
                isDirectMessage: false,
                members: [],
            };
            mockRoomRepository.create.mockRejectedValue(
                new Error('Database error')
            );

            await expect(createRoomUseCase.execute(roomData)).rejects.toThrow(
                'Error creating room'
            );
        });
    });
});
