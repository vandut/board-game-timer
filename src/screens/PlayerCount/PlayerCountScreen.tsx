import React, { useState, useCallback } from 'react';
import Button from '../../components/Button';
import { playNavigateForwardSound } from '../../audioUtils';
import PlayerCountInput from './PlayerCountInput';
import SetupScreenLayout from '../../components/SetupScreenLayout';
import SetupScreenHeader from '../../components/SetupScreenHeader'; // Import the new header

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
    if (!playerInputError) { 
        await playNavigateForwardSound();
        onProceedToTimeConfig(validatedNumPlayers); 
    }
  };

  return (
    <SetupScreenLayout>
      <SetupScreenHeader mainText="Player Count Setup" />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <PlayerCountInput
          id="numPlayers"
          label="Number of Players (1-16)"
          initialValue={validatedNumPlayers}
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
    </SetupScreenLayout>
  );
};

export default PlayerCountScreen;
