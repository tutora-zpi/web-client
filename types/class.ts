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
