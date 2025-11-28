export class AddMemberToRoomUseCase {
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }

    async execute(roomId, userId) {
        await this.roomRepository.addMemberToRoom(roomId, userId);
    }
}
