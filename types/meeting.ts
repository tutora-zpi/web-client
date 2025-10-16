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
  sender: string;
  content: string;
  reactions: Reaction[];
  answers: string[];
  sentAt: Date;
}

export interface SentChatMessage {
  senderID: string;
  meetingID: string;
  content: string;
}

export interface PeerConnection {
  id: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

export interface Reaction {
  messageID: string;
  userID: string;
  emoji: string;
  chatID: string;
}
