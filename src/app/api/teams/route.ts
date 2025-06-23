import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Use the PostgreSQL function to get teams with power
    const { data: teams, error } = await supabase
      .rpc('get_teams_with_power')

    if (error) throw error

    return NextResponse.json(teams)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, pokemon_ids } = body

    // Validate input
    if (!name || !pokemon_ids || !Array.isArray(pokemon_ids)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (pokemon_ids.length !== 6) {
      return NextResponse.json(
        { error: 'Team must contain exactly 6 Pokémon' },
        { status: 400 }
      )
    }

    // Use the PostgreSQL function to insert team
    const { data, error } = await supabase
      .rpc('insert_team', {
        team_name: name,
        pokemon_ids: pokemon_ids
      })

    if (error) throw error

    return NextResponse.json({ id: data }, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, pokemon_ids } = body

    if (!id || !name || !pokemon_ids || !Array.isArray(pokemon_ids)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    if (pokemon_ids.length !== 6) {
      return NextResponse.json(
        { error: 'Team must contain exactly 6 Pokémon' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('teams')
      .update({ name, pokemon_ids })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json(
        { error: 'Missing team id' },
        { status: 400 }
      )
    }
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    )
  }
} 