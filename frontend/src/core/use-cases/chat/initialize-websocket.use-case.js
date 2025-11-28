export class InitializeWebSocketUseCase {
    constructor(websocketRepository) {
        this.websocketRepository = websocketRepository;
    }

    async execute(token) {
        if (!token) {
            throw new Error('Token required to initialize WebSocket');
        }

        try {
            this.websocketRepository.connect(token);

            // Wait for connection
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Timeout initializing WebSocket'));
                }, 5000);

                if (this.websocketRepository.isConnected()) {
                    clearTimeout(timeout);
                    resolve({ initialized: true });
                } else {
                    this.websocketRepository.socket.once('connect', () => {
                        clearTimeout(timeout);
                        resolve({ initialized: true });
                    });

                    this.websocketRepository.socket.once(
                        'connect_error',
                        error => {
                            clearTimeout(timeout);
                            reject(error);
                        }
                    );
                }
            });
        } catch (error) {
            throw new Error(`Error initializing WebSocket: ${error.message}`);
        }
    }
}
