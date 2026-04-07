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
      boss_rooms: {
        Row: {
          id: string
          name: string
          estimated_prize: number
          entry_fee: number
          status: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          name: string
          estimated_prize: number
          entry_fee: number
          status?: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          name?: string
          estimated_prize?: number
          entry_fee?: number
          status?: string
          created_at?: string
          expires_at?: string
        }
      }
      participants: {
        Row: {
          id: string
          user_id: string
          room_id: string
          ticket_code: string
          created_at: string
          source: string
          is_eligible: boolean
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
          ticket_code?: string
          created_at?: string
          source?: string
          is_eligible?: boolean
        }
      }
      boss_participants: {
        Row: {
          id: string
          user_id: string
          room_id: string
          ticket_code: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          room_id: string
          ticket_code: string
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
          bonus_balance: number
          updated_at: string
          bank_info: string | null
          referred_by: string | null
          referral_code: string | null
          referrals_count: number
          total_earnings: number
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          balance?: number
          bonus_balance?: number
          updated_at?: string
          bank_info?: string | null
          referred_by?: string | null
          referral_code?: string | null
          referrals_count?: number
          total_earnings?: number
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          balance?: number
          bonus_balance?: number
          updated_at?: string
          bank_info?: string | null
          referred_by?: string | null
          referral_code?: string | null
          referrals_count?: number
          total_earnings?: number
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'deposit' | 'withdrawal'
          amount: number
          status: 'pending' | 'completed' | 'rejected'
          payment_method: string | null
          proof_url: string | null
          created_at: string
          acceleration_requested: boolean
        }
        Insert: {
          id?: string
          user_id: string
          type: 'deposit' | 'withdrawal'
          amount: number
          status?: 'pending' | 'completed' | 'rejected'
          payment_method?: string | null
          proof_url?: string | null
          created_at?: string
          acceleration_requested?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'deposit' | 'withdrawal'
          amount?: number
          status?: 'pending' | 'completed' | 'rejected'
          payment_method?: string | null
          proof_url?: string | null
          created_at?: string
          acceleration_requested?: boolean
        }
      }
      winners: {
        Row: {
          id: string
          draw_id: string
          user_id: string | null
          prize_amount: number
          position: number
          created_at: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          created_at: string
        }
      }
    }
  }
}