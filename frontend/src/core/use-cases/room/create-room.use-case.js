export class CreateRoomUseCase {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    async execute({ name, createdBy, isDirectMessage = false, members = [] }) {
        if (!name || !createdBy) {
            throw new Error('Room name and creator are required');
        }

        try {
            const room = await this.roomRepository.create({
                name,
                created_by: createdBy,
                is_direct_message: isDirectMessage,
                members,
            });

            return room;
        } catch (error) {
            throw new Error(`Error creating room: ${error.message}`);
        }
    }
}
