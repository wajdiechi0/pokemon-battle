"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  LinearProgress,
  Box,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import Link from "next/link";
import { Pokemon, BattleRound, BattleData } from "../../types";

/**
 * PokemonIcon component for displaying individual Pokemon in team rosters
 * Shows Pokemon image with defeated state (grayscale filter)
 *
 * @param pokemon - Pokemon data to display
 * @param isDefeated - Whether the Pokemon is defeated (affects visual appearance)
 */
const PokemonIcon = ({
  pokemon,
  isDefeated,
}: {
  pokemon: Pokemon;
  isDefeated: boolean;
}) => (
  <Paper
    elevation={3}
    sx={{
      p: 1,
      borderRadius: "50%",
      backgroundColor: "rgba(0,0,0,0.6)",
      filter: isDefeated ? "grayscale(100%)" : "none",
    }}
  >
    <img
      src={pokemon.image}
      alt={pokemon.name}
      style={{ width: 50, height: 50 }}
    />
  </Paper>
);

/**
 * BattlePage component for displaying Pokemon battle simulations
 *
 * Features:
 * - Fetches battle data from API using team IDs from URL parameters
 * - Displays round-by-round battle progression with navigation
 * - Shows Pokemon health bars and battle outcomes
 * - Visual indicators for defeated Pokemon in team rosters
 * - Responsive design with Material-UI components
 *
 * URL Parameters:
 * - team1: ID of the first team
 * - team2: ID of the second team
 */
