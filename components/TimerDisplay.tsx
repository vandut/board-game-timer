import React from 'react';

interface TimerDisplayProps {
  timeInSeconds: number;
  className?: string;
}

export const formatTime = (totalSeconds: number): string => {
  const isNegative = totalSeconds < 0;
  if (isNegative) {
    totalSeconds = -totalSeconds;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60); // Use Math.floor to avoid fractional seconds

  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');

  let timeString = '';
  if (hours > 0) {
    timeString = `${hh}:${mm}:${ss}`;
  } else {
    timeString = `${mm}:${ss}`;
  }
  
  return isNegative ? `-${timeString}` : timeString;
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeInSeconds, className }) => {
  return (
    <span className={className}>
      {formatTime(timeInSeconds)}
    </span>
  );
};

export default TimerDisplay;