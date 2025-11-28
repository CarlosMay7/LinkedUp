export interface IMessageBroker {
  sendToRoom(roomId: string, message: any): void;
  sendToUser(userId: string, message: any): void;
  broadcastToRoom(roomId: string, event: string, data: any): void;
  notifyUser(userId: string, event: string, data: any): void;
}

export const MESSAGE_BROKER = Symbol('MESSAGE_BROKER');
