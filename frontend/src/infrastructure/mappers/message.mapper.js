import { Message } from '../../core/entities/Message';

export class MessageMapper {
    static toDomain(dbRecord) {
        return Message.fromDatabase(dbRecord);
    }

    static fromWebSocket(wsData) {
        return Message.fromWebSocketData(wsData);
    }

    static toDTO(message) {
        return {
            id: message.id,
            content: message.content,
            senderId: message.senderId,
            roomId: message.roomId,
            sentAt: message.sentAt,
            senderName: message.senderName,
            censored: message.censored,
        };
    }

    static toDTOList(messages) {
        return messages.map(msg => this.toDTO(msg));
    }

    static fromDTO(dto) {
        return new Message(dto);
    }

    static toPersistence(message) {
        return {
            id: message.id,
            content: message.content,
            sender_id: message.senderId,
            room_id: message.roomId,
            sent_at: message.sentAt,
            sender_name: message.senderName,
            censored: message.censored,
        };
    }
}
