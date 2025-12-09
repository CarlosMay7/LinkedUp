import { RoomRepository } from '../room.repository';

describe('RoomRepository', () => {
    let roomRepository;
    let mockDbClient;

    beforeEach(() => {
        mockDbClient = {};
        roomRepository = new RoomRepository(mockDbClient);

        // Mock fetch globally
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('getAllRooms', () => {
        it('should fetch all rooms', async () => {
            const mockRooms = [
                { id: '1', name: 'Room 1', description: 'First room' },
                { id: '2', name: 'Room 2', description: 'Second room' },
            ];

            global.fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue(mockRooms),
            });

            const result = await roomRepository.getAllRooms();

            expect(global.fetch).toHaveBeenCalled();
            expect(result).toEqual(mockRooms);
        });

        it('should handle empty rooms response', async () => {
            global.fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue([]),
            });

            const result = await roomRepository.getAllRooms();

            expect(result).toEqual([]);
        });

        it('should use correct API endpoint', async () => {
            global.fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue([]),
            });

            await roomRepository.getAllRooms();

            const callUrl = global.fetch.mock.calls[0][0];
            expect(callUrl).toContain('/room');
        });
    });

    describe('searchRoomByName', () => {
        it('should search rooms by name', async () => {
            const mockRooms = [
                { id: '1', name: 'Test Room', description: 'A test room' },
            ];

            global.fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue(mockRooms),
            });

            const result = await roomRepository.searchRoomByName('test');

            expect(global.fetch).toHaveBeenCalled();
            expect(result).toEqual(mockRooms);
        });

        it('should return empty array if no rooms found', async () => {
            global.fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue([]),
            });

            const result = await roomRepository.searchRoomByName('notfound');

            expect(result).toEqual([]);
        });

        it('should use correct search endpoint', async () => {
            global.fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue([]),
            });

            await roomRepository.searchRoomByName('searchterm');

            const callUrl = global.fetch.mock.calls[0][0];
            expect(callUrl).toContain('/room/search/searchterm');
        });
    });

    describe('createRoom', () => {
        it('should create a new room', async () => {
            const mockResponse = { id: '1', name: 'New Room' };

            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const result = await roomRepository.createRoom(
                'New Room',
                'Description'
            );

            expect(global.fetch).toHaveBeenCalled();
            expect(result).toEqual(mockResponse);
        });

        it('should include all room parameters in request', async () => {
            const roomData = {
                name: 'My Room',
                description: 'Room description',
                members: ['user1', 'user2'],
                createdBy: 'user1',
                isDirectMessage: false,
            };

            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue({ id: '1' }),
            });

            await roomRepository.createRoom(
                roomData.name,
                roomData.description,
                roomData.members,
                roomData.createdBy,
                roomData.isDirectMessage
            );

            const [, options] = global.fetch.mock.calls[0];
            const body = JSON.parse(options.body);
            expect(body.name).toBe('My Room');
            expect(body.members).toEqual(['user1', 'user2']);
        });

        it('should throw error if room creation fails', async () => {
            global.fetch.mockResolvedValue({
                ok: false,
                json: jest
                    .fn()
                    .mockResolvedValue({ message: 'Room already exists' }),
            });

            await expect(
                roomRepository.createRoom('Existing Room')
            ).rejects.toThrow();
        });

        it('should handle default parameters', async () => {
            global.fetch.mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue({ id: '1' }),
            });

            await roomRepository.createRoom('Room');

            const [, options] = global.fetch.mock.calls[0];
            const body = JSON.parse(options.body);
            expect(body.description).toBe('');
            expect(body.members).toEqual([]);
            expect(body.isDirectMessage).toBe(false);
        });
    });

    describe('deleteRoom', () => {
        it('should delete a room', async () => {
            global.fetch.mockResolvedValue({});

            await roomRepository.deleteRoom('room-123');

            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/room/room-123'),
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
        });
    });

    describe('getRoomById', () => {
        it('should fetch a room by ID', async () => {
            const mockRoom = {
                id: '1',
                name: 'Room 1',
                description: 'Test room',
            };

            global.fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue(mockRoom),
            });

            const result = await roomRepository.getRoomById('1');

            expect(result).toEqual(mockRoom);
            expect(global.fetch).toHaveBeenCalled();
        });

        it('should use correct endpoint', async () => {
            global.fetch.mockResolvedValue({
                json: jest.fn().mockResolvedValue({}),
            });

            await roomRepository.getRoomById('room-456');

            const callUrl = global.fetch.mock.calls[0][0];
            expect(callUrl).toContain('/room/room-456');
        });
    });
});
