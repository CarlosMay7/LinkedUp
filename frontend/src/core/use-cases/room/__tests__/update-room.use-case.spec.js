import { UpdateRoomUseCase } from '../update-room.use-case';

describe('UpdateRoomUseCase', () => {
    let updateRoomUseCase;
    let mockRoomRepository;

    beforeEach(() => {
        mockRoomRepository = {
            update: jest.fn(),
        };
        updateRoomUseCase = new UpdateRoomUseCase(mockRoomRepository);
    });

    describe('execute', () => {
        it('should successfully update a room', async () => {
            const updateData = {
                roomId: 'room123',
                updates: {
                    name: 'Updated Room Name',
                    description: 'New description',
                },
            };
            const expectedRoom = {
                id: 'room123',
                name: 'Updated Room Name',
                description: 'New description',
                created_by: 'user123',
                is_direct_message: false,
                members: ['user123', 'user456'],
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-05T00:00:00Z',
            };
            mockRoomRepository.update.mockResolvedValue(expectedRoom);

            const result = await updateRoomUseCase.execute(updateData);

            expect(result).toEqual(expectedRoom);
            expect(mockRoomRepository.update).toHaveBeenCalledWith(
                updateData.roomId,
                updateData.updates
            );
        });

        it('should throw error when room ID is missing', async () => {
            const updateData = {
                roomId: null,
                updates: { name: 'New Name' },
            };

            await expect(updateRoomUseCase.execute(updateData)).rejects.toThrow(
                'Room ID and updates are required'
            );
        });

        it('should throw error when updates are missing', async () => {
            const updateData = {
                roomId: 'room123',
                updates: null,
            };

            await expect(updateRoomUseCase.execute(updateData)).rejects.toThrow(
                'Room ID and updates are required'
            );
        });

        it('should update multiple fields', async () => {
            const updateData = {
                roomId: 'room123',
                updates: {
                    name: 'New Room Name',
                    description: 'New description',
                },
            };
            const expectedRoom = {
                id: 'room123',
                name: 'New Room Name',
                description: 'New description',
                created_by: 'user123',
                is_direct_message: false,
                members: ['user123', 'user456'],
            };
            mockRoomRepository.update.mockResolvedValue(expectedRoom);

            const result = await updateRoomUseCase.execute(updateData);

            expect(result).toEqual(expectedRoom);
        });

        it('should throw error when room is not found', async () => {
            const updateData = {
                roomId: 'nonexistent123',
                updates: { name: 'New Name' },
            };
            mockRoomRepository.update.mockRejectedValue(
                new Error('Room not found')
            );

            await expect(updateRoomUseCase.execute(updateData)).rejects.toThrow(
                'Error updating room'
            );
        });

        it('should handle database error', async () => {
            const updateData = {
                roomId: 'room123',
                updates: { name: 'New Name' },
            };
            mockRoomRepository.update.mockRejectedValue(
                new Error('Database error')
            );

            await expect(updateRoomUseCase.execute(updateData)).rejects.toThrow(
                'Error updating room'
            );
        });

        it('should handle empty updates object', async () => {
            const updateData = {
                roomId: 'room123',
                updates: {},
            };
            const expectedRoom = {
                id: 'room123',
                name: 'Room Name',
            };
            mockRoomRepository.update.mockResolvedValue(expectedRoom);

            const result = await updateRoomUseCase.execute(updateData);

            expect(result).toEqual(expectedRoom);
        });
    });
});
