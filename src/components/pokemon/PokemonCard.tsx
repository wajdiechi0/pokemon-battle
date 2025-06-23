import { Pokemon } from '../../lib/supabase'
import { Button, Box } from '@mui/material'

interface PokemonCardProps {
  pokemon: Pokemon
  onEdit?: (pokemon: Pokemon) => void
  onDelete?: (id: string) => void
  onSelect?: (pokemon: Pokemon) => void
  selected?: boolean
  showActions?: boolean
}

export default function PokemonCard({
  pokemon,
  onEdit,
  onDelete,
  onSelect,
  selected = false,
  showActions = true,
}: PokemonCardProps) {
  const typeName = typeof pokemon.pokemon_type === 'object' 
    ? pokemon.pokemon_type.name 
    : pokemon.type

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-4 border-2 transition-all duration-200 hover:shadow-lg ${
        selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}
      onClick={() => onSelect?.(pokemon)}
    >
      <div className="flex flex-col items-center">
        <img
          src={pokemon.image}
          alt={pokemon.name}
          className="w-24 h-24 object-contain mb-3"
        />
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {pokemon.name}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium mb-2 ${
          typeName === 'Fire' ? 'bg-red-100 text-red-800' :
          typeName === 'Water' ? 'bg-blue-100 text-blue-800' :
          typeName === 'Grass' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {typeName}
        </span>
        
        <div className="flex gap-4 text-sm text-gray-600 mb-3">
          <div className="text-center">
            <div className="font-semibold">Power</div>
            <div>{pokemon.power}</div>
          </div>
          <div className="text-center">
            <div className="font-semibold">HP</div>
            <div>{pokemon.life}</div>
          </div>
        </div>

        {showActions && (onEdit || onDelete) && (
          <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            {onEdit && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(pokemon)
                }}
                variant="contained"
                color="primary"
                size="small"
                fullWidth
              >
                Edit
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(pokemon.id)
                }}
                variant="contained"
                color="error"
                size="small"
                fullWidth
              >
                Delete
              </Button>
            )}
          </Box>
        )}
      </div>
    </div>
  )
} 