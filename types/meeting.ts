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
  id: string;
  members: MeetingMember[];
  messages: ReceivedChatMessage[];
}

export interface SentChatMessage {
  senderID: string;
  receiverID: string;
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
