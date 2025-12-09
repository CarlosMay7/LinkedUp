import { Room } from '../../core/entities/Room';

export class RoomMapper {
    static toDomain(dbRecord) {
        return Room.fromDatabase(dbRecord);
    }

    static toDTO(room) {
        return {
            id: room.id,
            name: room.name,
            createdBy: room.createdBy,
            createdAt: room.createdAt,
            isDirectMessage: room.isDirectMessage,
            members: room.members,
            memberCount: room.getMemberCount(),
        };
    }

    static toDTOList(rooms) {
        return rooms.map(room => this.toDTO(room));
    }

    static fromDTO(dto) {
        return new Room(dto);
    }

    static toPersistence(room) {
        return {
            id: room.id,
            name: room.name,
            created_by: room.createdBy,
            created_at: room.createdAt,
            is_direct_message: room.isDirectMessage,
            members: room.members,
        };
    }
}
