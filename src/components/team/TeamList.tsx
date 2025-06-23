"use client";

import { useState } from "react";
import { useTeams } from "../../hooks/useTeams";
import { usePokemon } from "../../hooks/usePokemon";
import TeamBuilder from "./TeamBuilder";
import {
  Button,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AppSnackbar from "../AppSnackbar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface TeamWithPower {
  team_id: string;
  team_name: string;
  pokemon_ids: string[];
  total_power: number;
  created_at: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

export default function TeamList() {
  const { teams, loading, error, createTeam, updateTeam, deleteTeam } =
    useTeams();
  const { pokemons } = usePokemon();
  const [showTeamBuilder, setShowTeamBuilder] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });
  const [editTeam, setEditTeam] = useState<TeamWithPower | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<{
    open: boolean;
    team: TeamWithPower | null;
  }>({ open: false, team: null });

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCreateTeam = async (name: string, pokemon_ids: string[]) => {
    try {
      await createTeam(name, pokemon_ids);
      setShowTeamBuilder(false);
      showSnackbar("Team created successfully!", "success");
    } catch {
      showSnackbar("Failed to create team. Please try again.", "error");
    }
  };

  const handleUpdateTeam = async (
    id: string,
    name: string,
    pokemon_ids: string[]
  ) => {
    try {
      await updateTeam(id, name, pokemon_ids);
      setEditTeam(null);
      showSnackbar("Team updated successfully!", "success");
    } catch {
      showSnackbar("Failed to update team. Please try again.", "error");
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      await deleteTeam(id);
      setShowDeleteDialog({ open: false, team: null });
      showSnackbar("Team deleted successfully!", "success");
    } catch {
      showSnackbar("Failed to delete team. Please try again.", "error");
    }
  };

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeams((prev) => {
      if (prev.includes(teamId)) {
        return prev.filter((id) => id !== teamId);
      } else {
        if (prev.length < 2) {
          return [...prev, teamId];
        }
      }
      return prev;
    });
  };

  const handleStartBattle = () => {
    if (selectedTeams.length === 2) {
      const url = `/battle?team1=${selectedTeams[0]}&team2=${selectedTeams[1]}`;
      window.open(url, "_blank");
    } else {
      showSnackbar("Please select exactly two teams to battle.", "info");
    }
  };

  const getPokemonById = (id: string) => {
    return pokemons.find((p) => p.id === id);
  };

  if (loading && teams.length === 0) {
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
        <h2 className="text-2xl font-bold text-gray-900">Pokémon Teams</h2>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleStartBattle}
            variant="contained"
            color="primary"
            size="large"
            disabled={selectedTeams.length !== 2}
          >
            Start Battle
          </Button>
          <Button
            onClick={() => setShowTeamBuilder(true)}
            variant="contained"
            color="secondary"
            size="large"
            sx={{ color: "white" }}
          >
            Create New Team
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {teams.map((team: TeamWithPower) => (
          <div
            key={team.team_id}
            className={`bg-white rounded-lg shadow-md p-6 border-2 ${
              selectedTeams.includes(team.team_id)
                ? "border-blue-500"
                : "border-transparent"
            }`}
            onClick={() => handleSelectTeam(team.team_id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedTeams.includes(team.team_id)}
                      onChange={() => {
                        handleSelectTeam(team.team_id);
                      }}
                      onClick={() => {
                        handleSelectTeam(team.team_id);
                      }}
                    />
                  }
                  label={
                    <h3
                      onClick={() => {
                        handleSelectTeam(team.team_id);
                      }}
                      className="text-xl font-semibold text-gray-900"
                    >
                      {team.team_name}
                    </h3>
                  }
                />
                <p className="text-gray-600 ml-10">
                  Total Power:{" "}
                  <span className="font-semibold">{team.total_power}</span>
                </p>
                <p className="text-sm text-gray-500 ml-10">
                  Created: {new Date(team.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right flex flex-col gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {team.pokemon_ids.length} Pokémon
                </span>
                <div className="flex gap-2 mt-2">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTeam(team);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog({ open: true, team });
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-4">
              {team.pokemon_ids.map((pokemonId, index) => {
                const pokemon = getPokemonById(pokemonId);
                return (
                  <div key={index} className="text-center">
                    {pokemon ? (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <img
                          src={pokemon.image}
                          alt={pokemon.name}
                          className="w-16 h-16 object-contain mx-auto mb-2"
                        />
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {pokemon.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          Power: {pokemon.power} | HP: {pokemon.life}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 h-24 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Unknown</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No teams found</div>
          <Button
            onClick={() => setShowTeamBuilder(true)}
            variant="contained"
            color="secondary"
            size="large"
            sx={{ mt: 2, color: "white" }}
          >
            Create Your First Team
          </Button>
        </div>
      )}

      <TeamBuilder
        open={showTeamBuilder || !!editTeam}
        pokemons={pokemons}
        onCreateTeam={handleCreateTeam}
        onUpdateTeam={handleUpdateTeam}
        onCancel={() => {
          setShowTeamBuilder(false);
          setEditTeam(null);
        }}
        initialTeam={
          editTeam
            ? {
                id: editTeam.team_id,
                name: editTeam.team_name,
                pokemon_ids: editTeam.pokemon_ids,
              }
            : undefined
        }
        editMode={!!editTeam}
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />

      <Dialog
        open={showDeleteDialog.open}
        onClose={() => setShowDeleteDialog({ open: false, team: null })}
      >
        <DialogTitle>Delete Team</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the team &quot;
          {showDeleteDialog.team?.team_name}&quot;?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowDeleteDialog({ open: false, team: null })}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              showDeleteDialog.team &&
              handleDeleteTeam(showDeleteDialog.team.team_id)
            }
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
