import React, { useState, useMemo, useRef, useEffect } from 'react';
import { GameSettings } from '../../types';
import Button from '../../components/Button';
import TimerDisplay from '../../components/TimerDisplay';
import AppHeader from '../../components/AppHeader'; 
import { playNavigateForwardSound } from '../../audioUtils';

// Helper function to parse and validate HH:MM time string
const parseTimeInput = (timeValue: string): { majorUnit: number; minorUnit: number; isValid: boolean; error?: string; formatted?: string } => {
  const trimmedTimeValue = timeValue.trim();
  if (trimmedTimeValue === "") {
    return { majorUnit: 0, minorUnit: 0, isValid: false, error: "Time cannot be empty." };
  }

  const timeRegex = /^(\d{1,2}):(\d{1,2})$/; // HH:MM
  let match = trimmedTimeValue.match(timeRegex);
  let majorUnit: number; // Hours
  let minorUnit: number; // Minutes

  if (match) {
    majorUnit = parseInt(match[1], 10);
    minorUnit = parseInt(match[2], 10);
  } else if (/^\d+$/.test(trimmedTimeValue)) { // Single number as Hours
    majorUnit = parseInt(trimmedTimeValue, 10);
    minorUnit = 0;
  } else {
    const formatHint = "HH:MM or H (e.g., 01:30 or 2 for hours)";
    return { majorUnit: 0, minorUnit: 0, isValid: false, error: `Invalid format. Use ${formatHint}.` };
  }

  if (isNaN(majorUnit) || isNaN(minorUnit)) {
    return { majorUnit: 0, minorUnit: 0, isValid: false, error: "Invalid number conversion." };
  }

  if (majorUnit < 0 || majorUnit > 99) {
    return { majorUnit, minorUnit, isValid: false, error: 'Hours must be between 0 and 99.' };
  }
  if (minorUnit < 0 || minorUnit > 59) {
    return { majorUnit, minorUnit, isValid: false, error: 'Minutes must be between 0 and 59.' };
  }

  // Total time represented by HH:MM must be at least 1 minute. "00:00" is 0 seconds.
  if (majorUnit === 0 && minorUnit === 0) {
    return { majorUnit, minorUnit, isValid: false, error: "Smallest time is 1 minute (00:01) with current format." };
  }

  const formattedMajor = String(majorUnit).padStart(2, '0');
  const formattedMinor = String(minorUnit).padStart(2, '0');

  return { majorUnit, minorUnit, isValid: true, formatted: `${formattedMajor}:${formattedMinor}` };
};


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
  const [sessionTimeString, setSessionTimeString] = useState<string>("01:00");
  const [sessionTimeError, setSessionTimeError] = useState<string | null>(null);
  const sessionTimeInputRef = useRef<HTMLInputElement>(null);
  
  const [actualNumRounds, setActualNumRounds] = useState<number>(1);
  const [numRoundsDisplayValue, setNumRoundsDisplayValue] = useState<string>("1");
  const numRoundsInputRef = useRef<HTMLInputElement>(null); // Ref for num rounds input

  const [carryOverTime, setCarryOverTime] = useState<boolean>(true); 
  const [payOverdueTime, setPayOverdueTime] = useState<boolean>(true); 
  const [formErrors, setFormErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialSettings) {
        const initialHours = initialSettings.totalSessionTimeHours !== undefined ? initialSettings.totalSessionTimeHours : 1;
        const initialMinutes = initialSettings.totalSessionTimeMinutes !== undefined ? initialSettings.totalSessionTimeMinutes : 0;
        
        let targetInitialTimeString: string;
        if (initialSettings.totalSessionTimeHours === undefined && initialSettings.totalSessionTimeMinutes === undefined) {
            targetInitialTimeString = "01:00";
        } else {
            targetInitialTimeString = `${String(initialHours).padStart(2, '0')}:${String(initialMinutes).padStart(2,'0')}`;
        }
        
        const validationResult = parseTimeInput(targetInitialTimeString);
        if (validationResult.isValid && validationResult.formatted) {
            setSessionTimeString(validationResult.formatted);
            setSessionTimeError(null);
        } else {
            setSessionTimeString("01:00");
            setSessionTimeError(null); 
        }
        
        const initialRounds = initialSettings.numberOfRounds && initialSettings.numberOfRounds >= 1 ? initialSettings.numberOfRounds : 1;
        setActualNumRounds(initialRounds);
        setNumRoundsDisplayValue(String(initialRounds));
        
        setCarryOverTime(initialSettings.carryOverUnusedTime !== undefined ? initialSettings.carryOverUnusedTime : true); 
        setPayOverdueTime(initialSettings.payOverdueWithUnusedRoundTime !== undefined ? initialSettings.payOverdueWithUnusedRoundTime : true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSettings]); 


  const parsedSessionTime = useMemo(() => parseTimeInput(sessionTimeString), [sessionTimeString]);
  
  const numberOfPlayersFromProps = initialSettings.numberOfPlayers;

  const estimatedTimePerPlayerPerRound = useMemo(() => {
    if (parsedSessionTime.isValid && numberOfPlayersFromProps > 0 && actualNumRounds > 0) {
      const totalSessionSeconds = (parsedSessionTime.majorUnit * 3600) + (parsedSessionTime.minorUnit * 60);
      if (totalSessionSeconds > 0) {
        return Math.floor(totalSessionSeconds / numberOfPlayersFromProps / actualNumRounds);
      }
    }
    return 0;
  }, [parsedSessionTime, numberOfPlayersFromProps, actualNumRounds]);


  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/[^0-9:]/g, ''); 
    const colonCount = (value.match(/:/g) || []).length;
    if (colonCount > 1) { 
      const firstColonIndex = value.indexOf(':');
      value = value.substring(0, firstColonIndex + 1) + value.substring(firstColonIndex + 1).replace(/:/g, '');
    }
    
    if (value.length > 5) { 
        value = value.substring(0, 5);
    }

    setSessionTimeString(value);
    if (value.trim() !== "") setSessionTimeError(null); 
    setFormErrors([]); 
  };

  const handleTimeInputBlur = () => {
    const validationResult = parseTimeInput(sessionTimeString);
    if (validationResult.isValid && validationResult.formatted) {
      setSessionTimeString(validationResult.formatted);
      setSessionTimeError(null);
    } else {
      setSessionTimeError(validationResult.error || "Invalid time.");
    }
  };
  
  const handleClearTimeInput = () => {
    setSessionTimeString(''); 
    setSessionTimeError(null); 
    setFormErrors([]);
    if (sessionTimeInputRef.current) sessionTimeInputRef.current.focus();
  };

  const handleNumRoundsDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const filteredValue = inputValue.replace(/[^0-9]/g, ''); // Allow only digits
    setNumRoundsDisplayValue(filteredValue);
    setFormErrors(prev => prev.filter(err => !err.toLowerCase().includes("rounds")));

    if (filteredValue === '') {
        setActualNumRounds(1); // Default for calculations if input is empty during typing
    } else {
        const parsed = parseInt(filteredValue, 10);
        if (!isNaN(parsed)) {
            if (parsed >= 1 && parsed <= 99) {
                setActualNumRounds(parsed);
            } else if (parsed > 99) {
                setActualNumRounds(99); // Cap for immediate calculation use
            } else { // parsed < 1
                setActualNumRounds(1); // Default for calculations
            }
        } else { // Should not happen with regex filter, but as a fallback
            setActualNumRounds(1);
        }
    }
  };

  const handleNumRoundsBlur = () => {
    let val = parseInt(numRoundsDisplayValue, 10);
    if (isNaN(val) || val < 1) {
        val = 1;
    } else if (val > 99) {
        val = 99;
    }
    setActualNumRounds(val);
    setNumRoundsDisplayValue(String(val)); // Format input field on blur
    setFormErrors(prev => prev.filter(err => !err.toLowerCase().includes("rounds")));
  };

  const handleClearNumRoundsInput = () => {
    setNumRoundsDisplayValue('');
    setActualNumRounds(1); // Default to 1 when cleared
    setFormErrors(prev => prev.filter(err => !err.toLowerCase().includes("rounds")));
    if (numRoundsInputRef.current) {
        numRoundsInputRef.current.focus();
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let isValidForm = true;
    let currentFormErrors: string[] = [];

    handleTimeInputBlur(); 
    if (sessionTimeError || !parseTimeInput(sessionTimeString).isValid) {
        const currentValidation = parseTimeInput(sessionTimeString);
        if(!currentValidation.isValid) {
            setSessionTimeError(currentValidation.error || "Invalid session time.");
        }
        isValidForm = false;
    }
    
    // Ensure numRoundsDisplayValue is validated on submit (blur logic should handle it, but defensive)
    handleNumRoundsBlur();
    if (actualNumRounds < 1 || actualNumRounds > 99) { // Check actualNumRounds
        currentFormErrors.push("Number of rounds must be between 1 and 99.");
        isValidForm = false;
    }
    
    setFormErrors(currentFormErrors);

    if (isValidForm) {
      const finalParsedTime = parseTimeInput(sessionTimeString); 
      if (finalParsedTime.isValid) { 
        const timeSettingsToSave: Omit<GameSettings, 'numberOfPlayers'> = {
            totalSessionTimeHours: finalParsedTime.majorUnit,
            totalSessionTimeMinutes: finalParsedTime.minorUnit,
            numberOfRounds: actualNumRounds, // Use actualNumRounds
            carryOverUnusedTime: actualNumRounds > 1 ? carryOverTime : false, 
            payOverdueWithUnusedRoundTime: actualNumRounds > 1 ? payOverdueTime : false,
        };
        await playNavigateForwardSound();
        onSaveSettings(timeSettingsToSave);
      } else {
        setSessionTimeError(finalParsedTime.error || "Double check session time.");
      }
    }
  };
  
  const numRoundsError = formErrors.find(err => err.toLowerCase().includes("rounds"));


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
              <div>
                <label htmlFor="sessionTimeAdv" className="block mb-1 text-sm font-medium text-slate-600">
                  Total Session Time (HH:MM or H)
                </label>
                <div className="relative w-full">
                <input
                    ref={sessionTimeInputRef}
                    type="text" 
                    id="sessionTimeAdv"
                    value={sessionTimeString}
                    onChange={handleTimeInputChange}
                    onBlur={handleTimeInputBlur}
                    placeholder="e.g., 01:30 or 2"
                    className={`p-3 pr-10 border rounded-lg shadow-sm focus:ring-2 focus:border-indigo-500 outline-none transition-colors w-full bg-white text-slate-900 placeholder-slate-400 ${
                    sessionTimeError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                    style={{ colorScheme: 'light' }}
                    required
                    aria-describedby="session-time-error-adv"
                />
                {sessionTimeString && (
                    <button type="button" onClick={handleClearTimeInput}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl font-sans"
                    aria-label="Clear session time"
                    tabIndex={-1} 
                    >&#x2715;</button> 
                )}
                </div>
                {sessionTimeError && <p id="session-time-error-adv" className="mt-1 text-xs text-red-600">{sessionTimeError}</p>}
              </div>
              
              <div>
                <label htmlFor="numRounds" className="block mb-1 text-sm font-medium text-slate-600">
                  Number of Rounds (1-99)
                </label>
                <div className="relative w-full">
                  <input
                    ref={numRoundsInputRef}
                    type="text" 
                    id="numRounds"
                    value={numRoundsDisplayValue}
                    onChange={handleNumRoundsDisplayChange}
                    onBlur={handleNumRoundsBlur}
                    placeholder="1-99"
                    className={`p-3 pr-10 border rounded-lg shadow-sm focus:ring-2 focus:border-indigo-500 outline-none transition-colors w-full bg-white text-slate-900 placeholder-slate-400 ${
                      numRoundsError ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'
                    }`}
                    style={{ colorScheme: 'light' }}
                    required
                    aria-describedby="num-rounds-error"
                    maxLength={2} // Max 2 digits for 1-99
                  />
                  {numRoundsDisplayValue && (
                    <button
                      type="button"
                      onClick={handleClearNumRoundsInput}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl font-sans"
                      aria-label="Clear number of rounds"
                      tabIndex={-1}
                    >&#x2715;</button> 
                  )}
                </div>
                {numRoundsError && <p id="num-rounds-error" className="mt-1 text-xs text-red-600">{numRoundsError}</p>}
              </div>
              
              {actualNumRounds > 1 && (
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
            
            {formErrors.length > 0 && !numRoundsError && formErrors.filter(err => !err.toLowerCase().includes("rounds")).length > 0 && (
              <div className="text-xs text-red-600 space-y-1 p-2 bg-red-50 border border-red-200 rounded-md">
                <p className="font-medium">Please correct the following:</p>
                {formErrors.filter(err => !err.toLowerCase().includes("rounds")).map((err, idx) => <p key={idx}>- {err}</p>)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="button" onClick={onBackToPlayerCount} variant="secondary" className="w-full sm:w-auto">
                Back
              </Button>
              <Button type="submit" variant="primary" className="w-full sm:flex-grow py-3 text-lg bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500">
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
