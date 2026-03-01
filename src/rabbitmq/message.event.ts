export interface MessageEvent {
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: Date;
}
