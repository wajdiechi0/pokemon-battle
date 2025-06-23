import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { data: pokemon, error } = await supabase
      .from('pokemon')
      .select(`
        *,
        pokemon_type:type(name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (!pokemon) {
      return NextResponse.json(
        { error: 'Pokémon not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(pokemon)
  } catch (error) {
    console.error('Error fetching Pokémon:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Pokémon' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json()
    const { name, type, image, power, life } = body

    // Validate input
    if (power !== undefined && (power < 10 || power > 100)) {
      return NextResponse.json(
        { error: 'Power must be between 10 and 100' },
        { status: 400 }
      )
    }

    if (life !== undefined && (life < 10 || life > 100)) {
      return NextResponse.json(
        { error: 'Life must be between 10 and 100' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('pokemon')
      .update({ name, type, image, power, life })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Pokémon not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating Pokémon:', error)
    return NextResponse.json(
      { error: 'Failed to update Pokémon' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { error } = await supabase
      .from('pokemon')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Pokémon deleted successfully' })
  } catch (error) {
    console.error('Error deleting Pokémon:', error)
    return NextResponse.json(
      { error: 'Failed to delete Pokémon' },
      { status: 500 }
    )
  }
} 