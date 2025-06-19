

import React, { useState, useEffect, useMemo } from 'react';
import { Player, GameSettings } from '../../types';
import Button from '../../components/Button';
import AppHeader from '../../components/AppHeader';
import { playNavigateForwardSound } from '../../audioUtils';
import PlayerNameInput from './PlayerNameInput';
import GameSettingsDisplay from './GameSettingsDisplay';

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
  const [editablePlayers, setEditablePlayers] = useState<Player[]>(initialPlayers);
  const [playerNameErrors, setPlayerNameErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    setEditablePlayers(initialPlayers);
    const newErrors: Record<number, boolean> = {};
    initialPlayers.forEach(player => {
      newErrors[player.id] = player.name.trim() === '';
    });
    setPlayerNameErrors(newErrors);
  }, [initialPlayers]);

  const handlePlayerNameStateChange = (playerId: number, newName: string, hasError: boolean) => {
    setEditablePlayers(prevPlayers =>
      prevPlayers.map(p => (p.id === playerId ? { ...p, name: newName } : p))
    );
    setPlayerNameErrors(prevErrors => ({
      ...prevErrors,
      [playerId]: hasError
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAnyInvalid = Object.values(playerNameErrors).some(err => err);
    if (isAnyInvalid) {
        // This alert is a fallback, button should be disabled
        alert('All players must have a name.');
        return;
    }
    // Double check directly from editablePlayers as final source of truth for names
    if (editablePlayers.some(p => p.name.trim() === '')) {
        alert('All players must have a name. Please ensure all names are filled.');
        return;
    }
    await playNavigateForwardSound();
    onConfirm(editablePlayers);
  };

  const isAnyNameInvalid = useMemo(() => {
    // Ensure all players have an error status initialized.
    // If not (e.g., during initial setup), consider it invalid to be safe.
    if (gameSettings.numberOfPlayers > 0 && Object.keys(playerNameErrors).length !== gameSettings.numberOfPlayers) {
      return true;
    }
    return Object.values(playerNameErrors).some(hasError => hasError);
  }, [playerNameErrors, gameSettings.numberOfPlayers]);


  if (!editablePlayers.length && gameSettings.numberOfPlayers > 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 to-sky-100">
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 to-sky-100">
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
                  onStateChange={handlePlayerNameStateChange}
                  maxLength={50}
                />
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="button" onClick={onBack} variant="secondary" className="w-full sm:w-auto">
                Back
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full sm:flex-grow py-3 text-lg"
                disabled={isAnyNameInvalid}
              >
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