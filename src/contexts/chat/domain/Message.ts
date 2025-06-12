export interface Message {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  messageType: string;
  replyToId: string | null;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}
