import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: types, error } = await supabase
      .from('pokemon_type')
      .select('*')
      .order('name')

    if (error) throw error

    return NextResponse.json(types)
  } catch (error) {
    console.error('Error fetching types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch types' },
      { status: 500 }
    )
  }
} 