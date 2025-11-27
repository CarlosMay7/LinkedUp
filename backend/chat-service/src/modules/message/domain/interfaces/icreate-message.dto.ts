export interface ICreateMessageDto {
  roomId?: string;
  senderId: string;
  receiverId?: string;
  content: string;
  validateEitherRoomOrReceiver?: any;
}
