export class Message {
    constructor({
        id,
        content,
        senderId,
        roomId,
        sentAt,
        senderName,
        censored = false,
    }) {
        this.id = id;
        this.content = content;
        this.senderId = senderId;
        this.roomId = roomId;
        this.sentAt = sentAt;
        this.senderName = senderName;
        this.censored = censored;
    }

    static fromDatabase(dbRecord) {
        return new Message({
            id: dbRecord.id,
            content: dbRecord.content,
            senderId: dbRecord.sender_id,
            roomId: dbRecord.room_id,
            sentAt: dbRecord.sent_at,
            senderName: dbRecord.sender_name,
            censored: dbRecord.censored || false,
        });
    }

    static fromWebSocketData(data) {
        return new Message({
            id: data.id,
            content: data.content,
            senderId: data.senderId,
            roomId: data.roomId,
            sentAt: data.sentAt || new Date().toISOString(),
            senderName: data.senderName,
            censored: false,
        });
    }

    isRecent(minutes = 5) {
        const sentTime = new Date(this.sentAt).getTime();
        const now = new Date().getTime();
        return now - sentTime < minutes * 60 * 1000;
    }

    markAsCensored() {
        this.censored = true;
    }
}