export default function BattlePage() {
  const searchParams = useSearchParams();
  const [battleData, setBattleData] = useState<BattleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  /**
   * Fetches battle simulation data from the API
   * Triggered when search parameters change (team IDs)
   */
  useEffect(() => {
    const team1Id = searchParams.get("team1");
    const team2Id = searchParams.get("team2");

    if (team1Id && team2Id) {
      const fetchBattle = async () => {
        try {
          setLoading(true);
          const response = await fetch("/api/battle", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ team1Id, team2Id }),
          });
          if (!response.ok) {
            throw new Error("Failed to fetch battle data");
          }
          const data = await response.json();
          setBattleData(data);
        } catch (e: unknown) {
          const errorMessage =
            e instanceof Error ? e.message : "An unknown error occurred";
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };
      fetchBattle();
    } else {
      setError("Team IDs are missing.");
      setLoading(false);
    }
  }, [searchParams]);

  const currentRound = battleData?.battleLog[currentRoundIndex] as BattleRound;

  console.log(battleData);

  /**
   * Determines if a Pokemon is defeated based on current round data
   * @param pokemonId - ID of the Pokemon to check
   * @param team - Which team the Pokemon belongs to ('team1' or 'team2')
   * @returns true if Pokemon is defeated (currentLife <= 0), false otherwise
   */
  const getPokemonDefeatedStatus = (
    pokemonId: string,
    team: "team1" | "team2"
  ) => {
    if (!currentRound) return false;
    const stateArr =
      team === "team1" ? currentRound.team1State : currentRound.team2State;
    const pokemon = stateArr.find(
      (p: { id: string; currentLife: number }) => p.id === pokemonId
    );
    return pokemon ? pokemon.currentLife <= 0 : false;
  };

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Simulating Battle...</Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="error">Error: {error}</Typography>
        <Link href="/" passHref>
          <Button variant="contained" sx={{ mt: 2 }}>
            Go Home
          </Button>
        </Link>
      </Box>
    );
  }

  // No data state
  if (!battleData || !currentRound) {
    return <Typography>No battle data available.</Typography>;
  }

  const isFinalRound = "isFinal" in currentRound && currentRound.isFinal;

  const p1 = !isFinalRound ? currentRound.pokemon1 : null;
  const p2 = !isFinalRound ? currentRound.pokemon2 : null;

  const winnerName =
    battleData.winner === searchParams.get("team1")
      ? battleData.team1.name
      : battleData.team2.name;

  return (
    <Box sx={{ bgcolor: "#a4a8da", p: 3, minHeight: "100vh", color: "white" }}>
      {/* Team 1 Roster */}
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Grid size={2}>
          <Typography
            variant="h6"
            className="text-white"
            sx={{ minWidth: 100, textAlign: "right", pr: 2 }}
          >
            {battleData.team1.name}
          </Typography>
        </Grid>
        {battleData.team1.pokemons.map((p) => (
          <Grid key={p.id}>
            <PokemonIcon
              pokemon={p}
              isDefeated={getPokemonDefeatedStatus(p.id, "team1")}
            />
          </Grid>
        ))}
      </Grid>

      {/* Battle Arena */}
      <Paper sx={{ p: 2, bgcolor: "rgba(0,0,0,0.3)", borderRadius: 2 }}>
        {/* Round Navigation */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Button
            variant="contained"
            disabled={currentRoundIndex === 0}
            onClick={() => setCurrentRoundIndex((prev) => prev - 1)}
          >
            Previous
          </Button>
          <Typography className="text-white" variant="h5">
            {isFinalRound
              ? `WINNER: ${winnerName}`
              : `ROUND ${currentRound.roundNumber}`}
          </Typography>
          <Button
            variant="contained"
            disabled={currentRoundIndex >= battleData.battleLog.length - 1}
            onClick={() => setCurrentRoundIndex((prev) => prev + 1)}
          >
            Next
          </Button>
        </Box>

        {/* Battle Display */}
        {!isFinalRound && p1 && p2 && (
          <Grid container spacing={5} alignItems="flex-end">
            {/* Player 1 Pokemon */}
            <Grid size={6} sx={{ textAlign: "center" }}>
              <Box sx={{ display: "inline-block", position: "relative" }}>
                <Typography className="text-white" variant="h6" sx={{ mb: 1 }}>
                  {battleData.team1.name + ": " + p1.name}
                </Typography>
                <img
                  src={p1.image}
                  alt={p1.name}
                  style={{ width: 200, height: 200 }}
                />
                <Paper
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    right: -20,
                    p: "2px 8px",
                    borderRadius: "12px",
                    bgcolor: "lightblue",
                  }}
                >
                  <Typography variant="h6">{p1.power}⚔️</Typography>
                </Paper>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(p1.currentLife / p1.life) * 100}
                sx={{ height: 10, borderRadius: 5, mt: 1 }}
              />
            </Grid>
            {/* Player 2 Pokemon */}
            <Grid size={6} sx={{ textAlign: "center" }}>
              <Box sx={{ display: "inline-block", position: "relative" }}>
                <Typography className="text-white" variant="h6" sx={{ mb: 1 }}>
                  {battleData.team2.name + ": " + p2.name}
                </Typography>
                <img
                  src={p2.image}
                  alt={p2.name}
                  style={{ width: 200, height: 200 }}
                />
                <Paper
                  sx={{
                    position: "absolute",
                    bottom: 10,
                    right: -20,
                    p: "2px 8px",
                    borderRadius: "12px",
                    bgcolor: "lightblue",
                  }}
                >
                  <Typography variant="h6">{p2.power}⚔️</Typography>
                </Paper>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(p2.currentLife / p2.life) * 100}
                sx={{ height: 10, borderRadius: 5, mt: 1 }}
              />
            </Grid>
            {/* Battle Outcome */}
            <Grid size={12}>
              <Typography
                className="text-white"
                sx={{ textAlign: "center", mt: 2, fontStyle: "italic" }}
              >
                {currentRound.outcome}
              </Typography>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Team 2 Roster */}
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{ mt: 2 }}
      >
        <Grid size={2}>
          <Typography
            variant="h6"
            className="text-white"
            sx={{ minWidth: 100, textAlign: "right", pr: 2 }}
          >
            {battleData.team2.name}
          </Typography>
        </Grid>
        {battleData.team2.pokemons.map((p) => (
          <Grid key={p.id}>
            <PokemonIcon
              pokemon={p}
              isDefeated={getPokemonDefeatedStatus(p.id, "team2")}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
