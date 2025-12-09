export class Room {
    constructor({
        id,
        name,
        createdBy,
        createdAt,
        isDirectMessage = false,
        members = [],
    }) {
        this.id = id;
        this.name = name;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.isDirectMessage = isDirectMessage;
        this.members = members;
    }

    static fromDatabase(dbRecord) {
        return new Room({
            id: dbRecord.id,
            name: dbRecord.name,
            createdBy: dbRecord.created_by,
            createdAt: dbRecord.created_at,
            isDirectMessage: dbRecord.is_direct_message || false,
            members: dbRecord.members || [],
        });
    }

    isMember(userId) {
        return this.members.some(member => member.user_uuid === userId);
    }

    getMemberCount() {
        return this.members.length;
    }

    getOtherMember(currentUserId) {
        if (!this.isDirectMessage) {
            return null;
        }
        return this.members.find(member => member.user_uuid !== currentUserId);
    }

    getDisplayName(currentUserId) {
        if (!this.isDirectMessage) {
            return this.name;
        }
        const otherMember = this.getOtherMember(currentUserId);
        return otherMember ? otherMember.username : this.name;
    }
}
