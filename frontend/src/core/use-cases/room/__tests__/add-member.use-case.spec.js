import { AddMemberToRoomUseCase } from '../add-member.use-case';

describe('AddMemberToRoomUseCase', () => {
    let addMemberToRoomUseCase;
    let mockRoomRepository;

    beforeEach(() => {
        mockRoomRepository = {
            addMemberToRoom: jest.fn(),
        };
        addMemberToRoomUseCase = new AddMemberToRoomUseCase(mockRoomRepository);
    });

    describe('execute', () => {
        it('should successfully add a member to a room', async () => {
            const roomId = 'room123';
            const userId = 'user789';
            mockRoomRepository.addMemberToRoom.mockResolvedValue({
                success: true,
            });

            await addMemberToRoomUseCase.execute(roomId, userId);

            expect(mockRoomRepository.addMemberToRoom).toHaveBeenCalledWith(
                roomId,
                userId
            );
        });

        it('should throw error when adding duplicate member', async () => {
            const roomId = 'room123';
            const userId = 'user456';
            mockRoomRepository.addMemberToRoom.mockRejectedValue(
                new Error('User is already a member of this room')
            );

            await expect(
                addMemberToRoomUseCase.execute(roomId, userId)
            ).rejects.toThrow('User is already a member of this room');
        });

        it('should throw error when room is not found', async () => {
            const roomId = 'nonexistent123';
            const userId = 'user789';
            mockRoomRepository.addMemberToRoom.mockRejectedValue(
                new Error('Room not found')
            );

            await expect(
                addMemberToRoomUseCase.execute(roomId, userId)
            ).rejects.toThrow('Room not found');
        });

        it('should throw error when user is not found', async () => {
            const roomId = 'room123';
            const userId = 'nonexistent789';
            mockRoomRepository.addMemberToRoom.mockRejectedValue(
                new Error('User not found')
            );

            await expect(
                addMemberToRoomUseCase.execute(roomId, userId)
            ).rejects.toThrow('User not found');
        });

        it('should handle database error', async () => {
            const roomId = 'room123';
            const userId = 'user789';
            mockRoomRepository.addMemberToRoom.mockRejectedValue(
                new Error('Database error')
            );

            await expect(
                addMemberToRoomUseCase.execute(roomId, userId)
            ).rejects.toThrow('Database error');
        });

        it('should add multiple different members to same room', async () => {
            const roomId = 'room123';
            mockRoomRepository.addMemberToRoom.mockResolvedValue({
                success: true,
            });

            await addMemberToRoomUseCase.execute(roomId, 'user1');
            await addMemberToRoomUseCase.execute(roomId, 'user2');
            await addMemberToRoomUseCase.execute(roomId, 'user3');

            expect(mockRoomRepository.addMemberToRoom).toHaveBeenCalledTimes(3);
            expect(mockRoomRepository.addMemberToRoom).toHaveBeenNthCalledWith(
                1,
                roomId,
                'user1'
            );
            expect(mockRoomRepository.addMemberToRoom).toHaveBeenNthCalledWith(
                2,
                roomId,
                'user2'
            );
            expect(mockRoomRepository.addMemberToRoom).toHaveBeenNthCalledWith(
                3,
                roomId,
                'user3'
            );
        });
    });
});
