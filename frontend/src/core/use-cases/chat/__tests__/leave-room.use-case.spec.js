import { LeaveRoomUseCase } from '../leave-room.use-case';

describe('LeaveRoomUseCase', () => {
    let leaveRoomUseCase;
    let mockWebsocketRepository;

    beforeEach(() => {
        mockWebsocketRepository = {
            leaveRoom: jest.fn(),
        };
        leaveRoomUseCase = new LeaveRoomUseCase(mockWebsocketRepository);
    });

    describe('execute', () => {
        it('should successfully leave a room', async () => {
            const roomId = 'room123';
            const userId = 'user456';

            const result = await leaveRoomUseCase.execute(roomId, userId);

            expect(result).toEqual({
                left: true,
                roomId: 'room123',
            });
            expect(mockWebsocketRepository.leaveRoom).toHaveBeenCalledWith(
                roomId,
                userId
            );
        });

        it('should throw error when room ID is missing', async () => {
            const roomId = null;
            const userId = 'user456';

            await expect(
                leaveRoomUseCase.execute(roomId, userId)
            ).rejects.toThrow('Room ID is required to leave a room');
            expect(mockWebsocketRepository.leaveRoom).not.toHaveBeenCalled();
        });

        it('should throw error when room ID is empty string', async () => {
            const roomId = '';
            const userId = 'user456';

            await expect(
                leaveRoomUseCase.execute(roomId, userId)
            ).rejects.toThrow('Room ID is required to leave a room');
        });

        it('should allow leaving room without userId', async () => {
            const roomId = 'room123';

            const result = await leaveRoomUseCase.execute(roomId, null);

            expect(result.left).toBe(true);
            expect(mockWebsocketRepository.leaveRoom).toHaveBeenCalledWith(
                roomId,
                null
            );
        });

        it('should handle websocket error', async () => {
            const roomId = 'room123';
            const userId = 'user456';
            mockWebsocketRepository.leaveRoom.mockImplementation(() => {
                throw new Error('WebSocket not connected');
            });

            await expect(
                leaveRoomUseCase.execute(roomId, userId)
            ).rejects.toThrow('Error leaving room');
        });

        it('should leave multiple rooms sequentially', async () => {
            const userId = 'user456';

            await leaveRoomUseCase.execute('room1', userId);
            await leaveRoomUseCase.execute('room2', userId);
            await leaveRoomUseCase.execute('room3', userId);

            expect(mockWebsocketRepository.leaveRoom).toHaveBeenCalledTimes(3);
            expect(mockWebsocketRepository.leaveRoom).toHaveBeenNthCalledWith(
                1,
                'room1',
                userId
            );
            expect(mockWebsocketRepository.leaveRoom).toHaveBeenNthCalledWith(
                2,
                'room2',
                userId
            );
            expect(mockWebsocketRepository.leaveRoom).toHaveBeenNthCalledWith(
                3,
                'room3',
                userId
            );
        });

        it('should emit correct room ID in response', async () => {
            const roomId = 'custom_room_xyz123';
            const userId = 'user789';

            const result = await leaveRoomUseCase.execute(roomId, userId);

            expect(result.roomId).toBe('custom_room_xyz123');
        });

        it('should handle error when user not in room', async () => {
            const roomId = 'room123';
            const userId = 'unknown_user';
            mockWebsocketRepository.leaveRoom.mockImplementation(() => {
                throw new Error('User not in room');
            });

            await expect(
                leaveRoomUseCase.execute(roomId, userId)
            ).rejects.toThrow('Error leaving room');
        });
    });
});
