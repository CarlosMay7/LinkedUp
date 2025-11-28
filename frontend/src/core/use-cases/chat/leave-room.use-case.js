export class LeaveRoomUseCase {
    constructor(websocketRepository) {
        this.websocketRepository = websocketRepository;
    }

    async execute(roomId, userId) {
        if (!roomId) {
            throw new Error('Room ID is required to leave a room');
        }

        try {
            this.websocketRepository.leaveRoom(roomId, userId);

            return { left: true, roomId };
        } catch (error) {
            throw new Error(`Error leaving room: ${error.message}`);
        }
    }
}
