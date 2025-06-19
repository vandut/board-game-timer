import React from 'react';
import { GameSettings } from '../../types';

interface GameSettingsDisplayProps {
  gameSettings: GameSettings;
}

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

const GameSettingsDisplay: React.FC<GameSettingsDisplayProps> = ({ gameSettings }) => {
  if (!gameSettings) {
    return null;
  }

  return (
    <p className="text-sm text-slate-600 mt-1 leading-relaxed">
      {formatGameSettingsForDisplay(gameSettings)} <br />
      {gameSettings.numberOfPlayers} player{gameSettings.numberOfPlayers !== 1 ? 's' : ''}.
    </p>
  );
};

export default GameSettingsDisplay;