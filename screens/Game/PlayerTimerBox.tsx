import React from 'react';
import { Player } from '../../types';
import TimerDisplay, { formatTime } from '../../components/TimerDisplay'; 

interface PlayerTimerBoxProps {
  player: Player; 
  isActive: boolean;
  onSelect: () => void;
  numberOfRounds: number; 
}

const PlayerTimerBox: React.FC<PlayerTimerBoxProps> = ({ player, isActive, onSelect, numberOfRounds }) => {
  const isRoundOverdue = player.roundTimeRemaining < 0;
  const hasAccumulatedOverdue = player.accumulatedOverdueTime > 0;

  let bgColor = isActive ? 'bg-sky-100' : 'bg-white hover:bg-slate-50';
  let textColor = isActive ? 'text-sky-700' : 'text-slate-700';
  let borderColor = isActive ? 'border-sky-500 ring-2 ring-sky-500' : 'border-slate-300';
  let statusText = '';
  // Status text color will match the determined textColor

  if (isRoundOverdue) { 
    // Main box becomes red only if current round is overdue
    bgColor = isActive ? 'bg-red-300' : 'bg-red-200';
    borderColor = isActive ? 'border-red-700 ring-2 ring-red-700' : 'border-red-500';
    textColor = isActive ? 'text-red-800' : 'text-red-700';
    statusText = numberOfRounds > 1 ? 'ROUND OVER TIME' : 'TIME UP';
  }

  const statusTextColor = textColor; // Status text color matches the main text color

  const ariaLabel = `${player.name}, current round time: ${formatTime(player.roundTimeRemaining)}${isRoundOverdue ? (numberOfRounds > 1 ? ', round time exceeded' : ', time exceeded') : ''}${hasAccumulatedOverdue ? `, total accumulated overdue: ${formatTime(player.accumulatedOverdueTime)}` : ''}.`;

  return (
    <div
      className={`p-4 rounded-lg shadow-lg cursor-pointer transition-all duration-200 ease-in-out border-2 ${borderColor} ${bgColor} flex flex-col items-center justify-center space-y-1 min-h-[150px] sm:min-h-[170px]`} // Adjusted spacing and min-height slightly
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
      aria-label={ariaLabel}
    >
      <h3 className={`text-xl font-semibold ${textColor}`}>{player.name}</h3>
      <div className="flex flex-col items-center">
        <TimerDisplay timeInSeconds={player.roundTimeRemaining} className={`text-3xl sm:text-4xl font-bold ${textColor}`} />
        {numberOfRounds > 0 && <span className="text-xs text-slate-500 -mt-1 opacity-70">(Current Round)</span>}
      </div>
      
      {statusText && <p className={`text-sm font-medium ${statusTextColor} opacity-90 mt-1`}>{statusText}</p>}

      {hasAccumulatedOverdue && (
        <div className="mt-1 text-center">
          <span className="text-xs text-red-700 font-medium">Total Overdue: </span>
          <TimerDisplay timeInSeconds={player.accumulatedOverdueTime} className="text-xs text-red-700 font-semibold" />
        </div>
      )}
    </div>
  );
};

export default PlayerTimerBox;
