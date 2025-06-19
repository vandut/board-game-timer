import React, { useRef, useState, useEffect } from 'react';
import BaseInput from '../../components/BaseInput'; // Import BaseInput

interface PlayerNameInputProps {
  playerId: number;
  playerIndex: number;
  currentName: string;
  onStateChange: (playerId: number, newName: string, hasError: boolean) => void;
  maxLength: number;
}

const PlayerNameInput: React.FC<PlayerNameInputProps> = ({
  playerId,
  playerIndex,
  currentName,
  onStateChange,
  maxLength,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  // This state now directly controls the error message passed to BaseInput
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const isFocused = document.activeElement === inputRef.current;
    const isEmpty = currentName.trim() === '';

    if (isEmpty) {
      // Set error message if blurred and empty.
      // Clear error message if focused and empty (user is likely editing or just cleared it).
      setErrorMessage(isFocused ? null : "Player name cannot be empty.");
    } else {
      setErrorMessage(null); // Not empty, so no error.
    }
  }, [currentName]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const hasError = newName.trim() === '';
    onStateChange(playerId, newName, hasError);

    // If typing makes it empty, show error. If typing makes it non-empty, clear error.
    setErrorMessage(hasError ? "Player name cannot be empty." : null);
  };

  const handleClearInput = () => {
    onStateChange(playerId, '', true); // Name is now empty, hasError is true
    // Visual error is suppressed because input is cleared and will be focused.
    setErrorMessage(null); 
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleBlur = () => {
    const hasError = currentName.trim() === '';
    // On blur, if the input is empty, show the visual error.
    setErrorMessage(hasError ? "Player name cannot be empty." : null);
  };
  
  return (
    <BaseInput
      id={`player-name-${playerId}`}
      label={`Player ${playerIndex + 1} Name`}
      value={currentName}
      onChange={handleInputChange}
      onBlur={handleBlur}
      onClear={handleClearInput}
      error={errorMessage}
      placeholder="Enter player name"
      maxLength={maxLength}
      required
      inputRef={inputRef}
      className="flex flex-col" // Pass the specific className for this input type
      type="text"
    />
  );
};

export default PlayerNameInput;