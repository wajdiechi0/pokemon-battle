import { useState, useEffect } from "react";
import { Pokemon } from "../../lib/supabase";
import PokemonCard from "../pokemon/PokemonCard";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface TeamBuilderProps {
  pokemons: Pokemon[];
  onCreateTeam: (name: string, pokemon_ids: string[]) => void;
  onUpdateTeam?: (id: string, name: string, pokemon_ids: string[]) => void;
  onCancel: () => void;
  open: boolean;
  initialTeam?: { id: string; name: string; pokemon_ids: string[] };
  editMode?: boolean;
}

export default function TeamBuilder({
  pokemons,
  onCreateTeam,
  onUpdateTeam,
  onCancel,
  open,
  initialTeam,
  editMode = false,
}: TeamBuilderProps) {
  const [teamName, setTeamName] = useState(initialTeam?.name || "");
  const [selectedPokemons, setselectedPokemons] = useState<Pokemon[]>(
    initialTeam
      ? pokemons.filter((p) => initialTeam.pokemon_ids.includes(p.id))
      : []
  );

  useEffect(() => {
    setTeamName(initialTeam?.name || "");
    setselectedPokemons(
      initialTeam
        ? pokemons.filter((p) => initialTeam.pokemon_ids.includes(p.id))
        : []
    );
  }, [open, initialTeam, pokemons]);

  const handlePokemonSelect = (pokemon: Pokemon) => {
    if (selectedPokemons.find((p) => p.id === pokemon.id)) {
      setselectedPokemons(selectedPokemons.filter((p) => p.id !== pokemon.id));
    } else if (selectedPokemons.length < 6) {
      setselectedPokemons([...selectedPokemons, pokemon]);
    }
  };

  const handleRemovePokemon = (index: number) => {
    const newSelectedPokemons = selectedPokemons.filter((_, i) => i !== index);
    setselectedPokemons(newSelectedPokemons);
  };

  const handleCreateTeam = () => {
    if (teamName.trim() && selectedPokemons.length === 6) {
      onCreateTeam(
        teamName,
        selectedPokemons.map((p) => p.id)
      );
    }
  };

  const handleUpdateTeam = () => {
    if (editMode && initialTeam && teamName.trim() && selectedPokemons.length === 6 && onUpdateTeam) {
      onUpdateTeam(
        initialTeam.id,
        teamName,
        selectedPokemons.map((p) => p.id)
      );
    }
  };

  const isSelected = (pokemon: Pokemon) => {
    return selectedPokemons.some((p) => p.id === pokemon.id);
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="lg" fullWidth>
      <DialogTitle>Build Your Team</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", padding: 2, flexDirection: "column", gap: 3 }}>
          <TextField
            label="Team Name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Enter team name..."
            fullWidth
          />

          <Box>
            <Typography variant="h6" gutterBottom>
              Selected Pokémon ({selectedPokemons.length}/6)
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
              {Array.from({ length: 6 }, (_, i) => (
                <Paper
                  key={i}
                  sx={{
                    width: 120,
                    height: 120,
                    border: 2,
                    borderStyle: "dashed",
                    borderColor: selectedPokemons[i]
                      ? "primary.main"
                      : "grey.300",
                    backgroundColor: selectedPokemons[i]
                      ? "primary.50"
                      : "grey.50",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    p: 1,
                    position: "relative",
                  }}
                >
                  {selectedPokemons[i] && (
                    <IconButton
                      size="small"
                      onClick={() => handleRemovePokemon(i)}
                      sx={{
                        position: "absolute",
                        top: -10,
                        right: -10,
                        backgroundColor: "error.main",
                        color: "white",
                        width: 24,
                        height: 24,
                        "&:hover": {
                          backgroundColor: "error.dark",
                        },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                  {selectedPokemons[i] ? (
                    <>
                      <img
                        src={selectedPokemons[i].image}
                        alt={selectedPokemons[i].name}
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: "contain",
                          marginBottom: 4,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ textAlign: "center", fontWeight: "medium" }}
                      >
                        {selectedPokemons[i].name}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Empty
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Available Pokémon
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {pokemons.map((pokemon) => (
                <Box
                  key={pokemon.id}
                  sx={{
                    width: {
                      xs: "100%",
                      sm: "calc(50% - 8px)",
                      md: "calc(33.33% - 8px)",
                      lg: "calc(25% - 8px)",
                      xl: "calc(16.66% - 8px)",
                    },
                  }}
                >
                  <PokemonCard
                    pokemon={pokemon}
                    selected={isSelected(pokemon)}
                    showActions={false}
                    onSelect={handlePokemonSelect}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          Cancel
        </Button>
        {editMode ? (
          <Button
            onClick={handleUpdateTeam}
            variant="contained"
            disabled={!teamName.trim() || selectedPokemons.length !== 6}
          >
            Update Team
          </Button>
        ) : (
          <Button
            onClick={handleCreateTeam}
            variant="contained"
            disabled={!teamName.trim() || selectedPokemons.length !== 6}
          >
            Create Team
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
