export interface Meeting {
  message: string;
  data: MeetingData;
}

export interface MeetingData {
  meetingId: string;
  members: UserDTO[];
  startDate: Date;
  finishDate: Date;
  title: string;
}

export interface UserDTO {
  id: string;
  firstName: string;
  lastName: string;
  avatarURL: string;
}

export interface StartMeetingDTO {
  members: UserDTO[];
  title: string;
  classId: string;
  finishDate: string;
}

export interface ChatData {
  data: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  reactions?: Reaction[];
  fileLink?: string;
  sentAt: number;
}

export interface SentChatMessage {
  senderId: string;
  chatId: string;
  content: string;
  sentAt: number;
}

export interface Reaction {
  messageId: string;
  userId: string;
  emoji: string;
  chatId: string;
}

export const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢"];
