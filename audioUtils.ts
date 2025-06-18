// audioUtils.ts
export const playSound = (soundFile: string): void => {
  try {
    const audio = new Audio(soundFile);
    audio.play().catch(error => {
      // Log errors, but don't block UI or app flow
      console.warn(`Audio playback failed for ${soundFile}: ${error.name} - ${error.message}`);
    });
  } catch (error: any) { // Catch unknown error type for broader compatibility
    console.warn(`Failed to initialize or play audio ${soundFile}: ${error.name} - ${error.message}`);
  }
};
