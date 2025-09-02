export interface Meeting {
  message: string;
  data: MeetingData;
}

export interface MeetingData {
  meetingID: string;
  members: MeetingMember[];
}

export interface MeetingMember {
  id: string;
  firstName: string;
  lastName: string;
  avatarURL: string;
}

export interface StartMeetingDTO {
  members: MeetingMember[];
}

export interface ChatData {
  data: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  reactions: string[];
  sentAt: Date;
}

export interface SentChatMessage {
  senderID: string;
  meetingID: string;
  content: string;
}

export interface ReceivedChatMessage {
  id: string;
  chatID: string;
  content: string;
  isRead: boolean;
  receiver: string;
  sender: string;
  sentAt: Date;
}

export interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}
