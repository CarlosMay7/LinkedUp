export class Room {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public passwordHash: string,   // ❌ Nunca se expone
    public createdAt: Date,
    public updatedAt: Date,
    public isActive: boolean,
  ) {}
}