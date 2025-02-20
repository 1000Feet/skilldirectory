
export type UserType = 'student' | 'educator';

export interface BaseProfile {
  id: string;
  email: string;
  user_type: UserType;
}

export interface StudentProfile extends BaseProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export interface EducatorProfile extends BaseProfile {
  name: string;
  description: string | null;
  image: string | null;
}

export type Profile = StudentProfile | EducatorProfile;

export interface AuthUser {
  id: string;
  email: string;
  profile?: Profile;
  user_metadata: {
    user_type: UserType;
  };
}
