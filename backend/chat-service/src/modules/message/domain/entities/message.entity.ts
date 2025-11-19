export class MessageEntity {
  id?: string;
  roomId?: string;
  senderId: string;
  receiverId?: string;
  content: string;
  sentAt: Date;

  constructor(
    senderId: string,
    content: string,
    sentAt: Date = new Date(),
    id?: string,
    roomId?: string,
    receiverId?: string,
  ) {
    this.id = id;
    this.roomId = roomId;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.content = content;
    this.sentAt = sentAt;
  }

  /**
   * Check if this is a private message between two users
   */
  isPrivate(): boolean {
    return !this.roomId && !!this.receiverId;
  }

  /**
   * Check if this is a room message
   */
  isRoomMessage(): boolean {
    return !!this.roomId && !this.receiverId;
  }

  /**
   * Update the content of the message
   */
  updateContent(newContent: string): void {
    if (!newContent || newContent.trim().length === 0) {
      throw new Error('Content cannot be empty');
    }
    this.content = newContent;
  }

  /**
   * Check if the message belongs to a specific user
   */
  belongsToUser(userId: string): boolean {
    return this.senderId === userId || this.receiverId === userId;
  }
}
