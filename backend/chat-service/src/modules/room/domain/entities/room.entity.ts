export class RoomEntity {
  public readonly id?: string;

  constructor(
    name: string,
    description: string,
    members: string[],
    createdBy: string,
    isDirectMessage: boolean,
    id?: string,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.members = members;
    this.createdBy = createdBy;
    this.isDirectMessage = isDirectMessage;
  }

  public name: string;
  public description: string;
  public members: string[];
  public readonly createdBy: string;
  public readonly isDirectMessage: boolean;

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
