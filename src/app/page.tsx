'use client'

import { useState } from 'react'
import PokemonList from '../components/pokemon/PokemonList'
import TeamList from '../components/team/TeamList'
import { Button, ButtonGroup } from '@mui/material'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'pokemon' | 'teams'>('pokemon')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Pokémon Battle App
            </h1>
            <ButtonGroup variant="outlined" size="large">
              <Button
                onClick={() => setActiveTab('pokemon')}
                variant={activeTab === 'pokemon' ? 'contained' : 'outlined'}
              >
                Pokémon
              </Button>
              <Button
                onClick={() => setActiveTab('teams')}
                variant={activeTab === 'teams' ? 'contained' : 'outlined'}
              >
                Teams
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'pokemon' ? <PokemonList /> : <TeamList />}
      </main>
    </div>
  )
}
