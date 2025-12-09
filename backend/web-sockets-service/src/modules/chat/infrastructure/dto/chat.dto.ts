import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  senderId: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  receiverId?: string;
}

export class JoinRoomDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class LeaveRoomDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class TypingDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsBoolean()
  isTyping: boolean;

  @IsOptional()
  @IsString()
  roomId?: string;

  @IsOptional()
  @IsString()
  receiverId?: string;
}

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class MessageDeliveredDto {
  @IsNotEmpty()
  @IsString()
  messageId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class MessageReadDto {
  @IsNotEmpty()
  @IsString()
  messageId: string;

  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class GetOnlineUsersDto {
  @IsNotEmpty()
  @IsString()
  roomId: string;
}

export class MessageResponse {
  messageId: string;
  roomId?: string;
  senderId: string;
  receiverId?: string;
  content: string;
  timestamp: Date;
}
