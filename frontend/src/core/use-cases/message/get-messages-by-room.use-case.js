export class GetMessagesByRoomUseCase {
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }

    async execute({ roomId }) {
        if (!roomId) {
            throw new Error('Room ID is required');
        }

        try {
            const messages =
                await this.messageRepository.getMessagesByRoom(roomId);
            return messages.sort((a, b) => {
                const timeA = new Date(a.sentAt).getTime();
                const timeB = new Date(b.sentAt).getTime();
                return timeA - timeB;
            });
        } catch (error) {
            throw new Error(`Error fetching messages: ${error.message}`);
        }
    }
}
