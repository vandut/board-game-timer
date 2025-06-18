
import React, { useState, useCallback, useEffect } from 'react';
import PlayerCountScreen from './components/PlayerCountScreen';
import TimeConfigScreen from './components/TimeConfigScreen';
import PlayerNameScreen from './components/PlayerNameScreen';
import GameScreen from './components/GameScreen';
import { Player, GameSettings } from './types';

// Define a type for the settings passed to TimeConfigScreen for initialization
type TimeConfigInitialSettings = Partial<Omit<GameSettings, 'numberOfPlayers'>> & {
  numberOfPlayers: number;
  carryOverUnusedTime?: boolean; 
  payOverdueWithUnusedRoundTime?: boolean; // Ensure this is part of the type
};


const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'playerCount' | 'timeConfig' | 'playerNames' | 'game'>('playerCount');
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
  
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(0); 
  const [sessionTimeOverdue, setSessionTimeOverdue] = useState<number>(0); 

  const [currentRound, setCurrentRound] = useState<number>(1);
  const [totalGameTimeElapsed, setTotalGameTimeElapsed] = useState<number>(0);
  
  const [pendingTimeConfigSettings, setPendingTimeConfigSettings] = useState<TimeConfigInitialSettings | null>(null);

  const handleResetGame = useCallback(() => {
    setCurrentScreen('playerCount');
    setGameSettings(null);
    setPlayers([]);
    setActivePlayerId(null);
    setSessionTimeRemaining(0);
    setSessionTimeOverdue(0);
    setCurrentRound(1);
    setTotalGameTimeElapsed(0);
    setPendingTimeConfigSettings(null);
  }, []);

  const initializePlayers = useCallback((settings: GameSettings) => {
    const totalSessionSeconds = (settings.totalSessionTimeHours * 3600) + (settings.totalSessionTimeMinutes * 60);
    
    let playerTotalTimeAllocated = 0;
    if (settings.numberOfPlayers > 0) {
      playerTotalTimeAllocated = Math.floor(totalSessionSeconds / settings.numberOfPlayers);
    } else {
      playerTotalTimeAllocated = totalSessionSeconds; 
    }

    let playerRoundTimeAllocated = 0;
    if (settings.numberOfPlayers > 0 && settings.numberOfRounds > 0) {
      playerRoundTimeAllocated = Math.floor(totalSessionSeconds / settings.numberOfPlayers / settings.numberOfRounds);
    } else if (settings.numberOfPlayers > 0) { 
      playerRoundTimeAllocated = playerTotalTimeAllocated;
    } else {
        playerRoundTimeAllocated = totalSessionSeconds / (settings.numberOfRounds > 0 ? settings.numberOfRounds : 1);
    }

    const newPlayers: Player[] = Array.from({ length: settings.numberOfPlayers }, (_, i) => {
      return {
        id: i + 1,
        name: `Player ${i + 1}`,
        timeAllocated: playerTotalTimeAllocated,
        timeRemaining: playerTotalTimeAllocated,
        roundTimeAllocated: playerRoundTimeAllocated,
        roundTimeRemaining: playerRoundTimeAllocated,
        accumulatedOverdueTime: 0, 
      };
    });
    setPlayers(newPlayers);
  }, []);


  const handleProceedToTimeConfig = useCallback((numPlayers: number) => {
    if (gameSettings && gameSettings.numberOfPlayers === numPlayers) {
        // If returning to config with same player count, use existing game settings
        setPendingTimeConfigSettings({ 
            ...gameSettings,
            // Ensure these are explicitly carried over or defaulted if somehow missing in gameSettings
            carryOverUnusedTime: gameSettings.carryOverUnusedTime !== undefined ? gameSettings.carryOverUnusedTime : true,
            payOverdueWithUnusedRoundTime: gameSettings.payOverdueWithUnusedRoundTime !== undefined ? gameSettings.payOverdueWithUnusedRoundTime : true,
        }); 
    } else {
        // New configuration or different player count
        setPendingTimeConfigSettings({ 
            numberOfPlayers: numPlayers,
            totalSessionTimeHours: 1, 
            totalSessionTimeMinutes: 0,
            numberOfRounds: 1,
            carryOverUnusedTime: true, // Default to true for new setup
            payOverdueWithUnusedRoundTime: true, // Default to true for new setup
        });
    }
    setCurrentScreen('timeConfig');
  }, [gameSettings]);


  const handleBackToPlayerCount = useCallback(() => { 
    setCurrentScreen('playerCount');
  }, []);

  const handleSaveTimeSettings = useCallback((timeSettings: Omit<GameSettings, 'numberOfPlayers'>) => {
    if (!pendingTimeConfigSettings || pendingTimeConfigSettings.numberOfPlayers === undefined) {
      console.error("Error: Number of players is missing in pending settings.");
      handleResetGame(); 
      return;
    }
    
    const numRounds = timeSettings.numberOfRounds || 1;

    const completeGameSettings: GameSettings = {
      ...timeSettings,
      numberOfPlayers: pendingTimeConfigSettings.numberOfPlayers,
      // If only 1 round, these features are off, otherwise use the passed value or default to true
      carryOverUnusedTime: numRounds > 1 ? (timeSettings.carryOverUnusedTime !== undefined ? timeSettings.carryOverUnusedTime : true) : false,
      payOverdueWithUnusedRoundTime: numRounds > 1 ? (timeSettings.payOverdueWithUnusedRoundTime !== undefined ? timeSettings.payOverdueWithUnusedRoundTime : true) : false,
    };
    setGameSettings(completeGameSettings);
    initializePlayers(completeGameSettings);
    setCurrentScreen('playerNames');
  }, [pendingTimeConfigSettings, initializePlayers, handleResetGame]);
  

  const handleConfirmPlayerNamesAndStartGame = useCallback((customizedPlayers: Player[]) => {
    setPlayers(customizedPlayers); 
    if (gameSettings) {
      const totalSessionSeconds = (gameSettings.totalSessionTimeHours * 3600) + (gameSettings.totalSessionTimeMinutes * 60);
      setSessionTimeRemaining(totalSessionSeconds);
      setSessionTimeOverdue(0); 
      setCurrentRound(1);
      setTotalGameTimeElapsed(0);
    } else {
      setSessionTimeRemaining(0); 
      setSessionTimeOverdue(0);
      setCurrentRound(1);
      setTotalGameTimeElapsed(0);
    }
    setActivePlayerId(null);
    setCurrentScreen('game');
  }, [gameSettings]);
  
  const handleBackToTimeConfigFromPlayerNames = useCallback(() => {
    if (!gameSettings) {
      console.error("Game settings not found when going back to time config.");
      handleResetGame(); 
      return;
    }
    setPendingTimeConfigSettings({ 
        ...gameSettings,
        // Ensure these are explicitly carried over or defaulted
        carryOverUnusedTime: gameSettings.carryOverUnusedTime !== undefined ? gameSettings.carryOverUnusedTime : true,
        payOverdueWithUnusedRoundTime: gameSettings.payOverdueWithUnusedRoundTime !== undefined ? gameSettings.payOverdueWithUnusedRoundTime : true,
    }); 
    setCurrentScreen('timeConfig');
  }, [gameSettings, handleResetGame]);

  const handlePlayerSelect = useCallback((playerId: number) => {
    setActivePlayerId(prevActiveId => (prevActiveId === playerId ? null : playerId));
  }, []);
  
  const handlePlayerActiveTick = useCallback((playerId: number) => {
    if (activePlayerId !== playerId) return;

    setTotalGameTimeElapsed(t => t + 1);

    const playerStateBeforeTick = players.find(p => p.id === playerId);
    if (!playerStateBeforeTick) return;

    const willBeRoundOverdue = (playerStateBeforeTick.roundTimeRemaining - 1) < 0;

    if (!willBeRoundOverdue) {
      if (sessionTimeRemaining > 0) {
        setSessionTimeRemaining(r => Math.max(0, r - 1));
      }
    }

    setPlayers(prevPlayers =>
      prevPlayers.map(p => {
        if (p.id === playerId) {
          const newRoundTimeRemaining = p.roundTimeRemaining - 1;
          let newAccumulatedOverdue = p.accumulatedOverdueTime;
          let newOverallTimeRemaining = p.timeRemaining;

          if (newRoundTimeRemaining < 0) { 
            newAccumulatedOverdue += 1;
          } else { 
            // Only decrement overall time if not going into round overdue
            // And if overall time remaining is positive
            if (newOverallTimeRemaining > 0) {
              newOverallTimeRemaining -= 1; 
            }
          }
          return {
            ...p,
            roundTimeRemaining: newRoundTimeRemaining,
            timeRemaining: newOverallTimeRemaining,
            accumulatedOverdueTime: newAccumulatedOverdue,
          };
        }
        return p;
      })
    );
  }, [activePlayerId, players, sessionTimeRemaining]);

  useEffect(() => {
    const totalOverdue = players.reduce((sum, player) => sum + player.accumulatedOverdueTime, 0);
    setSessionTimeOverdue(totalOverdue);
  }, [players]);


  const handleAdvanceRound = useCallback(() => {
    if (!gameSettings || currentRound >= gameSettings.numberOfRounds) return;

    let totalSessionTimeAdjustment = 0; // Tracks net change to sessionTimeRemaining

    const updatedPlayersData = players.map(p => {
      let currentUnusedRoundTime = p.roundTimeRemaining > 0 ? p.roundTimeRemaining : 0;
      let newAccumulatedOverdue = p.accumulatedOverdueTime;
      let newTimeRemaining = p.timeRemaining;
      let nextRoundTimeRemaining = p.roundTimeAllocated;

      // Step 1: Pay off overdue time if enabled
      if (gameSettings.payOverdueWithUnusedRoundTime && currentUnusedRoundTime > 0 && newAccumulatedOverdue > 0) {
        const timeToPayOverdue = Math.min(currentUnusedRoundTime, newAccumulatedOverdue);
        newAccumulatedOverdue -= timeToPayOverdue;
        currentUnusedRoundTime -= timeToPayOverdue; // This is now remaining unused time
        totalSessionTimeAdjustment -= timeToPayOverdue; // Time used to pay overdue is deducted from session
      }

      // Step 2: Handle remaining unused round time based on carry-over setting
      if (gameSettings.carryOverUnusedTime) {
        nextRoundTimeRemaining += currentUnusedRoundTime;
      } else {
        // Unused time is lost
        if (currentUnusedRoundTime > 0) {
          newTimeRemaining -= currentUnusedRoundTime; 
          totalSessionTimeAdjustment -= currentUnusedRoundTime; 
        }
      }
      
      return {
        ...p,
        timeRemaining: newTimeRemaining,
        accumulatedOverdueTime: newAccumulatedOverdue,
        roundTimeRemaining: nextRoundTimeRemaining,
      };
    });
    
    setSessionTimeRemaining(prev => Math.max(0, prev + totalSessionTimeAdjustment)); 
    setPlayers(updatedPlayersData);
    setCurrentRound(prev => prev + 1);
    setActivePlayerId(null); 
  }, [gameSettings, currentRound, players]);


  if (currentScreen === 'playerCount') {
    return <PlayerCountScreen 
              onProceedToTimeConfig={handleProceedToTimeConfig}
           />;
  }
  
  if (currentScreen === 'timeConfig' && pendingTimeConfigSettings) {
    return <TimeConfigScreen 
              onSaveSettings={handleSaveTimeSettings} 
              onBackToPlayerCount={handleBackToPlayerCount}
              initialSettings={pendingTimeConfigSettings} 
           />;
  }

  if (currentScreen === 'playerNames' && gameSettings) {
    return (
      <PlayerNameScreen
        initialPlayers={players} 
        onConfirm={handleConfirmPlayerNamesAndStartGame}
        onBack={handleBackToTimeConfigFromPlayerNames}
        gameSettings={gameSettings}
      />
    );
  }

  if (currentScreen === 'game' && gameSettings && players.length > 0) {
    return (
      <GameScreen
        gameSettings={gameSettings}
        players={players} 
        activePlayerId={activePlayerId} 
        sessionTimeRemaining={sessionTimeRemaining}
        sessionTimeOverdue={sessionTimeOverdue} 
        currentRound={currentRound}
        totalGameTimeElapsed={totalGameTimeElapsed}
        onPlayerSelect={handlePlayerSelect}
        onResetGame={handleResetGame}
        onPlayerActiveTick={handlePlayerActiveTick} 
        onAdvanceRound={(gameSettings.numberOfRounds > 1) ? handleAdvanceRound : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-xl text-red-500 p-4 text-center">
      Error: Invalid application state. Game settings or players might be missing. Please <button onClick={handleResetGame} className="underline text-sky-600 hover:text-sky-800">reset the application</button>.
    </div>
  );
};

export default App;
