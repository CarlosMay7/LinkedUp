export class JoinRoomUseCase {
    constructor(websocketRepository) {
        this.websocketRepository = websocketRepository;
    }

    async execute(roomId, userId) {
        if (!roomId) {
            throw new Error('Room ID is required to join a room');
        }

        try {
            this.websocketRepository.emit('join-room', { roomId, userId });

            return { joined: true, roomId };
        } catch (error) {
            throw new Error(`Error joining room: ${error.message}`);
        }
    }
}
