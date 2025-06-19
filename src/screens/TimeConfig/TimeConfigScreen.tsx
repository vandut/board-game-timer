import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { GameSettings } from '../../types';
import Button from '../../components/Button';
import TimerDisplay from '../../components/TimerDisplay';
import AppHeader from '../../components/AppHeader'; 
import { playNavigateForwardSound } from '../../audioUtils';
import SessionTimeInput from './SessionTimeInput';
import RoundsInput from './RoundsInput'; // Changed import

interface TimeConfigScreenProps {
  onSaveSettings: (settings: Omit<GameSettings, 'numberOfPlayers'>) => void;
  onBackToPlayerCount: () => void; 
  initialSettings: Partial<Omit<GameSettings, 'numberOfPlayers'>> & { 
    numberOfPlayers: number;
    carryOverUnusedTime?: boolean; 
    payOverdueWithUnusedRoundTime?: boolean; 
  };
}

const TimeConfigScreen: React.FC<TimeConfigScreenProps> = ({ onSaveSettings, onBackToPlayerCount, initialSettings }) => {
  const [sessionHours, setSessionHours] = useState<number>(1);
  const [sessionMinutes, setSessionMinutes] = useState<number>(0);
  const [sessionTimeError, setSessionTimeError] = useState<string | null>(null);

  const [numRounds, setNumRounds] = useState<number>(1);
  const [numRoundsError, setNumRoundsError] = useState<string | null>(null);

  const [carryOverTime, setCarryOverTime] = useState<boolean>(true); 
  const [payOverdueTime, setPayOverdueTime] = useState<boolean>(true); 
  
  const numberOfPlayersFromProps = initialSettings.numberOfPlayers;

  useEffect(() => {
    if (initialSettings) {
        setSessionHours(initialSettings.totalSessionTimeHours !== undefined ? initialSettings.totalSessionTimeHours : 1);
        setSessionMinutes(initialSettings.totalSessionTimeMinutes !== undefined ? initialSettings.totalSessionTimeMinutes : 0);
        setSessionTimeError(null); 
        
        setNumRounds(initialSettings.numberOfRounds && initialSettings.numberOfRounds >= 1 ? initialSettings.numberOfRounds : 1);
        setNumRoundsError(null); 
        
        setCarryOverTime(initialSettings.carryOverUnusedTime !== undefined ? initialSettings.carryOverUnusedTime : true); 
        setPayOverdueTime(initialSettings.payOverdueWithUnusedRoundTime !== undefined ? initialSettings.payOverdueWithUnusedRoundTime : true);
    }
  }, [initialSettings]); 

  const handleSessionTimeChange = useCallback((hours: number, minutes: number, error: string | null) => {
    setSessionHours(hours);
    setSessionMinutes(minutes);
    setSessionTimeError(error);
  }, []);

  const handleNumRoundsChange = useCallback((value: number, error: string | null) => {
    setNumRounds(value);
    setNumRoundsError(error);
  }, []);

  const estimatedTimePerPlayerPerRound = useMemo(() => {
    if (!sessionTimeError && !numRoundsError && numberOfPlayersFromProps > 0 && numRounds > 0) {
      const totalSessionSeconds = (sessionHours * 3600) + (sessionMinutes * 60);
      if (totalSessionSeconds > 0) {
        return Math.floor(totalSessionSeconds / numberOfPlayersFromProps / numRounds);
      }
    }
    return 0;
  }, [sessionHours, sessionMinutes, sessionTimeError, numberOfPlayersFromProps, numRounds, numRoundsError]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (sessionTimeError || numRoundsError) {
      return;
    }
    
    if (sessionHours === 0 && sessionMinutes === 0) {
        setSessionTimeError("Total session time must be at least 1 minute.");
        return;
    }

    const timeSettingsToSave: Omit<GameSettings, 'numberOfPlayers'> = {
        totalSessionTimeHours: sessionHours,
        totalSessionTimeMinutes: sessionMinutes,
        numberOfRounds: numRounds,
        carryOverUnusedTime: numRounds > 1 ? carryOverTime : false, 
        payOverdueWithUnusedRoundTime: numRounds > 1 ? payOverdueTime : false,
    };
    await playNavigateForwardSound();
    onSaveSettings(timeSettingsToSave);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-100 to-indigo-100">
      <AppHeader />
      <main className="flex-grow flex flex-col items-center justify-start pt-6 sm:pt-10 pb-8 px-4 w-full">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-lg space-y-6">
          <header className="text-center mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-indigo-700">Configure Game Time</h1>
              <p className="text-md text-slate-600 mt-1">
                  For {numberOfPlayersFromProps} player{numberOfPlayersFromProps !== 1 ? 's' : ''}.
              </p>
          </header>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 border border-slate-200 rounded-lg space-y-4 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-indigo-600">
                Session Duration & Rounds
              </h2>
              
              <SessionTimeInput
                id="sessionTimeAdv"
                label="Total Session Time (HH:MM or H)"
                initialHours={sessionHours}
                initialMinutes={sessionMinutes}
                onTimeChange={handleSessionTimeChange}
                placeholder="e.g., 01:30 or 2"
              />
              
              <RoundsInput // Changed component
                id="numRounds"
                initialValue={numRounds}
                onValueChange={handleNumRoundsChange}
              />
              
              {numRounds > 1 && (
                <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="carryOverTime"
                            checked={carryOverTime}
                            onChange={(e) => setCarryOverTime(e.target.checked)}
                            className="h-4 w-4 bg-white text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                            style={{ colorScheme: 'light' }}
                        />
                        <label htmlFor="carryOverTime" className="text-sm font-medium text-slate-700">
                            Carry over unused round time to next round
                        </label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="payOverdueTime"
                            checked={payOverdueTime}
                            onChange={(e) => setPayOverdueTime(e.target.checked)}
                            className="h-4 w-4 bg-white text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                            style={{ colorScheme: 'light' }}
                        />
                        <label htmlFor="payOverdueTime" className="text-sm font-medium text-slate-700">
                            Use unused round time to pay off accumulated overdue
                        </label>
                    </div>
                </div>
              )}


              {estimatedTimePerPlayerPerRound > 0 && !sessionTimeError && !numRoundsError && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-center">
                  <p className="text-sm text-indigo-600">Approx. Time per Player per Round:</p>
                  <TimerDisplay timeInSeconds={estimatedTimePerPlayerPerRound} className="text-xl font-semibold text-indigo-700" />
                  </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="button" onClick={onBackToPlayerCount} variant="secondary" className="w-full sm:w-auto">
                Back
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                className="w-full sm:flex-grow py-3 text-lg bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                disabled={!!sessionTimeError || !!numRoundsError}
              >
                Next: Set Player Names
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

export default TimeConfigScreen;