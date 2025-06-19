import React, { useState, useEffect } from 'react';
import { Player, GameSettings } from '../../types';
import Button from '../../components/Button';
import AppHeader from '../../components/AppHeader';
import { playNavigateForwardSound } from '../../audioUtils';

const formatGameSettingsForDisplay = (settings: GameSettings): string => {
  const { 
    totalSessionTimeHours: hours, 
    totalSessionTimeMinutes: minutes, 
    numberOfRounds, 
    carryOverUnusedTime,
    payOverdueWithUnusedRoundTime 
  } = settings;
  const hrText = `${hours} hour${hours !== 1 ? 's' : ''}`;
  const minText = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  let durationStr = "0 minutes";

  if (hours > 0 && minutes > 0) {
    durationStr = `${hrText} ${minText}`;
  } else if (hours > 0) {
    durationStr = hrText;
  } else if (minutes > 0) {
    durationStr = minText;
  }
  
  const roundsStr = `${numberOfRounds} round${numberOfRounds !== 1 ? 's' : ''}`;
  
  let featuresStr = "";
  if (numberOfRounds > 1) {
    const carryOverStr = carryOverUnusedTime ? "Unused round time carries over." : "Unused round time is lost.";
    const payOverdueStr = payOverdueWithUnusedRoundTime ? "Can pay overdue with unused round time." : "Cannot pay overdue with unused round time.";
    featuresStr = `${carryOverStr} ${payOverdueStr}`;
  } else {
    featuresStr = "Single round game.";
  }
  
  return `Total Session: ${durationStr} over ${roundsStr}. ${featuresStr}`;
};

interface PlayerNameScreenProps {
  initialPlayers: Player[];
  gameSettings: GameSettings;
  onConfirm: (updatedPlayers: Player[]) => void;
  onBack: () => void; 
}

const PlayerNameScreen: React.FC<PlayerNameScreenProps> = ({
  initialPlayers,
  gameSettings,
  onConfirm,
  onBack,
}) => {
  const [editablePlayers, setEditablePlayers] = useState<Player[]>([]);

  useEffect(() => {
    const totalSessionSeconds = (gameSettings.totalSessionTimeHours * 3600) + (gameSettings.totalSessionTimeMinutes * 60);
    let playerTotalTimeAllocated = 0;
    if (gameSettings.numberOfPlayers > 0) {
      playerTotalTimeAllocated = Math.floor(totalSessionSeconds / gameSettings.numberOfPlayers);
    } else {
      playerTotalTimeAllocated = totalSessionSeconds;
    }
    let playerRoundTimeAllocated = 0;
    if (gameSettings.numberOfPlayers > 0 && gameSettings.numberOfRounds > 0) {
      playerRoundTimeAllocated = Math.floor(totalSessionSeconds / gameSettings.numberOfPlayers / gameSettings.numberOfRounds);
    } else if (gameSettings.numberOfPlayers > 0) {
      playerRoundTimeAllocated = playerTotalTimeAllocated;
    } else {
        playerRoundTimeAllocated = totalSessionSeconds / (gameSettings.numberOfRounds > 0 ? gameSettings.numberOfRounds : 1);
    }

    setEditablePlayers(initialPlayers.map(p => ({ 
        ...p,
        timeAllocated: playerTotalTimeAllocated,
        timeRemaining: playerTotalTimeAllocated,
        roundTimeAllocated: playerRoundTimeAllocated,
        roundTimeRemaining: playerRoundTimeAllocated,
    })));
  }, [initialPlayers, gameSettings]);

  const handleNameChange = (playerId: number, newName: string) => {
    setEditablePlayers(prevPlayers =>
      prevPlayers.map(p => (p.id === playerId ? { ...p, name: newName } : p))
    );
  };

  const handleClearPlayerName = (playerId: number) => {
    handleNameChange(playerId, '');
    const inputElement = document.getElementById(`player-name-${playerId}`);
    if (inputElement) {
      inputElement.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editablePlayers.some(p => p.name.trim() === '')) {
        alert('All players must have a name.');
        return;
    }
    await playNavigateForwardSound();
    onConfirm(editablePlayers);
  };

  if (!editablePlayers.length && gameSettings.numberOfPlayers > 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-100 to-blue-100">
        <AppHeader />
        <main className="flex-grow flex items-center justify-center p-4">
          Loading player setup...
        </main>
        <footer className="w-full text-center py-4 text-sm text-slate-500">
         <p>&copy; {new Date().getFullYear()} Board Game Timer App</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-100 to-blue-100">
      <AppHeader />
      <main className="flex-grow flex flex-col items-center justify-start pt-6 sm:pt-10 pb-8 px-4 w-full">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg space-y-6">
          <header className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-sky-700">Set Player Names</h1>
            {gameSettings && (
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {formatGameSettingsForDisplay(gameSettings)} <br />
                {gameSettings.numberOfPlayers} player{gameSettings.numberOfPlayers !==1 ? 's' : ''}.
              </p>
            )}
          </header>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4">
              {editablePlayers.map((player, index) => (
                <div key={player.id} className="flex flex-col">
                  <label htmlFor={`player-name-${player.id}`} className="mb-1 text-sm font-medium text-slate-600">
                    Player {index + 1} Name
                  </label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      id={`player-name-${player.id}`}
                      value={player.name}
                      onChange={(e) => handleNameChange(player.id, e.target.value)}
                      className="p-3 pr-10 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors w-full bg-white text-slate-900 placeholder-slate-400"
                      style={{ colorScheme: 'light' }}
                      required
                      maxLength={50}
                    />
                    {player.name && (
                      <button
                        type="button"
                        onClick={() => handleClearPlayerName(player.id)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl font-sans"
                        aria-label={`Clear Player ${index + 1} Name`}
                        tabIndex={-1} 
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="button" onClick={onBack} variant="secondary" className="w-full sm:w-auto">
                Back
              </Button>
              <Button type="submit" variant="primary" className="w-full sm:flex-grow py-3 text-lg">
                Start Game Session
              </Button>
            </div>
          </form>
        </div>
      </main>
       <footer className="w-full text-center py-4 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Board Game Timer App</p>
      </footer>
    </div>
  );
};

export default PlayerNameScreen;