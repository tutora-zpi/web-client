import { User } from "./user";

export interface Class {
  id: string;
  name: string;
  members: ClassUser[];
}

export interface ClassUser {
  userId: string;
  role: ClassUserRole;
}

export enum ClassUserRole {
  MEMBER = "MEMBER",
  HOST = "HOST",
}

export interface Invitation {
  classId: string;
  userId: string;
  status: InvitationStatus;
  createdAt: Date;
}

export interface InvitationWithDetails extends Invitation {
  classDetails: Class;
  userDetails: User;
}

export enum InvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}
