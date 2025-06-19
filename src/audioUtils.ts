// Generic sound playing function
export const playSound = (soundFile: string, delayMs?: number): Promise<void> => {
  try {
    const audio = new Audio(soundFile);
    audio.play().catch(error => {
      // Log errors related to playback, but don't block UI or app flow
      // Common errors: NotAllowedError (user hasn't interacted), NotSupportedError
      console.warn(`Audio playback failed for ${soundFile}: ${error.name} - ${error.message}`);
    });
  } catch (error: any) { 
    // Catch errors related to new Audio() e.g. if soundFile is invalid or network error
    console.warn(`Failed to initialize audio for ${soundFile}: ${error.name} - ${error.message}`);
  }

  if (delayMs && delayMs > 0) {
    return new Promise(resolve => setTimeout(resolve, delayMs));
  } else {
    return Promise.resolve();
  }
};

// Specific sound for forward navigation
export const playNavigateForwardSound = (): Promise<void> => {
  return playSound('/board-game-timer/sounds/navigate_forward.mp3', 100);
};