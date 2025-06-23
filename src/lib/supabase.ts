import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface PokemonType {
  id: string
  name: string
}

export interface Pokemon {
  id: string
  name: string
  type: string
  image: string
  power: number
  life: number
  pokemon_type?: {
    name: string
  }
}

export interface Weakness {
  id: string
  type1: string
  type2: string
  factor: number
}

export interface Team {
  id: string
  name: string
  pokemon_ids: string[]
  created_at: string
} 