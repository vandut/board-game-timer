import React, { useEffect } from 'react'; // Removed useState
import { Player, GameSettings } from '../types';
import PlayerTimerBox from './PlayerTimerBox';
import Button from './Button';
import TimerDisplay from './TimerDisplay'; 

interface GameScreenProps {
  gameSettings: GameSettings;
  players: Player[]; // Changed from initialPlayers
  activePlayerId: number | null; // Changed from initialActivePlayerId
  sessionTimeRemaining: number; 
  sessionTimeOverdue: number;   
  currentRound: number;         
  totalGameTimeElapsed: number; 
  onPlayerSelect: (playerId: number) => void;
  onResetGame: () => void;
  onPlayerActiveTick: (playerId: number) => void; // Changed from onUpdatePlayerTime
  onAdvanceRound?: () => void; 
}

const formatSessionFooterInfo = (settings: GameSettings, players: Player[]): string => {
  const { totalSessionTimeHours: hours, totalSessionTimeMinutes: minutes, numberOfRounds } = settings;
  const hrText = `${hours} hr${hours !== 1 ? 's' : ''}`;
  const minText = `${minutes} min${minutes !== 1 ? 's' : ''}`;
  let durationStr = "0 mins";
  if (hours > 0 && minutes > 0) durationStr = `${hrText} ${minText}`;
  else if (hours > 0) durationStr = hrText;
  else if (minutes > 0) durationStr = minText;

  const roundsStr = `${numberOfRounds} round${numberOfRounds !== 1 ? 's' : ''}`;
  return `Session: ${durationStr} over ${roundsStr}, ${players.length} players.`;
};

const GameScreen: React.FC<GameScreenProps> = ({
  gameSettings,
  players, // Use prop directly
  activePlayerId, // Use prop directly
  sessionTimeRemaining, 
  sessionTimeOverdue,   
  currentRound,
  totalGameTimeElapsed,
  onPlayerSelect,
  onResetGame,
  onPlayerActiveTick, // Use new prop
  onAdvanceRound,
}) => {
  // Removed local useState for players and activePlayerId
  // Removed useEffects that set local state from initialPlayers/initialActivePlayerId

  useEffect(() => {
    if (activePlayerId === null) {
      return; 
    }

    const intervalId = setInterval(() => {
      // Signal App.tsx to handle the logic for the active player's tick
      onPlayerActiveTick(activePlayerId);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activePlayerId, onPlayerActiveTick]); // Correct dependencies

  const handleLocalPlayerSelect = (playerId: number) => {
    onPlayerSelect(playerId); 
  };
  
  const getGridColsClass = () => {
    const numPlayers = players.length;
    if (numPlayers <= 1) return 'grid-cols-1';
    if (numPlayers <= 2) return 'grid-cols-1 sm:grid-cols-2';
    if (numPlayers <= 4) return 'grid-cols-2';
    if (numPlayers <= 6) return 'grid-cols-2 md:grid-cols-3';
    if (numPlayers <= 9) return 'grid-cols-3';
    if (numPlayers <= 12) return 'grid-cols-3 md:grid-cols-4';
    return 'grid-cols-3 sm:grid-cols-4';
  };

  const canAdvanceRound = onAdvanceRound && currentRound < gameSettings.numberOfRounds;

  return (
    <div className="min-h-screen flex flex-col p-4 bg-slate-50">
      <header className="mb-6 sticky top-0 bg-slate-50/95 backdrop-blur-sm py-4 z-10">
        <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-sky-700 mb-1">
              Round: {currentRound} / {gameSettings.numberOfRounds}
            </h2>
            <div className="flex flex-col items-center sm:items-start">
              <div>
                <span className="text-slate-600 font-bold text-xl">Game Time: </span>
                <TimerDisplay timeInSeconds={totalGameTimeElapsed} className="text-slate-800 font-bold text-xl" />
              </div>
              <div className="mt-1">
                <span className="text-slate-600 font-bold text-xl">Session Left: </span>
                <TimerDisplay timeInSeconds={sessionTimeRemaining} className="text-slate-800 font-bold text-xl" />
              </div>
              {sessionTimeOverdue > 0 && (
                <div className="mt-1">
                  <span className="text-red-600 font-bold text-xl">Total Overdue: </span>
                  <TimerDisplay timeInSeconds={sessionTimeOverdue} className="text-red-600 font-bold text-xl" />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            {onAdvanceRound && canAdvanceRound && (
              <Button onClick={onAdvanceRound} variant="primary" className="px-4 py-2 text-sm sm:text-base">
                Advance to Next Round
              </Button>
            )}
            <Button onClick={onResetGame} variant="danger" className="px-4 py-2 text-sm sm:text-base">
              Reset Game
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl w-full mx-auto">
        <div className={`grid ${getGridColsClass()} gap-3 md:gap-4`}>
          {players.map((player) => (
            <PlayerTimerBox
              key={player.id}
              player={player}
              isActive={player.id === activePlayerId}
              onSelect={() => handleLocalPlayerSelect(player.id)}
              numberOfRounds={gameSettings.numberOfRounds}
            />
          ))}
        </div>
      </main>
       <footer className="mt-8 text-center text-sm text-slate-500 py-4">
        <p>Tap a player to start/stop their timer. {formatSessionFooterInfo(gameSettings, players)}</p>
      </footer>
    </div>
  );
};

export default GameScreen;