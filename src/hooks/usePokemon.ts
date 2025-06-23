import { useState, useEffect } from 'react'
import { Pokemon } from '../lib/supabase'

export function usePokemon() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPokemon = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/pokemon')
      if (!response.ok) throw new Error('Failed to fetch Pokémon')
      const data = await response.json()
      setPokemons(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createPokemon = async (pokemonData: Omit<Pokemon, 'id'>) => {
    try {
      const response = await fetch('/api/pokemon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pokemonData),
      })
      if (!response.ok) throw new Error('Failed to create Pokémon')
      await fetchPokemon()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const updatePokemon = async (id: string, pokemonData: Partial<Pokemon>) => {
    try {
      const response = await fetch(`/api/pokemon/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pokemonData),
      })
      if (!response.ok) throw new Error('Failed to update Pokémon')
      await fetchPokemon()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const deletePokemon = async (id: string) => {
    try {
      const response = await fetch(`/api/pokemon/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete Pokémon')
      await fetchPokemon()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  useEffect(() => {
    fetchPokemon()
  }, [])

  return {
    pokemons,
    loading,
    error,
    fetchPokemon,
    createPokemon,
    updatePokemon,
    deletePokemon,
  }
} 