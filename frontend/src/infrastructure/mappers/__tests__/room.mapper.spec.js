import { RoomMapper } from '../room.mapper';
import { Room } from '../../../core/entities/Room';

jest.mock('../../../core/entities/Room');

describe('RoomMapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('toDomain', () => {
        it('should convert database record to room domain entity', () => {
            const dbRecord = {
                id: '1',
                name: 'Test Room',
                created_by: 'user-1',
                created_at: '2024-01-01T00:00:00Z',
            };

            Room.fromDatabase.mockReturnValue({
                id: '1',
                name: 'Test Room',
            });

            const result = RoomMapper.toDomain(dbRecord);

            expect(Room.fromDatabase).toHaveBeenCalledWith(dbRecord);
            expect(result.name).toBe('Test Room');
        });
    });

    describe('toDTO', () => {
        it('should convert room entity to DTO', () => {
            const room = {
                id: '1',
                name: 'Test Room',
                createdBy: 'user-1',
                createdAt: '2024-01-01T00:00:00Z',
                isDirectMessage: false,
                members: ['user-1', 'user-2'],
                getMemberCount: jest.fn().mockReturnValue(2),
            };

            const result = RoomMapper.toDTO(room);

            expect(result).toEqual({
                id: '1',
                name: 'Test Room',
                createdBy: 'user-1',
                createdAt: '2024-01-01T00:00:00Z',
                isDirectMessage: false,
                members: ['user-1', 'user-2'],
                memberCount: 2,
            });
        });

        it('should call getMemberCount method', () => {
            const room = {
                id: '2',
                name: 'Another Room',
                createdBy: 'user-2',
                createdAt: '2024-01-02T00:00:00Z',
                isDirectMessage: true,
                members: ['user-3'],
                getMemberCount: jest.fn().mockReturnValue(1),
            };

            RoomMapper.toDTO(room);

            expect(room.getMemberCount).toHaveBeenCalled();
        });
    });

    describe('toDTOList', () => {
        it('should convert array of rooms to DTOs', () => {
            const rooms = [
                {
                    id: '1',
                    name: 'Room 1',
                    createdBy: 'user-1',
                    createdAt: '2024-01-01T00:00:00Z',
                    isDirectMessage: false,
                    members: ['user-1', 'user-2'],
                    getMemberCount: jest.fn().mockReturnValue(2),
                },
                {
                    id: '2',
                    name: 'Room 2',
                    createdBy: 'user-2',
                    createdAt: '2024-01-02T00:00:00Z',
                    isDirectMessage: true,
                    members: ['user-3'],
                    getMemberCount: jest.fn().mockReturnValue(1),
                },
            ];

            const result = RoomMapper.toDTOList(rooms);

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('1');
            expect(result[1].id).toBe('2');
        });

        it('should handle empty array', () => {
            const result = RoomMapper.toDTOList([]);

            expect(result).toEqual([]);
        });
    });

    describe('fromDTO', () => {
        it('should create room entity from DTO', () => {
            const dto = {
                id: '1',
                name: 'Test Room',
                createdBy: 'user-1',
            };

            Room.mockImplementation(() => ({
                id: '1',
                name: 'Test Room',
            }));

            RoomMapper.fromDTO(dto);

            expect(Room).toHaveBeenCalledWith(dto);
        });
    });

    describe('toPersistence', () => {
        it('should convert room to persistence format', () => {
            const room = {
                id: '1',
                name: 'Test Room',
                createdBy: 'user-1',
                createdAt: '2024-01-01T00:00:00Z',
                isDirectMessage: false,
                members: ['user-1', 'user-2'],
            };

            const result = RoomMapper.toPersistence(room);

            expect(result).toEqual({
                id: '1',
                name: 'Test Room',
                created_by: 'user-1',
                created_at: '2024-01-01T00:00:00Z',
                is_direct_message: false,
                members: ['user-1', 'user-2'],
            });
        });

        it('should convert camelCase to snake_case', () => {
            const room = {
                id: '2',
                name: 'Another Room',
                createdBy: 'user-2',
                createdAt: '2024-01-02T00:00:00Z',
                isDirectMessage: true,
                members: ['user-3'],
            };

            const result = RoomMapper.toPersistence(room);

            expect(result.created_by).toBe('user-2');
            expect(result.created_at).toBe('2024-01-02T00:00:00Z');
            expect(result.is_direct_message).toBe(true);
        });
    });
});
