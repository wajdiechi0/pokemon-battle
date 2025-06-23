/**
 * Core Pokemon interface representing a Pokemon's basic attributes
 */
export interface Pokemon {
  /** Unique identifier for the Pokemon */
  id: string;
  /** Pokemon's name */
  name: string;
  /** URL to the Pokemon's image */
  image: string;
  /** Attack power (10-100) */
  power: number;
  /** Maximum health points (10-100) */
  life: number;
  /** Pokemon's type (Fire, Water, Grass) */
  type: string;
}

/**
 * Extended Pokemon interface for battle scenarios with current health tracking
 */
export interface BattlePokemon extends Pokemon {
  /** Current health points during battle (can be less than life) */
  currentLife: number;
}

/**
 * Represents a single action or event that occurs during a battle round
 */
export interface BattleAction {
  /** Detailed description of player 1's action */
  p1_action: string;
  /** Detailed description of player 2's action */
  p2_action: string;
  /** Player 1's health before the action */
  p1_life_before: number;
  /** Optional: Player 2's health before the action */
  p2_life_before: number;
  /** Player 1's health after the action */
  p1_life_after: number;
  /** Player 2's health after the action */
  p2_life_after: number;
}

/**
 * Represents a single round of battle between two Pokemon
 */
export interface BattleRound {
  /** Indicates this is not the final round */
  isFinal?: false;
  /** Round number (1, 2, 3, etc.) */
  roundNumber: number;
  /** Player 1's Pokemon with current battle state */
  pokemon1: BattlePokemon;
  /** Player 2's Pokemon with current battle state */
  pokemon2: BattlePokemon;
  /** Array of actions that occurred during this round */
  actions: BattleAction[];
  /** Outcome description of the round (e.g., "Charizard defeated Blastoise!") */
  outcome: string;
  /** Current state of all Pokemon in team 1 after this round */
  team1State: { id: string; currentLife: number }[];
  /** Current state of all Pokemon in team 2 after this round */
  team2State: { id: string; currentLife: number }[];
}

/**
 * Represents the final outcome of a complete battle
 */
export interface FinalOutcome {
  /** Indicates this is the final outcome */
  isFinal: true;
  /** ID of the winning team, or null if it's a tie */
  winner: string | null;
  /** Optional: Final state of all Pokemon in team 1 */
  team1State?: { id: string; currentLife: number }[];
  /** Optional: Final state of all Pokemon in team 2 */
  team2State?: { id: string; currentLife: number }[];
}

/**
 * Union type representing either a battle round or final outcome
 */
export type BattleLogEntry = BattleRound | FinalOutcome;

/**
 * Complete battle data including teams, battle log, and winner
 */
export interface BattleData {
  /** Array of all battle rounds and final outcome */
  battleLog: BattleLogEntry[];
  /** Team 1 data with name and Pokemon array */
  team1: { name: string; pokemons: Pokemon[] };
  /** Team 2 data with name and Pokemon array */
  team2: { name: string; pokemons: Pokemon[] };
  /** ID of the winning team, or null if it's a tie */
  winner: string | null;
}
