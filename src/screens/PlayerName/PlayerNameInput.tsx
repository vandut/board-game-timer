import React, { useRef, useState, useEffect } from 'react';

interface PlayerNameInputProps {
  playerId: number;
  playerIndex: number;
  currentName: string;
  onNameChange: (playerId: number, newName: string) => void;
  maxLength: number;
}

const PlayerNameInput: React.FC<PlayerNameInputProps> = ({
  playerId,
  playerIndex,
  currentName,
  onNameChange,
  maxLength,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showInlineError, setShowInlineError] = useState(false);

  const errorId = `player-name-error-${playerId}`;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    onNameChange(playerId, newName);
    // If user starts typing and an error was shown, clear it
    if (newName.trim() !== '' && showInlineError) {
      setShowInlineError(false);
    }
  };

  const handleClearInput = () => {
    onNameChange(playerId, '');
    // Do not set error here, focus and let blur handle it
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleBlur = () => {
    if (currentName.trim() === '') {
      setShowInlineError(true); // Show error if blurred empty
    } else {
      setShowInlineError(false); // Clear error if blurred with content
    }
  };

  const inputId = `player-name-${playerId}`;

  return (
    <div className="flex flex-col">
      <label htmlFor={inputId} className="mb-1 text-sm font-medium text-slate-600">
        Player {playerIndex + 1} Name
      </label>
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          id={inputId}
          value={currentName}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="Enter player name"
          className={`p-3 pr-10 border rounded-lg shadow-sm focus:ring-2 outline-none transition-colors w-full bg-white text-slate-900 placeholder-slate-400 ${
            showInlineError 
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
              : 'border-slate-300 focus:ring-sky-500 focus:border-sky-500'
          }`}
          style={{ colorScheme: 'light' }}
          required
          maxLength={maxLength}
          aria-label={`Player ${playerIndex + 1} Name Input`}
          aria-invalid={showInlineError}
          aria-describedby={showInlineError ? errorId : undefined}
        />
        {currentName && (
          <button
            type="button"
            onClick={handleClearInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl font-sans"
            aria-label={`Clear Player ${playerIndex + 1} Name`}
            tabIndex={-1}
          >
            ✕
          </button>
        )}
      </div>
      {showInlineError && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          Player name cannot be empty.
        </p>
      )}
    </div>
  );
};

export default PlayerNameInput;