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
  // Initialize editablePlayers directly with the initialPlayers prop.
  // This assumes initialPlayers already has correctly calculated time properties from App.tsx.
  const [editablePlayers, setEditablePlayers] = useState<Player[]>(initialPlayers);

  // If initialPlayers prop itself changes (e.g. user goes back and settings change, or initial load),
  // ensure editablePlayers is updated to reflect the new prop.
  useEffect(() => {
    setEditablePlayers(initialPlayers);
  }, [initialPlayers]);

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
    // onConfirm now passes editablePlayers which has updated names,
    // and the time properties are those that were originally passed in via initialPlayers.
    onConfirm(editablePlayers);
  };

  // This loading condition might briefly be true if initialPlayers is somehow not populated
  // when the component first renders, before the useEffect [initialPlayers] kicks in.
  // However, App.tsx should ensure initialPlayers is populated before navigating here.
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