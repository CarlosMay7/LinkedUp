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

            await new Promise(resolve => setTimeout(resolve, 100));

            this.websocketRepository.disconnect();
            return { finalized: true };
        } catch (error) {
            this.websocketRepository.disconnect();
            throw new Error(`Error finalizing WebSocket: ${error.message}`);
        }
    }
}
