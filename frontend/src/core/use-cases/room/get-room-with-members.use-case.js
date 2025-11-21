export class GetRoomWithMembersUseCase {
    constructor(roomRepository, userRepository) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    async execute(roomId) {
        const room = await this.roomRepository.getRoomById(roomId);

        const users = await this.userRepository.getAllUsers();

        const membersWithDetails = room.members.map(memberId => {
            const user = users.find(user => user.uuid === memberId);
            return {
                user_uuid: memberId,
                username: user.username,
            };
        });

        return {
            ...room,
            members: membersWithDetails,
        };
    }
}
