export interface SendMessageDto {
  roomId?: string;
  senderId: string;
  receiverId?: string;
  content: string;
}

export interface JoinRoomDto {
  roomId: string;
  userId: string;
}

export interface LeaveRoomDto {
  roomId: string;
  userId: string;
}

export interface TypingDto {
  roomId?: string;
  userId: string;
  receiverId?: string;
  isTyping: boolean;
}

export interface RegisterDto {
  userId: string;
}

export interface MessageDeliveredDto {
  messageId: string;
  userId: string;
}

export interface MessageReadDto {
  messageId: string;
  userId: string;
}

export interface GetOnlineUsersDto {
  roomId: string;
}

export interface MessageResponse {
  messageId: string;
  roomId?: string;
  senderId: string;
  receiverId?: string;
  content: string;
  timestamp: Date;
}
