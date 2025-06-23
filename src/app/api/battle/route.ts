import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Pokemon, BattlePokemon, BattleRound, FinalOutcome, BattleLogEntry } from '../../../types'

/**
 * Maps type combinations to their effectiveness multipliers
 * Key format: "type1-type2" (e.g., "Fire-Water" = 0.5)
 */
interface WeaknessMap {
  [key: string]: number
}



/**
 * Raw Pokemon data structure from Supabase
 */
interface PokemonData {
  id: string
  name: string
  image: string
  power: number
  life: number
  pokemon_type: {
    id: string
    name: string
  }
}

/**
 * Fetches team data and associated Pokemon from the database
 * @param supabase - Supabase client instance
 * @param teamId - Unique identifier for the team
 * @returns Promise containing team name and Pokemon array
 * @throws Error if team or Pokemon data cannot be fetched
 */
async function getTeamData(supabase: SupabaseClient, teamId: string): Promise<{ name: string, pokemons: Pokemon[] }> {
  const { data: teamData, error: teamError } = await supabase
    .from('teams')
    .select('name, pokemon_ids')
    .eq('id', teamId)
    .single()

  if (teamError || !teamData) {
    throw new Error(`Could not fetch team ${teamId}`)
  }

  const { data: pokemonData, error: pokemonError } = await supabase
    .from('pokemon')
    .select(
      `
      id,
      name,
      image,
      power,
      life,
      pokemon_type ( id, name )
    `
    )
    .in('id', teamData.pokemon_ids)

  if (pokemonError) {
    throw new Error(`Could not fetch pokemon for team ${teamId}`)
  }

  const pokemonMap = new Map((pokemonData as unknown as PokemonData[]).map((p) => [p.id, p]))
  const sortedPokemon = teamData.pokemon_ids
    .map((id: string) => pokemonMap.get(id))
    .filter(Boolean)

  return {
    name: teamData.name,
    pokemons: sortedPokemon.map((p: PokemonData) => ({
      id: p.id,
      name: p.name,
      image: p.image,
      power: p.power,
      life: p.life,
      type: p.pokemon_type.id,
    }))
  }
}

/**
 * Fetches type effectiveness data from the database
 * @param supabase - Supabase client instance
 * @returns Promise containing weakness map with type combinations as keys
 * @throws Error if weakness data cannot be fetched
 */
async function getWeaknessMap(supabase: SupabaseClient): Promise<WeaknessMap> {
  const { data, error } = await supabase.from('weakness').select('*')
  if (error) {
    throw new Error('Could not fetch weakness data')
  }
  const weaknessMap: WeaknessMap = {}
  for (const weak of data) {
    weaknessMap[`${weak.type1}-${weak.type2}`] = weak.factor
  }
  return weaknessMap
}

/**
 * POST endpoint for simulating battles between two Pokemon teams
 * 
 * Battle Algorithm:
 * 1. Fetches team data and type effectiveness from database
 * 2. Creates battle Pokemon with full health
 * 3. Simulates 1v1 rounds until one team is defeated
 * 4. Each round: Pokemon attack simultaneously, damage calculated with type effectiveness
 * 5. When a Pokemon faints, next Pokemon from team takes its place
 * 6. Returns complete battle log with round-by-round details
 * 
 * @param request - HTTP request containing team1Id and team2Id
 * @returns JSON response with battle simulation results
 */
export async function POST(request: Request) {
  try {
    const { team1Id, team2Id } = await request.json()

    // Fetch all required data in parallel
    const [team1, team2, weaknessMap] = await Promise.all([
      getTeamData(supabase, team1Id),
      getTeamData(supabase, team2Id),
      getWeaknessMap(supabase),
    ])

    // Initialize battle Pokemon with full health
    const team1Fighters: BattlePokemon[] = team1.pokemons.map((p) => ({
      ...p,
      currentLife: p.life,
    }))
    const team2Fighters: BattlePokemon[] = team2.pokemons.map((p) => ({
      ...p,
      currentLife: p.life,
    }))

    const battleLog: BattleLogEntry[] = []
    let team1Index = 0
    let team2Index = 0
    let roundCounter = 1

    // Main battle loop - continues until one team is completely defeated
    while (
      team1Index < team1Fighters.length &&
      team2Index < team2Fighters.length
    ) {
      const p1 = team1Fighters[team1Index]
      const p2 = team2Fighters[team2Index]

      // Initialize round data
      const roundData: BattleRound = {
        roundNumber: roundCounter,
        pokemon1: {
          ...p1,
          currentLife: p1.currentLife,
        },
        pokemon2: {
          ...p2,
          currentLife: p2.currentLife,
        },
        actions: [],
        outcome: '',
        team1State: [],
        team2State: [],
      }

      // Sub-round loop - continues until one Pokemon faints
      while (p1.currentLife > 0 && p2.currentLife > 0) {
        const p1LifeBefore = p1.currentLife
        const p2LifeBefore = p2.currentLife

        // Calculate damage with type effectiveness
        const factorP2Takes = weaknessMap[`${p1.type}-${p2.type}`] || 1.0
        const factorP1Takes = weaknessMap[`${p2.type}-${p1.type}`] || 1.0

        const p2DamageTaken = p1.power * factorP2Takes
        const p1DamageTaken = p2.power * factorP1Takes

        // Apply damage simultaneously
        p1.currentLife -= p1DamageTaken
        p2.currentLife -= p2DamageTaken
        
        // Record the action
        roundData.actions.push({
          p1_action: `${p1.name} attacks ${p2.name}, dealing ${p2DamageTaken.toFixed(1)} damage.`,
          p2_action: `${p2.name} attacks ${p1.name}, dealing ${p1DamageTaken.toFixed(1)} damage.`,
          p1_life_before: p1LifeBefore,
          p2_life_before: p2LifeBefore,
          p1_life_after: p1.currentLife,
          p2_life_after: p2.currentLife,
        })
      }

      // Determine round outcome and advance team indices
      if (p1.currentLife <= 0 && p2.currentLife <= 0) {
        roundData.outcome = `${p1.name} and ${p2.name} knocked each other out!`
        team1Index++
        team2Index++
      } else if (p1.currentLife <= 0) {
        roundData.outcome = `${p2.name} defeated ${p1.name}!`
        team1Index++
      } else if (p2.currentLife <= 0) {
        roundData.outcome = `${p1.name} defeated ${p2.name}!`
        team2Index++
      }

      // Capture the state of all Pokemon at the end of this round
      roundData.team1State = team1Fighters.map(pk => ({ id: pk.id, currentLife: pk.currentLife }))
      roundData.team2State = team2Fighters.map(pk => ({ id: pk.id, currentLife: pk.currentLife }))

      battleLog.push(roundData)
      roundCounter++
    }

    // Determine the winner
    let winner = null
    if (team1Index === team1Fighters.length && team2Index < team2Fighters.length) {
      winner = team2Id
    } else if (team2Index === team2Fighters.length && team1Index < team1Fighters.length) {
      winner = team1Id
    }
    
    // Add final outcome to battle log
    const finalOutcome: FinalOutcome = {
        isFinal: true,
        winner: winner,
        team1State: team1Fighters.map(pk => ({ id: pk.id, currentLife: pk.currentLife })),
        team2State: team2Fighters.map(pk => ({ id: pk.id, currentLife: pk.currentLife })),
    }
    battleLog.push(finalOutcome)

    return NextResponse.json({
      battleLog,
      team1,
      team2,
      winner: winner,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    )
  }
}
