export class UserSessionEntity {
  constructor(
    public readonly userId: string,
    public readonly socketId: string,
    public readonly connectedAt: Date,
  ) {}
}
