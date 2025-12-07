export interface MessageCreatedPayload {
  senderId: string;
  content: string;
  roomId?: string;
  receiverId?: string;
  timestamp?: string | number;
  metadata?: Record<string, any>;
}

export interface MessageProcessedPayload {
  id: string;
  roomId?: string;
  senderId: string;
  receiverId?: string;
  content: string;
  sentAt: string | Date;
}
