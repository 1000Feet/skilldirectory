
export type UserType = 'student' | 'educator';

export interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  user_type: UserType;
  avatar_url: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
  user_metadata?: {
    email: string;
    email_verified: boolean;
    phone_verified: boolean;
    sub: string;
    user_type: UserType;
  };
}
