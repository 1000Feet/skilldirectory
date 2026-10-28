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
      admin_users: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      educator_profiles: {
        Row: {
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
          image?: string;
          categories?: string[];
          tags?: string[];
          created_at: string;
          updated_at: string;
          last_active?: string;
          ai_voice_agent: {
            knowledge_base: string[];
            voice_id: string;
          };
          ai_chatbot: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          website?: string;
          address?: string;
          phone?: string;
          email?: string;
          about_business?: string;
          facebook_url?: string;
          instagram_url?: string;
          youtube_url?: string;
          image?: string;
          categories?: string[];
          tags?: string[];
          created_at?: string;
          updated_at?: string;
          last_active?: string;
          ai_voice_agent?: {
            knowledge_base: string[];
            voice_id: string;
          };
          ai_chatbot?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          website?: string;
          address?: string;
          phone?: string;
          email?: string;
          about_business?: string;
          facebook_url?: string;
          instagram_url?: string;
          youtube_url?: string;
          image?: string;
          categories?: string[];
          tags?: string[];
          created_at?: string;
          updated_at?: string;
          last_active?: string;
          ai_voice_agent?: {
            knowledge_base: string[];
            voice_id: string;
          };
          ai_chatbot?: string;
        };
      };
      field_permissions: {
        Row: {
          id: string;
          field_name: string;
          basic: boolean;
          standard: boolean;
          premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          field_name: string;
          basic: boolean;
          standard: boolean;
          premium: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          field_name?: string;
          basic?: boolean;
          standard?: boolean;
          premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      memberships: {
        Row: {
          id: string;
          educator_id: string;
          type: 'basic' | 'standard' | 'premium';
          status: 'active' | 'past_due' | 'canceled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          educator_id: string;
          type: 'basic' | 'standard' | 'premium';
          status: 'active' | 'past_due' | 'canceled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          educator_id?: string;
          type?: 'basic' | 'standard' | 'premium';
          status?: 'active' | 'past_due' | 'canceled';
          created_at?: string;
          updated_at?: string;
        };
      };
      profile_views: {
        Row: {
          id: string;
          educator_profile_id: string;
          viewed_at: string;
          viewer_id: string | null;
          ip_address: string | null;
        };
        Insert: {
          id?: string;
          educator_profile_id: string;
          viewed_at?: string;
          viewer_id?: string | null;
          ip_address?: string | null;
        };
        Update: {
          id?: string;
          educator_profile_id?: string;
          viewed_at?: string;
          viewer_id?: string | null;
          ip_address?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profile_views_educator_profile_id_fkey";
            columns: ["educator_profile_id"];
            isOneToOne: false;
            referencedRelation: "educator_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profile_views_viewer_id_fkey";
            columns: ["viewer_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      student_profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          name: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
          favorites: string[];
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
          favorites?: string[];
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          name?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
          favorites?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "student_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_profile_view_count: {
        Args: {
          educator_id: string;
        };
        Returns: Array<{
          total_views: number;
          unique_views: number;
          last_24h_views: number;
        }>;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
