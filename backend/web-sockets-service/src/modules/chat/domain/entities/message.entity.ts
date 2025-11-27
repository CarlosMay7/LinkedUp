export class MessageEntity {
  constructor(
    public readonly senderId: string,
    public readonly content: string,
    public readonly roomId?: string,
    public readonly receiverId?: string,
    public readonly sentAt: Date = new Date(),
    public readonly _id?: string,
  ) {
    this.validateMessage();
  }

  private validateMessage(): void {
    if (!this.roomId && !this.receiverId) {
      throw new Error('Message must have either roomId or receiverId');
    }

    if (this.roomId && this.receiverId) {
      throw new Error('Message cannot have both roomId and receiverId');
    }

    if (!this.content || this.content.trim().length === 0) {
      throw new Error('Message content cannot be empty');
    }
  }

  isRoomMessage(): boolean {
    return !!this.roomId;
  }

  isPrivateMessage(): boolean {
    return !!this.receiverId;
  }
}
