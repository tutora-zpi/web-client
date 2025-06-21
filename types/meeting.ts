export interface Meeting {
  message: string;
  data: MeetingData;
}

export interface MeetingData {
  meetingID: string;
  members: UserMeetingMember[];
}

export interface UserMeetingMember {
  id: string;
  firstName: string;
  lastName: string;
  avatarURL: string;
}

export interface StartMeetingDTO {
  members: UserMeetingMember[];
}

export interface ChatData {
  id: string;
  members: UserMeetingMember[];
  messages: ReceivedChatMessage[];
}

export interface SentChatMessage {
  senderID: string;
  receiverID: string;
  meetingID: string;
  content: string;
}

export interface ReceivedChatMessage {
  chatID: string;
  content: string;
  id: string;
  isRead: boolean;
  receiver: string;
  sender: string;
  sentAt: Date;
}
