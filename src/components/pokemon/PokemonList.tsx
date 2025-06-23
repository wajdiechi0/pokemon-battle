"use client";

import { useState } from "react";
import { Pokemon } from "../../lib/supabase";
import { usePokemon } from "../../hooks/usePokemon";
import PokemonCard from "./PokemonCard";
import PokemonForm from "./PokemonForm";
import { Button, CircularProgress } from "@mui/material";
import AppSnackbar from "../AppSnackbar";

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

export default function PokemonList() {
  const {
    pokemons,
    loading,
    error,
    createPokemon,
    updatePokemon,
    deletePokemon,
  } = usePokemon();
  const [showForm, setShowForm] = useState(false);
  const [editingPokemon, setEditingPokemon] = useState<Pokemon | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCreatePokemon = async (data: Omit<Pokemon, 'id'>) => {
    try {
      await createPokemon(data)
      setShowForm(false)
      showSnackbar('Pokémon created successfully!', 'success')
    } catch {
      showSnackbar('Failed to create Pokémon. Please try again.', 'error')
    }
  }

  const handleUpdatePokemon = async (data: Omit<Pokemon, 'id'>) => {
    if (editingPokemon) {
      try {
        await updatePokemon(editingPokemon.id, data)
        setEditingPokemon(null)
        showSnackbar('Pokémon updated successfully!', 'success')
      } catch {
        showSnackbar('Failed to update Pokémon. Please try again.', 'error')
      }
    }
  }

  const handleEditPokemon = (pokemon: Pokemon) => {
    setEditingPokemon(pokemon)
  }

  const handleDeletePokemon = async (id: string) => {
    if (confirm('Are you sure you want to delete this Pokémon?')) {
      try {
        await deletePokemon(id)
        showSnackbar('Pokémon deleted successfully!', 'success')
      } catch {
        showSnackbar('Failed to delete Pokémon. Please try again.', 'error')
      }
    }
  }

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPokemon(null);
  };

  if (loading && pokemons.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <CircularProgress size={30} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pokémon Collection</h2>
        <Button
          onClick={() => setShowForm(true)}
          variant="contained"
          color="secondary"
          size="large"
          sx={{ color: "white" }}
        >
          Add New Pokémon
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {pokemons.map((pokemonItem) => (
          <PokemonCard
            key={pokemonItem.id}
            pokemon={pokemonItem}
            onEdit={handleEditPokemon}
            onDelete={handleDeletePokemon}
          />
        ))}
      </div>

      {pokemons.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No Pokémon found</div>
          <Button
            onClick={() => setShowForm(true)}
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 2, color: "white" }}
          >
            Add Your First Pokémon
          </Button>
        </div>
      )}

      <PokemonForm
        open={showForm || !!editingPokemon}
        pokemon={editingPokemon || undefined}
        onSubmit={editingPokemon ? handleUpdatePokemon : handleCreatePokemon}
        onCancel={handleCloseForm}
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </div>
  );
}
