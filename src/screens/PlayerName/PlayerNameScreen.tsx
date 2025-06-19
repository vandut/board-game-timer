import React, { useState, useEffect, useMemo } from 'react';
import { Player, GameSettings } from '../../types';
import Button from '../../components/Button';
import { playNavigateForwardSound } from '../../audioUtils';
import PlayerNameInput from './PlayerNameInput';
import SetupScreenLayout from '../../components/SetupScreenLayout';
import SetupScreenHeader from '../../components/SetupScreenHeader'; // Import the new header

interface PlayerNameScreenProps {
  initialPlayers: Player[];
  gameSettings: GameSettings;
  onConfirm: (updatedPlayers: Player[]) => void;
  onBack: () => void; 
}

// Helper function to format main game settings display string
const formatGameSettingsSummary = (settings: GameSettings): string => {
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
  
  return `Total Session: ${durationStr} over ${roundsStr}.\n${featuresStr}`;
};


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
        alert('All players must have a name.');
        return;
    }
    if (editablePlayers.some(p => p.name.trim() === '')) {
        alert('All players must have a name. Please ensure all names are filled.');
        return;
    }
    await playNavigateForwardSound();
    onConfirm(editablePlayers);
  };

  const isAnyNameInvalid = useMemo(() => {
    if (gameSettings.numberOfPlayers > 0 && Object.keys(playerNameErrors).length !== gameSettings.numberOfPlayers) {
      return true;
    }
    return Object.values(playerNameErrors).some(hasError => hasError);
  }, [playerNameErrors, gameSettings.numberOfPlayers]);

  const subHeaderText = useMemo(() => {
    if (!gameSettings) return undefined;
    const settingsSummary = formatGameSettingsSummary(gameSettings);
    const playersSummary = `${gameSettings.numberOfPlayers} player${gameSettings.numberOfPlayers !== 1 ? 's' : ''}.`;
    return `${settingsSummary}\n${playersSummary}`;
  }, [gameSettings]);

  return (
    <SetupScreenLayout>
      <SetupScreenHeader 
        mainText="Set Player Names"
        subText={subHeaderText}
      />
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
    </SetupScreenLayout>
  );
};

export default PlayerNameScreen;
