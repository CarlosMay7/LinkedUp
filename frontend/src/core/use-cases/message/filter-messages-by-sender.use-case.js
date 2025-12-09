export class FilterMessagesBySenderUseCase {
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }

    async execute({ roomId, senderId }) {
        if (!roomId || !senderId) {
            throw new Error('Room ID and Sender ID are required');
        }

        try {
            const getMessagesPromise =
                this.messageRepository.getMessagesByRoom(roomId);
            const messages = await getMessagesPromise;
            return messages.filter(msg => msg.senderId === senderId);
        } catch (error) {
            throw new Error(`Error filtering messages: ${error.message}`);
        }
    }
}
