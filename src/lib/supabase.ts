import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          user_type: 'owner' | 'tenant'
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          user_type?: 'owner' | 'tenant'
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          user_type?: 'owner' | 'tenant'
          phone?: string | null
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          owner_id: string
          title: string
          description: string
          property_type: string
          location: any
          price: number
          amenities: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          description: string
          property_type: string
          location: any
          price: number
          amenities?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          title?: string
          description?: string
          property_type?: string
          location?: any
          price?: number
          amenities?: string[]
          is_active?: boolean
          updated_at?: string
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          image_url: string
          alt_text: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          image_url: string
          alt_text?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          image_url?: string
          alt_text?: string | null
          sort_order?: number
        }
      }
      messages: {
        Row: {
          id: string
          property_id: string
          sender_id: string
          recipient_id: string
          message_content: string
          contact_info: any
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          sender_id: string
          recipient_id: string
          message_content: string
          contact_info?: any
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          sender_id?: string
          recipient_id?: string
          message_content?: string
          contact_info?: any
          is_read?: boolean
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
        }
      }
    }
  }
}