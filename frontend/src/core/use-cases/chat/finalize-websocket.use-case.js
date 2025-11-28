export class FinalizeWebSocketUseCase {
    constructor(websocketRepository) {
        this.websocketRepository = websocketRepository;
    }

    async execute() {
        try {
            // Emit disconnect event to server before disconnecting
            this.websocketRepository.emit('user:disconnecting', {
                timestamp: new Date(),
            });

            // Small delay to ensure server receives the message
            await new Promise(resolve => setTimeout(resolve, 100));

            this.websocketRepository.disconnect();
            return { finalized: true };
        } catch (error) {
            // Still disconnect even if emit fails
            this.websocketRepository.disconnect();
            throw new Error(`Error finalizing WebSocket: ${error.message}`);
        }
    }
}
