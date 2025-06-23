import { useState, useEffect } from 'react'
import { Pokemon, PokemonType } from '../../lib/supabase'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box
} from '@mui/material'

interface PokemonFormProps {
  pokemon?: Pokemon
  onSubmit: (data: Omit<Pokemon, 'id'>) => void
  onCancel: () => void
  open: boolean
}

export default function PokemonForm({ pokemon, onSubmit, onCancel, open }: PokemonFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    image: '',
    power: 50,
    life: 50,
  })
  const [types, setTypes] = useState<PokemonType[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTypes()
    if (pokemon) {
      setFormData({
        name: pokemon.name,
        type: pokemon.type,
        image: pokemon.image,
        power: pokemon.power,
        life: pokemon.life,
      })
    } else {
      setFormData({
        name: '',
        type: '',
        image: '',
        power: 50,
        life: 50,
      })
    }
  }, [pokemon, open])

  const fetchTypes = async () => {
    try {
      const response = await fetch('/api/types')
      if (response.ok) {
        const data = await response.json()
        setTypes(data)
      }
    } catch (error) {
      console.error('Error fetching types:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await onSubmit(formData)
      onCancel()
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        {pokemon ? 'Edit Pokémon' : 'Add New Pokémon'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {types.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Image URL"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              required
              fullWidth
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Power (10-100)"
                type="number"
                value={formData.power}
                onChange={(e) => setFormData({ ...formData, power: parseInt(e.target.value) })}
                inputProps={{ min: 10, max: 100 }}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                label="Life (10-100)"
                type="number"
                value={formData.life}
                onChange={(e) => setFormData({ ...formData, life: parseInt(e.target.value) })}
                inputProps={{ min: 10, max: 100 }}
                required
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onCancel} color="inherit">
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : (pokemon ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
} 