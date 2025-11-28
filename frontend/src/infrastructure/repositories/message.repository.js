export class MessageRepository {
    constructor(dbClient) {
        this.dbClient = dbClient;
    }

    async getMessagesByRoom(roomId) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/messages/room/${roomId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching messages by room:', error);
            throw error;
        }
    }
}
