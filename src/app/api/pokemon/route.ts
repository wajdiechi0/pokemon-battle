import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: pokemon, error } = await supabase
      .from('pokemon')
      .select(`
        *,
        pokemon_type:type(name)
      `)
      .order('name')

    if (error) throw error

    return NextResponse.json(pokemon)
  } catch (error) {
    console.error('Error fetching Pokémon:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Pokémon' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, image, power, life } = body

    // Validate input
    if (!name || !type || !image || power === undefined || life === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (power < 10 || power > 100 || life < 10 || life > 100) {
      return NextResponse.json(
        { error: 'Power and life must be between 10 and 100' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('pokemon')
      .insert([{ name, type, image, power, life }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating Pokémon:', error)
    return NextResponse.json(
      { error: 'Failed to create Pokémon' },
      { status: 500 }
    )
  }
} 