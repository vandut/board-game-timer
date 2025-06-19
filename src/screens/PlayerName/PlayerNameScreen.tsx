import React, { useState, useEffect } from 'react';
import { Player, GameSettings } from '../../types';
import Button from '../../components/Button';
import AppHeader from '../../components/AppHeader';
import { playNavigateForwardSound } from '../../audioUtils';
import PlayerNameInput from './PlayerNameInput';
import GameSettingsDisplay from './GameSettingsDisplay'; // Import the new component

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
            <GameSettingsDisplay gameSettings={gameSettings} />
          </header>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-4">
              {editablePlayers.map((player, index) => (
                <PlayerNameInput
                  key={player.id}
                  playerId={player.id}
                  playerIndex={index}
                  currentName={player.name}
                  onNameChange={handleNameChange}
                  maxLength={50}
                />
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