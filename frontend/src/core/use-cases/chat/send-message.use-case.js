export class SendMessageUseCase {
    constructor(websocketRepository) {
        this.websocketRepository = websocketRepository;
    }

    async execute({ senderId, roomId, content }) {
        if (!senderId || !roomId || !content) {
            throw new Error(
                'SenderId, roomId, and content are required to send a message'
            );
        }

        try {
            const message = {
                senderId,
                roomId,
                content,
            };

            this.websocketRepository.emit('sendMessage', message);

            return { sent: true, message };
        } catch (error) {
            throw new Error(`Error sending message: ${error.message}`);
        }
    }
}
