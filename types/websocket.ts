export interface SocketMessage {
  name: string;
  data: unknown;
}

export enum WSGeneral {
  UserJoinedWSEvent = "UserJoinedWSEvent",
  RoomUsersWSEvent = "RoomUsersWSEvent",
  UserLeftWSEvent = "UserLeftWSEvent",
}

export enum WSChat {
  ReactOnMessageWSEvent = "ReactOnMessageWSEvent",
  ReplyOnMessageWSEvent = "ReplyOnMessageWSEvent",
  SendMessageWSEvent = "SendMessageWSEvent",
  UserTypingWSEvent = "UserTypingWSEvent",
}

export enum WSBoard {
  BoardUpdateWSEvent = "BoardUpdateWSEvent",
}

export enum WSRTC {
  AnswerWSEvent = "AnswerWSEvent",
  IceCandidateWSEvent = "IceCandidateWSEvent",
  OfferWSEvent = "OfferWSEvent",
}
