import { DeleteRoomUseCase } from '../delete-room.use-case';

describe('DeleteRoomUseCase', () => {
    let deleteRoomUseCase;
    let mockRoomRepository;

    beforeEach(() => {
        mockRoomRepository = {
            delete: jest.fn(),
        };
        deleteRoomUseCase = new DeleteRoomUseCase(mockRoomRepository);
    });

    describe('execute', () => {
        it('should successfully delete a room', async () => {
            const roomData = {
                roomId: 'room123',
            };
            mockRoomRepository.delete.mockResolvedValue({ success: true });

            const result = await deleteRoomUseCase.execute(roomData);

            expect(result).toEqual({ deleted: true, roomId: 'room123' });
            expect(mockRoomRepository.delete).toHaveBeenCalledWith('room123');
        });

        it('should throw error when room ID is missing', async () => {
            const roomData = {
                roomId: null,
            };

            await expect(deleteRoomUseCase.execute(roomData)).rejects.toThrow(
                'Room ID is required'
            );
        });

        it('should throw error when room is not found', async () => {
            const roomData = {
                roomId: 'nonexistent123',
            };
            mockRoomRepository.delete.mockRejectedValue(
                new Error('Room not found')
            );

            await expect(deleteRoomUseCase.execute(roomData)).rejects.toThrow(
                'Error deleting room'
            );
        });

        it('should handle database error', async () => {
            const roomData = {
                roomId: 'room123',
            };
            mockRoomRepository.delete.mockRejectedValue(
                new Error('Database error')
            );

            await expect(deleteRoomUseCase.execute(roomData)).rejects.toThrow(
                'Error deleting room'
            );
        });

        it('should throw error when room ID is empty string', async () => {
            const roomData = {
                roomId: '',
            };

            await expect(deleteRoomUseCase.execute(roomData)).rejects.toThrow(
                'Room ID is required'
            );
        });
    });
});
