import { Database } from '@/lib/database.types';

export type Tables = Database['public']['Tables'];

// Field Permissions Table
export interface FieldPermission {
  id: string;
  field_name: string;
  basic: boolean;
  standard: boolean;
  premium: boolean;
  created_at: string;
  updated_at: string;
}

// Membership Table
export interface Membership {
  id: string;
  educator_id: string;
  type: 'basic' | 'standard' | 'premium';
  status: 'active' | 'past_due' | 'canceled';
  created_at: string;
  updated_at: string;
}

// Educator Profile
export interface EducatorProfile {
  id: string;
  user_id: string;
  name: string;
  description: string;
  website: string;
  address: string;
  phone: string;
  email: string;
  about_business: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url?: string;
  ai_chatbot?: string;
  ai_voice_agent?: {
    knowledge_base: string[];
    voice_id: string;
  };
  image?: string;
  categories?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export type VoiceAgent = {
  knowledge_base: string[];
  voice_id: string;
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          created_at: string;
          read_at: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          content: string;
          created_at?: string;
          read_at?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          created_at?: string;
          read_at?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_receiver_id_fkey";
            columns: ["receiver_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // ... existing tables ...
    };
  };
};
