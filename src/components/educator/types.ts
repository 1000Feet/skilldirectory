
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
    youtube?: string;
  };
  ai_chatbot?: {
    knowledge_base: string[];
  };
  ai_voice_agent?: {
    knowledge_base: string[];
    voice_id: string;
  };
}

export interface BusinessProfileFormProps {
  initialData?: BusinessProfile | null;
  onSuccess?: () => void;
}
