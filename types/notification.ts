import { UserDTO } from "./meeting";

export interface Notification {
  id: string;
  receiver: UserDTO;
  sender?: UserDTO | null;
  title: string;
  body: string;
  redirectionLink: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: { [key: string]: any };
  createdAt: number;
}
