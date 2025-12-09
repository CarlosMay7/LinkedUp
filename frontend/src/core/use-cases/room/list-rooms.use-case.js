export class ListRoomsUseCase {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    async execute() {
        try {
            const rooms = await this.roomRepository.findAll();
            return rooms;
        } catch (error) {
            throw new Error(`Error listing rooms: ${error.message}`);
        }
    }
}
