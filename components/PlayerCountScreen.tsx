
import React, { useState, useRef } from 'react';
import Button from './Button';
// InputNumber is no longer used directly for this input
import AppHeader from './AppHeader'; 

interface PlayerCountScreenProps {
  onProceedToTimeConfig: (numPlayers: number) => void;
}

const PlayerCountScreen: React.FC<PlayerCountScreenProps> = ({ onProceedToTimeConfig }) => {
  const [numPlayersInternal, setNumPlayersInternal] = useState<number>(4); // Validated internal number
  const [numPlayersDisplayValue, setNumPlayersDisplayValue] = useState<string>("4"); // String value for input
  const [playerInputError, setPlayerInputError] = useState<string | null>(null);
  const numPlayersInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetNumPlayers = (value: string): number => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) {
      setPlayerInputError("Number of players must be at least 1.");
      return 1;
    }
    if (parsed > 16) {
      setPlayerInputError("Number of players cannot exceed 16.");
      return 16;
    }
    setPlayerInputError(null);
    return parsed;
  };
  
  const handleNumPlayersDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const filteredValue = inputValue.replace(/[^0-9]/g, ''); // Allow only digits
    setNumPlayersDisplayValue(filteredValue);
    setPlayerInputError(null); // Clear error on change

    if (filteredValue === '') {
        // Allow empty state during typing, internal value might default or wait for blur
        setNumPlayersInternal(1); // Default internal for safety if needed before blur
    } else {
        const parsed = parseInt(filteredValue, 10);
        if (!isNaN(parsed)) {
            if (parsed >= 1 && parsed <= 16) {
                setNumPlayersInternal(parsed);
            } else if (parsed > 16) {
                setNumPlayersInternal(16); // Cap for internal use
            } else { // parsed < 1
                setNumPlayersInternal(1); // Default for internal use
            }
        } else {
             setNumPlayersInternal(1); // Default if somehow NaN after filtering
        }
    }
  };

  const handleNumPlayersBlur = () => {
    let val = parseInt(numPlayersDisplayValue, 10);
    if (isNaN(val) || val < 1) {
        val = 1;
        setPlayerInputError("Number of players must be at least 1.");
    } else if (val > 16) {
        val = 16;
        setPlayerInputError("Number of players cannot exceed 16.");
    } else {
         setPlayerInputError(null);
    }
    setNumPlayersInternal(val);
    setNumPlayersDisplayValue(String(val));
  };

  const handleClearNumPlayersInput = () => {
    setNumPlayersDisplayValue('');
    setNumPlayersInternal(1); // Reset internal to default
    setPlayerInputError(null);
    if (numPlayersInputRef.current) {
        numPlayersInputRef.current.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure final validation on submit using the blur logic
    handleNumPlayersBlur(); 
    // Check error state after blur handles final validation
    if (!playerInputError) { 
        // Use numPlayersInternal as it's the validated number
        onProceedToTimeConfig(numPlayersInternal); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 to-sky-100">
      <AppHeader />
      <main className="flex-grow flex flex-col items-center justify-start pt-6 sm:pt-10 pb-8 px-4 w-full">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-center text-sky-700 mb-6">Player Count Setup</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="numPlayers" className="block mb-1 text-sm font-medium text-slate-600">
                Number of Players (1-16)
              </label>
              <div className="relative w-full">
                <input
                  ref={numPlayersInputRef}
                  type="text" 
                  id="numPlayers"
                  value={numPlayersDisplayValue}
                  onChange={handleNumPlayersDisplayChange}
                  onBlur={handleNumPlayersBlur}
                  placeholder="1-16"
                  className={`p-3 pr-10 border rounded-lg shadow-sm focus:ring-2 focus:border-sky-500 outline-none transition-colors w-full bg-white text-slate-900 placeholder-slate-400 ${
                    playerInputError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-sky-500'
                  }`}
                  style={{ colorScheme: 'light' }}
                  required
                  aria-describedby="player-input-error"
                  maxLength={2} // Max 2 digits for 1-16
                />
                {numPlayersDisplayValue && (
                  <button
                    type="button"
                    onClick={handleClearNumPlayersInput}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl font-sans"
                    aria-label="Clear number of players"
                    tabIndex={-1}
                  >&#x2715;</button> 
                )}
              </div>
              {playerInputError && (
                  <p id="player-input-error" className="mt-1 text-xs text-red-600">
                    {playerInputError}
                  </p>
              )}
            </div>
            
            <div className="space-y-3 pt-2">
               <Button type="submit" variant="primary" className="w-full py-3 text-lg">
                  Next: Configure Time
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

export default PlayerCountScreen;
