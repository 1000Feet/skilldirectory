import { MembershipType } from '@/lib/auth-types';

export interface FieldPermission {
  field_name: string;
  basic: boolean;
  standard: boolean;
  premium: boolean;
}

export const EDUCATOR_PROFILE_FIELDS = [
  'name',
  'description',
  'website',
  'address',
  'phone',
  'email',
  'about_business',
  'facebook_url',
  'instagram_url',
  'youtube_url',
  'ai_chatbot',
  'ai_voice_agent',
  'image',
  'categories',
  'tags'
] as const;

export type EducatorProfileField = typeof EDUCATOR_PROFILE_FIELDS[number];

export interface MembershipFieldPermissions {
  [key: string]: {
    [K in MembershipType]: boolean;
  };
}

// Default permissions - all fields enabled for premium, basic fields for basic
export const DEFAULT_FIELD_PERMISSIONS: MembershipFieldPermissions = {
  name: { basic: true, standard: true, premium: true },
  description: { basic: true, standard: true, premium: true },
  website: { basic: false, standard: true, premium: true },
  address: { basic: false, standard: true, premium: true },
  phone: { basic: true, standard: true, premium: true },
  email: { basic: true, standard: true, premium: true },
  about_business: { basic: false, standard: true, premium: true },
  facebook_url: { basic: false, standard: true, premium: true },
  instagram_url: { basic: false, standard: true, premium: true },
  youtube_url: { basic: false, standard: true, premium: true },
  ai_chatbot: { basic: false, standard: false, premium: true },
  ai_voice_agent: { basic: false, standard: false, premium: true },
  image: { basic: true, standard: true, premium: true },
  categories: { basic: true, standard: true, premium: true },
  tags: { basic: false, standard: true, premium: true }
};
