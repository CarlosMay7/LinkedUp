export class RoomSessionEntity {
  constructor(
    public readonly roomId: string,
    public readonly userId: string,
    public readonly socketId: string,
    public readonly joinedAt: Date,
  ) {}
}
