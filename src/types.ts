export interface Player {
  id: number;
  name: string;
  timeAllocated: number; // Initial total time in seconds for the player across all rounds
  timeRemaining: number; // Current total time in seconds for the player, can be negative
  // For 'round' specific timing
  roundTimeAllocated: number; // Calculated time per round in seconds for this player
  roundTimeRemaining: number; // Current time in current round in seconds, can be negative
  accumulatedOverdueTime: number; // Total overdue time accumulated by this player across all rounds
}

export interface GameSettings {
  numberOfPlayers: number;
  totalSessionTimeHours: number;
  totalSessionTimeMinutes: number;
  numberOfRounds: number; // 1-99 rounds, mandatory
  carryOverUnusedTime: boolean; 
  payOverdueWithUnusedRoundTime: boolean;
}