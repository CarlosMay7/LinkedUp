export class DeleteRoomUseCase {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    async execute({ roomId }) {
        if (!roomId) {
            throw new Error('Room ID is required');
        }

        try {
            await this.roomRepository.delete(roomId);
            return { deleted: true, roomId };
        } catch (error) {
            throw new Error(`Error deleting room: ${error.message}`);
        }
    }
}
