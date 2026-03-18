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
      modules: {
        Row: {
          id: string
          name: string
          price: number
          max_participants: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          max_participants: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          max_participants?: number
          created_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          module_id: string
          status: 'open' | 'closed' | 'processing' | 'finished'
          max_participants: number
          current_participants: number
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          status?: 'open' | 'closed' | 'processing' | 'finished'
          max_participants: number
          current_participants?: number
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          module_id?: string
          status?: 'open' | 'closed' | 'processing' | 'finished'
          max_participants?: number
          current_participants?: number
          expires_at?: string
          created_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          user_id: string
          room_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          balance: number
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          balance?: number
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          balance?: number
          updated_at?: string
        }
      }
    }
  }
}