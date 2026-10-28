export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chat_messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
          read_at: string | null
          deleted_at: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          created_at?: string
          read_at?: string | null
          deleted_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          created_at?: string
          read_at?: string | null
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_receiver_id_fkey"
            columns: ["receiver_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      educator_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          image: string | null
          address: string | null
          phone: string | null
          email: string
          website: string | null
          categories: string[] | null
          tags: string[] | null
          about_business: string | null
          facebook_url: string | null
          instagram_url: string | null
          youtube_url: string | null
          created_at: string
          updated_at: string
          is_active: boolean | null
          is_featured: boolean | null
          last_active: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          image?: string | null
          address?: string | null
          phone?: string | null
          email: string
          website?: string | null
          categories?: string[] | null
          tags?: string[] | null
          about_business?: string | null
          facebook_url?: string | null
          instagram_url?: string | null
          youtube_url?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          last_active?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          image?: string | null
          address?: string | null
          phone?: string | null
          email?: string
          website?: string | null
          categories?: string[] | null
          tags?: string[] | null
          about_business?: string | null
          facebook_url?: string | null
          instagram_url?: string | null
          youtube_url?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          last_active?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "educator_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      memberships: {
        Row: {
          id: string
          educator_id: string
          type: 'basic' | 'standard' | 'premium'
          status: 'active' | 'past_due' | 'canceled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          educator_id: string
          type: 'basic' | 'standard' | 'premium'
          status?: 'active' | 'past_due' | 'canceled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          educator_id?: string
          type?: 'basic' | 'standard' | 'premium'
          status?: 'active' | 'past_due' | 'canceled'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_educator_id_fkey"
            columns: ["educator_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      student_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          name: string | null
          phone: string | null
          address: string | null
          created_at: string
          updated_at: string
          is_active: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          name?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          name?: string | null
          phone?: string | null
          address?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lesson_requests: {
        Row: {
          id: string
          student_id: string
          educator_id: string
          status: string
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          educator_id: string
          status?: string
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          educator_id?: string
          status?: string
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_requests_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_requests_educator_id_fkey"
            columns: ["educator_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      favorites: {
        Row: {
          id: string
          student_id: string
          educator_id: string
          created_at: string
        }
        Insert: {
          id?: string
          student_id: string
          educator_id: string
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          educator_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_student_id_fkey"
            columns: ["student_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_educator_id_fkey"
            columns: ["educator_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_account: {
        Args: {
          user_id: string
          is_confirmed: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 