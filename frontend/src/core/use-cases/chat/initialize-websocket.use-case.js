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

            // Wait for connection with longer timeout
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(
                        new Error(
                            'Timeout initializing WebSocket - Server may be unavailable. Please check if the WebSocket service is running on port 3002'
                        )
                    );
                }, 15000); // Increased from 5000 to 15000ms

                if (this.websocketRepository.isConnected()) {
                    clearTimeout(timeout);
                    resolve({ initialized: true });
                } else {
                    const socket = this.websocketRepository.socket;

                    const handleConnect = () => {
                        clearTimeout(timeout);
                        socket.off('connect', handleConnect);
                        socket.off('connect_error', handleConnectError);
                        resolve({ initialized: true });
                    };

                    const handleConnectError = error => {
                        clearTimeout(timeout);
                        socket.off('connect', handleConnect);
                        socket.off('connect_error', handleConnectError);
                        reject(
                            new Error(
                                `WebSocket connection error: ${error.message}`
                            )
                        );
                    };

                    socket.once('connect', handleConnect);
                    socket.once('connect_error', handleConnectError);
                }
            });
        } catch (error) {
            throw new Error(`Error initializing WebSocket: ${error.message}`);
        }
    }
}
