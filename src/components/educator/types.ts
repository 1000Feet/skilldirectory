
export interface BusinessProfile {
  id?: string;
  name: string;
  description?: string;
  image?: string;
  website?: string;
  address?: string;
  phone?: string;
  email: string;
  categories?: string[];
  tags?: string[];
  social?: {
    facebook: string;
    instagram: string;
  };
  about_business?: string;
  user_id?: string;
  subscription_tier?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BusinessProfileFormProps {
  initialData?: BusinessProfile;
  onSuccess?: () => void;
}
