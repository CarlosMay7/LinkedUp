import { JoinRoomUseCase } from '../join-room.use-case';

describe('JoinRoomUseCase', () => {
    let joinRoomUseCase;
    let mockWebsocketRepository;

    beforeEach(() => {
        mockWebsocketRepository = {
            emit: jest.fn(),
        };
        joinRoomUseCase = new JoinRoomUseCase(mockWebsocketRepository);
    });

    describe('execute', () => {
        it('should successfully join a room', async () => {
            const roomId = 'room123';
            const userId = 'user456';

            const result = await joinRoomUseCase.execute(roomId, userId);

            expect(result).toEqual({
                joined: true,
                roomId: 'room123',
            });
            expect(mockWebsocketRepository.emit).toHaveBeenCalledWith(
                'join-room',
                {
                    roomId,
                    userId,
                }
            );
        });

        it('should throw error when room ID is missing', async () => {
            const roomId = null;
            const userId = 'user456';

            await expect(
                joinRoomUseCase.execute(roomId, userId)
            ).rejects.toThrow('Room ID is required to join a room');
            expect(mockWebsocketRepository.emit).not.toHaveBeenCalled();
        });

        it('should throw error when room ID is empty string', async () => {
            const roomId = '';
            const userId = 'user456';

            await expect(
                joinRoomUseCase.execute(roomId, userId)
            ).rejects.toThrow('Room ID is required to join a room');
        });

        it('should allow joining room without userId', async () => {
            const roomId = 'room123';

            const result = await joinRoomUseCase.execute(roomId, null);

            expect(result.joined).toBe(true);
            expect(mockWebsocketRepository.emit).toHaveBeenCalledWith(
                'join-room',
                {
                    roomId,
                    userId: null,
                }
            );
        });

        it('should handle websocket emit error', async () => {
            const roomId = 'room123';
            const userId = 'user456';
            mockWebsocketRepository.emit.mockImplementation(() => {
                throw new Error('WebSocket not connected');
            });

            await expect(
                joinRoomUseCase.execute(roomId, userId)
            ).rejects.toThrow('Error joining room');
        });

        it('should join multiple rooms sequentially', async () => {
            const userId = 'user456';

            await joinRoomUseCase.execute('room1', userId);
            await joinRoomUseCase.execute('room2', userId);
            await joinRoomUseCase.execute('room3', userId);

            expect(mockWebsocketRepository.emit).toHaveBeenCalledTimes(3);
            expect(mockWebsocketRepository.emit).toHaveBeenNthCalledWith(
                1,
                'join-room',
                { roomId: 'room1', userId }
            );
            expect(mockWebsocketRepository.emit).toHaveBeenNthCalledWith(
                2,
                'join-room',
                { roomId: 'room2', userId }
            );
            expect(mockWebsocketRepository.emit).toHaveBeenNthCalledWith(
                3,
                'join-room',
                { roomId: 'room3', userId }
            );
        });

        it('should emit correct room ID in response', async () => {
            const roomId = 'custom_room_xyz123';
            const userId = 'user789';

            const result = await joinRoomUseCase.execute(roomId, userId);

            expect(result.roomId).toBe('custom_room_xyz123');
        });
    });
});
