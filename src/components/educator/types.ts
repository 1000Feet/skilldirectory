
export interface BusinessProfile {
  id?: string;
  user_id?: string;
  name: string;
  description: string;
  website: string;
  address: string;
  phone: string;
  email: string;
  about_business: string;
  social: {
    facebook: string;
    instagram: string;
  };
}

export interface BusinessProfileFormProps {
  initialData?: BusinessProfile | null;
  onSuccess?: () => void;
}
