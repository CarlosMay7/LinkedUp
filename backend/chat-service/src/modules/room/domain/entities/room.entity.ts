export class RoomEntity {
  constructor(
    public readonly id: string | null = null,
    public name: string,
    public description: string | undefined,
    public members: string[],
    public readonly createdBy: string,
  ) {}

  addMember(userId: string): void {
    this.members.push(userId);
  }

  removeMember(userId: string): boolean {
    const initialLength = this.members.length;
    this.members = this.members.filter((member) => member !== userId);
    return this.members.length < initialLength;
  }

  isMember(userId: string): boolean {
    return this.members.includes(userId);
  }

  updateName(name: string): void {
    this.name = name;
  }

  updateDescription(description: string | undefined): void {
    this.description = description;
  }
}
