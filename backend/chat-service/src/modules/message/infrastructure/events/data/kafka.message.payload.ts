export interface KafkaMessagePayload {
  messageId?: string;
  senderId: string;             
  receiverId?: string;          
  roomId?: string;              
  content: string;                 
  timestamp?: string | number;  
  metadata?: Record<string, any>; 
}