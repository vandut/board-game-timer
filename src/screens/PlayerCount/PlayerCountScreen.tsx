import React, { useState, useCallback } from 'react';
import Button from '../../components/Button';
import AppHeader from '../../components/AppHeader'; 
import { playNavigateForwardSound } from '../../audioUtils';
import PlayerCountInput from './PlayerCountInput';

interface PlayerCountScreenProps {
  onProceedToTimeConfig: (numPlayers: number) => void;
}

const PlayerCountScreen: React.FC<PlayerCountScreenProps> = ({ onProceedToTimeConfig }) => {
  const [validatedNumPlayers, setValidatedNumPlayers] = useState<number>(4);
  const [playerInputError, setPlayerInputError] = useState<string | null>(null);
  
  const handlePlayerCountChange = useCallback((value: number, error: string | null) => {
    setValidatedNumPlayers(value);
    setPlayerInputError(error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // PlayerCountInput handles its own validation and passes up an error state.
    // If there's no error, we can proceed.
    if (!playerInputError) { 
        await playNavigateForwardSound();
        // validatedNumPlayers is the numeric value received from PlayerCountInput's callback.
        // If playerInputError is null, PlayerCountInput has confirmed this value is valid.
        onProceedToTimeConfig(validatedNumPlayers); 
    }
    // No 'else' block needed here. The button is disabled if playerInputError is not null.
    // If the form were submitted with an error (e.g., if JS for button disabling failed),
    // this check prevents proceeding.
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 to-sky-100">
      <AppHeader />
      <main className="flex-grow flex flex-col items-center justify-start pt-6 sm:pt-10 pb-8 px-4 w-full">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-center text-sky-700 mb-6">Player Count Setup</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <PlayerCountInput
              id="numPlayers"
              label="Number of Players (1-16)"
              initialValue={validatedNumPlayers} // PlayerCountInput will validate this initial value
              onValueChange={handlePlayerCountChange}
              min={1}
              max={16}
              maxLength={2}
            />
            
            <div className="space-y-3 pt-2">
               <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-full py-3 text-lg"
                  disabled={!!playerInputError}
                >
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