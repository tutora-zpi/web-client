export interface User {
  id: string;
  email: string;
  name: string;
  surname: string;
  avatarUrl: string;
}

export interface UseAuthReturn {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
