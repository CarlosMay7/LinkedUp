export class UpdateRoomUseCase {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    async execute({ roomId, updates }) {
        if (!roomId || !updates) {
            throw new Error('Room ID and updates are required');
        }

        try {
            const updatedRoom = await this.roomRepository.update(
                roomId,
                updates
            );
            return updatedRoom;
        } catch (error) {
            throw new Error(`Error updating room: ${error.message}`);
        }
    }
}
