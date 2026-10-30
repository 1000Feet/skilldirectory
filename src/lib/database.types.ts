export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Generated from the live database schema (see supabase-backup/schema.sql).
export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string | null;
          user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string | null;
          user_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      api_keys: {
        Row: {
          id: number | null;
          key: string | null;
          value: string | null;
          created_at: string;
        };
        Insert: {
          id?: number | null;
          key?: string | null;
          value?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number | null;
          key?: string | null;
          value?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string | null;
          name: string;
          icon_name: string;
          display_order: number | null;
          is_active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          name: string;
          icon_name: string;
          display_order?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          name?: string;
          icon_name?: string;
          display_order?: number | null;
          is_active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          id: string | null;
          sender_id: string;
          receiver_id: string;
          content: string;
          read_at: string | null;
          deleted_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string | null;
          sender_id: string;
          receiver_id: string;
          content: string;
          read_at?: string | null;
          deleted_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string | null;
          sender_id?: string;
          receiver_id?: string;
          content?: string;
          read_at?: string | null;
          deleted_at?: string | null;
          created_at?: string | null;
        };
        Relationships: [];
      };
      educator_profiles: {
        Row: {
          id: string | null;
          user_id: string;
          name: string;
          email: string;
          description: string | null;
          about_business: string | null;
          image: string | null;
          website: string | null;
          address: string | null;
          phone: string | null;
          facebook_url: string | null;
          instagram_url: string | null;
          youtube_url: string | null;
          ai_chatbot: string | null;
          ai_voice_agent: Json | null;
          categories: string[] | null;
          tags: string[] | null;
          is_active: boolean | null;
          is_featured: boolean | null;
          last_active: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          user_id: string;
          name: string;
          email: string;
          description?: string | null;
          about_business?: string | null;
          image?: string | null;
          website?: string | null;
          address?: string | null;
          phone?: string | null;
          facebook_url?: string | null;
          instagram_url?: string | null;
          youtube_url?: string | null;
          ai_chatbot?: string | null;
          ai_voice_agent?: Json | null;
          categories?: string[] | null;
          tags?: string[] | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          last_active?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          user_id?: string;
          name?: string;
          email?: string;
          description?: string | null;
          about_business?: string | null;
          image?: string | null;
          website?: string | null;
          address?: string | null;
          phone?: string | null;
          facebook_url?: string | null;
          instagram_url?: string | null;
          youtube_url?: string | null;
          ai_chatbot?: string | null;
          ai_voice_agent?: Json | null;
          categories?: string[] | null;
          tags?: string[] | null;
          is_active?: boolean | null;
          is_featured?: boolean | null;
          last_active?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      environment_variables: {
        Row: {
          id: string | null;
          key: string;
          value: string;
          description: string | null;
          is_encrypted: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          key: string;
          value: string;
          description?: string | null;
          is_encrypted?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          key?: string;
          value?: string;
          description?: string | null;
          is_encrypted?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      field_permissions: {
        Row: {
          id: number | null;
          permissions: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number | null;
          permissions?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number | null;
          permissions?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      lesson_requests: {
        Row: {
          id: string | null;
          student_id: string;
          educator_id: string;
          educator_profile_id: string;
          proposed_date: string;
          proposed_time: string | null;
          message: string | null;
          message_from_educator: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          student_id: string;
          educator_id: string;
          educator_profile_id: string;
          proposed_date: string;
          proposed_time?: string | null;
          message?: string | null;
          message_from_educator?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          student_id?: string;
          educator_id?: string;
          educator_profile_id?: string;
          proposed_date?: string;
          proposed_time?: string | null;
          message?: string | null;
          message_from_educator?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lesson_requests_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lesson_requests_educator_profile_id_fkey";
            columns: ["educator_profile_id"];
            isOneToOne: false;
            referencedRelation: "educator_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      memberships: {
        Row: {
          id: string | null;
          educator_id: string;
          type: string;
          status: string;
          start_date: string;
          end_date: string | null;
          current_period_start: string;
          current_period_end: string;
          auto_renew: boolean;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          educator_id: string;
          type: string;
          status?: string;
          start_date?: string;
          end_date?: string | null;
          current_period_start?: string;
          current_period_end: string;
          auto_renew?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          educator_id?: string;
          type?: string;
          status?: string;
          start_date?: string;
          end_date?: string | null;
          current_period_start?: string;
          current_period_end?: string;
          auto_renew?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "memberships_educator_id_fkey";
            columns: ["educator_id"];
            isOneToOne: false;
            referencedRelation: "educator_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      membership_payments: {
        Row: {
          id: string | null;
          membership_id: string;
          amount: number;
          currency: string;
          status: string;
          payment_method: string;
          transaction_id: string | null;
          payment_date: string;
          created_at: string;
          metadata: Json | null;
        };
        Insert: {
          id?: string | null;
          membership_id: string;
          amount: number;
          currency?: string;
          status: string;
          payment_method: string;
          transaction_id?: string | null;
          payment_date?: string;
          created_at?: string;
          metadata?: Json | null;
        };
        Update: {
          id?: string | null;
          membership_id?: string;
          amount?: number;
          currency?: string;
          status?: string;
          payment_method?: string;
          transaction_id?: string | null;
          payment_date?: string;
          created_at?: string;
          metadata?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "membership_payments_membership_id_fkey";
            columns: ["membership_id"];
            isOneToOne: false;
            referencedRelation: "memberships";
            referencedColumns: ["id"];
          }
        ];
      };
      profile_views: {
        Row: {
          id: string | null;
          educator_profile_id: string;
          viewer_id: string | null;
          ip_address: string | null;
          viewed_at: string | null;
        };
        Insert: {
          id?: string | null;
          educator_profile_id: string;
          viewer_id?: string | null;
          ip_address?: string | null;
          viewed_at?: string | null;
        };
        Update: {
          id?: string | null;
          educator_profile_id?: string;
          viewer_id?: string | null;
          ip_address?: string | null;
          viewed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profile_views_educator_profile_id_fkey";
            columns: ["educator_profile_id"];
            isOneToOne: false;
            referencedRelation: "educator_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      reviews: {
        Row: {
          id: string | null;
          educator_id: string;
          student_id: string;
          rating: number;
          review_text: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string | null;
          educator_id: string;
          student_id: string;
          rating: number;
          review_text?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string | null;
          educator_id?: string;
          student_id?: string;
          rating?: number;
          review_text?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "student_profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_educator_id_fkey";
            columns: ["educator_id"];
            isOneToOne: false;
            referencedRelation: "educator_profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      review_reactions: {
        Row: {
          id: string | null;
          review_id: string | null;
          user_id: string | null;
          reaction_type: string;
          created_at: string;
        };
        Insert: {
          id?: string | null;
          review_id?: string | null;
          user_id?: string | null;
          reaction_type: string;
          created_at?: string;
        };
        Update: {
          id?: string | null;
          review_id?: string | null;
          user_id?: string | null;
          reaction_type?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_reactions_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "reviews";
            referencedColumns: ["id"];
          }
        ];
      };
      review_replies: {
        Row: {
          id: string | null;
          review_id: string | null;
          user_id: string | null;
          reply_text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          review_id?: string | null;
          user_id?: string | null;
          reply_text: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          review_id?: string | null;
          user_id?: string | null;
          reply_text?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey";
            columns: ["review_id"];
            isOneToOne: false;
            referencedRelation: "reviews";
            referencedColumns: ["id"];
          }
        ];
      };
      stripe_transactions: {
        Row: {
          id: string | null;
          customer_email: string;
          customer_name: string;
          amount: number;
          currency: string;
          status: string;
          payment_method: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string | null;
          customer_email: string;
          customer_name: string;
          amount: number;
          currency?: string;
          status: string;
          payment_method: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string | null;
          customer_email?: string;
          customer_name?: string;
          amount?: number;
          currency?: string;
          status?: string;
          payment_method?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      student_profiles: {
        Row: {
          id: string | null;
          user_id: string;
          email: string;
          name: string | null;
          phone: string | null;
          address: string | null;
          favorites: Json | null;
          is_active: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string | null;
          user_id: string;
          email: string;
          name?: string | null;
          phone?: string | null;
          address?: string | null;
          favorites?: Json | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string | null;
          user_id?: string;
          email?: string;
          name?: string | null;
          phone?: string | null;
          address?: string | null;
          favorites?: Json | null;
          is_active?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      support_submissions: {
        Row: {
          id: string | null;
          first_name: string;
          last_name: string;
          email: string;
          issue_type: string;
          message: string;
          status: string;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string | null;
          first_name: string;
          last_name: string;
          email: string;
          issue_type: string;
          message: string;
          status?: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string | null;
          first_name?: string;
          last_name?: string;
          email?: string;
          issue_type?: string;
          message?: string;
          status?: string;
          reference_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
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
        Args: {
          user_id: string;
        };
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

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

