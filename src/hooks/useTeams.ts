import { useState, useEffect } from 'react'

interface TeamWithPower {
  team_id: string
  team_name: string
  pokemon_ids: string[]
  total_power: number
  created_at: string
}

export function useTeams() {
  const [teams, setTeams] = useState<TeamWithPower[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teams')
      if (!response.ok) throw new Error('Failed to fetch teams')
      const data = await response.json()
      setTeams(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createTeam = async (name: string, pokemon_ids: string[]) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, pokemon_ids }),
      })
      if (!response.ok) throw new Error('Failed to create team')
      await fetchTeams()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const updateTeam = async (id: string, name: string, pokemon_ids: string[]) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, pokemon_ids }),
      })
      if (!response.ok) throw new Error('Failed to update team')
      await fetchTeams()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const deleteTeam = async (id: string) => {
    try {
      const response = await fetch('/api/teams', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) throw new Error('Failed to delete team')
      await fetchTeams()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  return {
    teams,
    loading,
    error,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  }
} 