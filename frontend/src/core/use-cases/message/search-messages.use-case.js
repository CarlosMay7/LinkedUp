export class SearchMessagesUseCase {
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }

    async execute({ roomId, query }) {
        if (!roomId || !query) {
            throw new Error('Room ID and search query are required');
        }

        try {
            const messages =
                await this.messageRepository.getMessagesByRoom(roomId);
            const lowerQuery = query.toLowerCase();
            return messages.filter(msg =>
                msg.content.toLowerCase().includes(lowerQuery)
            );
        } catch (error) {
            throw new Error(`Error searching messages: ${error.message}`);
        }
    }
}
