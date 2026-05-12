export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: boolean;
}

export interface Session {
  user: User;
  session: {
    token: string;
    expiresAt: number;
  };
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  createdAt: string;
}
