export class RoomRepository {
    constructor(dbClient) {
        this.dbClient = dbClient;
    }

    async getAllRooms() {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/room`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            const data = await response.json();
            return data;
        } catch (e) {
            console.error('Error fetching rooms:', e);
        }
    }

    async searchRoomByName(name) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/room/search/${name}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            const data = await response.json();
            return data;
        } catch (e) {
            console.error('Error fetching room:', e);
        }
    }

    async createRoom(
        name,
        description = '',
        members = [],
        createdBy = null,
        isDirectMessage = false
    ) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/room`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name,
                        description,
                        members,
                        createdBy,
                        isDirectMessage,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create room');
            }

            const data = await response.json();
            return data;
        } catch (e) {
            console.error('Error creating room:', e);
            throw e;
        }
    }

    async deleteRoom(roomId) {
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/room/${roomId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        } catch (e) {
            console.error('Error deleting room:', e);
        }
    }

    async getRoomById(roomId) {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/room/${roomId}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            const data = await response.json();
            return data;
        } catch (e) {
            console.error('Error fetching room', e);
        }
    }
}
