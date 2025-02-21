export interface EducatorProfile {
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
    youtube?: string;
  };
  ai_chatbot?: {
    knowledge_base: string[];
  };
  ai_voice_agent?: {
    knowledge_base: string[];
    voice_id: string;
  };
  image?: string | null;
  categories?: string[];
  tags?: string[];
  subscription_tier?: string;
}

export interface EducatorProfileFormProps {
  initialData?: EducatorProfile | null;
  onSuccess?: () => void;
}

export interface EducatorService {
  id: string;
  educator_profile_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  status: 'draft' | 'published' | 'archived';
  category: string | null;
  max_students: number;
  location_type: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceFormData {
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  category: string;
  max_students: number;
  location_type: string;
  status: 'draft' | 'published' | 'archived';
}
