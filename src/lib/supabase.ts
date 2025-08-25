import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder-anon-key'

if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase environment variables not configured. Authentication features will not work until you add your Supabase credentials to .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          fitness_level: 'beginner' | 'intermediate' | 'advanced'
          goals: string[]
          preferences: {
            workoutDuration: number
            voiceStyle: string
            difficulty: string
          }
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          fitness_level?: 'beginner' | 'intermediate' | 'advanced'
          goals?: string[]
          preferences?: {
            workoutDuration: number
            voiceStyle: string
            difficulty: string
          }
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          fitness_level?: 'beginner' | 'intermediate' | 'advanced'
          goals?: string[]
          preferences?: {
            workoutDuration: number
            voiceStyle: string
            difficulty: string
          }
        }
      }
      equipment: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'cardio' | 'strength' | 'flexibility'
          condition: 'good' | 'fair' | 'poor'
          quantity: number
          weight_range: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          name: string
          type: 'cardio' | 'strength' | 'flexibility'
          condition?: 'good' | 'fair' | 'poor'
          quantity?: number
          weight_range?: string | null
        }
        Update: {
          name?: string
          type?: 'cardio' | 'strength' | 'flexibility'
          condition?: 'good' | 'fair' | 'poor'
          quantity?: number
          weight_range?: string | null
        }
      }
      workout_programs: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: number
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          duration: number
          focus_areas: string[]
          equipment_ids: string[]
          is_template: boolean
          is_ai_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          name: string
          description?: string | null
          color?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration?: number
          focus_areas?: string[]
          equipment_ids?: string[]
          is_template?: boolean
          is_ai_generated?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          color?: number
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          duration?: number
          focus_areas?: string[]
          equipment_ids?: string[]
          is_template?: boolean
          is_ai_generated?: boolean
        }
      }
      workout_activities: {
        Row: {
          id: string
          user_id: string
          program_id: string | null
          name: string
          start_time: string
          end_time: string | null
          completed: boolean
          audio_playback_minutes: number
          target_minutes: number
          completion_percentage: number
          notes: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          program_id?: string | null
          name: string
          start_time: string
          end_time?: string | null
          completed?: boolean
          audio_playback_minutes?: number
          target_minutes?: number
          completion_percentage?: number
          notes?: string | null
        }
        Update: {
          end_time?: string | null
          completed?: boolean
          audio_playback_minutes?: number
          target_minutes?: number
          completion_percentage?: number
          notes?: string | null
        }
      }
      daily_progress: {
        Row: {
          id: string
          user_id: string
          date: string
          completed: boolean
          audio_minutes: number
          completion_percentage: number
          activities_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          date: string
          completed?: boolean
          audio_minutes?: number
          completion_percentage?: number
          activities_count?: number
        }
        Update: {
          completed?: boolean
          audio_minutes?: number
          completion_percentage?: number
          activities_count?: number
        }
      }
    }
  }
}
