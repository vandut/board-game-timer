
# Board Game Timer: Application Requirements

## 1. Introduction / App Purpose

The "Board Game Timer" is a web application designed to manage and track time for multiple players during board game sessions. It aims to provide a flexible and user-friendly experience for various game setups.

Key objectives include:
- Supporting multiple players with individual timers.
- Allowing configuration of total session duration and division across multiple rounds.
- Tracking player time per round and overall session time.
- Managing "overdue time" when players exceed their allocated time.
- Offering optional features like carrying over unused round time and using unused time to pay off overdue balances.
- Ensuring responsive design for various screen sizes.
- Adhering to accessibility best practices.

## 2. Core Concepts

### 2.1. Timers Explained

The application utilizes several timers to manage game flow:

*   **Player's Round Time (`player.roundTimeRemaining`):**
    *   **Purpose:** Time allocated to an individual player for the current game round.
    *   **Behavior:** Decrements by 1 second each second the player is active. Can become negative if the player exceeds their allocated time for the round.
    *   **Initialization:** Calculated based on total session time, number of players, and number of rounds: `floor(TotalSessionSeconds / NumberOfPlayers / NumberOfRounds)`.
    *   **End of Round:** Behavior depends on game settings (see "Carrying Over Unused Time" and "Paying Off Overdue Time").

*   **Player's Total Session Time (`player.timeRemaining`):**
    *   **Purpose:** Represents the player's total share of the game's session time, across all rounds.
    *   **Behavior:** Decrements by 1 second each second the player is active, *provided* their `roundTimeRemaining` is positive. If `roundTimeRemaining` is negative, this timer does not decrement further for that tick. It can also be reduced if unused round time is not carried over at the end of a round.
    *   **Initialization:** Calculated as: `floor(TotalSessionSeconds / NumberOfPlayers)`.

*   **Overall Session Time Remaining (`sessionTimeRemaining`):**
    *   **Purpose:** The total time initially configured for the entire game session.
    *   **Behavior:** Decrements by 1 second each second an active player has positive `roundTimeRemaining`. It can also be reduced at the end of a round if unused round time is not carried over, or if it's used to pay off overdue time. The game does not automatically end when this reaches zero.
    *   **Initialization:** Set by the user during time configuration.

*   **Total Game Time Elapsed (`totalGameTimeElapsed`):**
    *   **Purpose:** Tracks the cumulative real-world time the game has been actively played (i.e., at least one player's timer is running).
    *   **Behavior:** Increments by 1 second each second any player's timer is active. Pauses when no player is active.
    *   **Initialization:** Starts at 0 when the Game Screen is first entered.

### 2.2. Overdue Time

*   **Player's Accumulated Overdue Time (`player.accumulatedOverdueTime`):**
    *   **Purpose:** Tracks the total amount of time a player has gone over their allocated `roundTimeRemaining`.
    *   **Behavior:** Increments by 1 second each second an active player's `roundTimeRemaining` is negative. This sum persists across rounds unless paid off.
    *   **Initialization:** 0 for each player at the start of the game.

*   **Session Total Overdue Time (`sessionTimeOverdue`):**
    *   **Purpose:** A global display showing the sum of all players' `accumulatedOverdueTime`.
    *   **Behavior:** Dynamically updates as individual players' overdue times change.

### 2.3. Paying Off Overdue Time

*   **Setting:** `gameSettings.payOverdueWithUnusedRoundTime` (boolean).
*   **Purpose:** If enabled (and the game has more than one round), allows players to use any positive `roundTimeRemaining` from a completed round to reduce their `accumulatedOverdueTime`.
*   **Behavior:** At the end of a round (when "Advance Round" is triggered):
    *   The amount of unused round time applied to pay off overdue time is subtracted from both the player's `accumulatedOverdueTime` and their remaining unused round time.
    *   This "spent" time is also deducted from the `sessionTimeRemaining`.

### 2.4. Carrying Over Unused Time

*   **Setting:** `gameSettings.carryOverUnusedTime` (boolean).
*   **Purpose:** If enabled (and the game has more than one round), any positive `roundTimeRemaining` a player has at the end of a round is added to their allocated time for the next round.
*   **Behavior:** At the end of a round:
    *   **If enabled:** `nextRoundTimeRemaining = player.roundTimeAllocated + remainingUnusedRoundTime`.
    *   **If disabled:** The `remainingUnusedRoundTime` is "lost." It is subtracted from the player's `player.timeRemaining` and also from the global `sessionTimeRemaining`.

### 2.5. Rounds

*   **Setting:** `gameSettings.numberOfRounds` (1-99).
*   **Purpose:** Defines how many rounds the game session will have.
*   **Behavior:**
    *   **Single Round (`numberOfRounds` = 1):**
        *   The "Advance Round" button is not available.
        *   "Carry Over Unused Time" and "Pay Overdue With Unused Round Time" features are effectively disabled.
        *   Status messages refer to "TIME UP" instead of "ROUND OVER TIME."
    *   **Multiple Rounds (`numberOfRounds` > 1):**
        *   All round-based mechanics (advancing, carry-over, pay overdue) are functional as configured.

## 3. Application Screens and Flows

A consistent **App Header** displaying "Board Game Timer" is present on the Player Count, Time Configuration, and Player Name screens. (Component: `components/AppHeader.tsx`)

### 3.1. Player Count Screen

*   **Component:** `components/PlayerCountScreen.tsx`
*   **Purpose:** To set the number of players for the game. This is the first screen in the setup process.
*   **Inputs & Validations:**
    *   **Number of Players:**
        *   Input Type: Text field allowing numeric input.
        *   Range: 1 to 16.
        *   Validation: Must be a whole number within the specified range. Error messages guide the user if input is invalid (e.g., "Number of players must be at least 1," "Number of players cannot exceed 16.").
        *   Visual cue: Input field border may change (e.g., to red) on invalid input.
        *   Input includes a clear button (✕) if text is present.
*   **Actions & Navigation:**
    *   **"Next: Configure Time" Button:**
        *   Action: Submits the entered number of players.
        *   Navigation: If validation passes, proceeds to the Time Configuration Screen, passing along the number of players.
*   **Footer:** Displays a copyright notice with the current year.

### 3.2. Time Configuration Screen

*   **Component:** `components/TimeConfigScreen.tsx`
*   **Purpose:** To configure the total session duration, number of rounds, and advanced round-based time rules.
*   **Displayed Information (from previous screen):**
    *   Number of players selected.
*   **Inputs & Validations:**
    *   **Total Session Time:**
        *   Input Type: Text field for HH:MM or H (hours) format (e.g., "01:30" or "2").
        *   Validation: Must represent a valid time from 00:01 (1 minute) up to 99 hours and 59 minutes. Error messages guide on format and range. Input includes a clear button (✕).
    *   **Number of Rounds:**
        *   Input Type: Text field allowing numeric input.
        *   Range: 1 to 99.
        *   Validation: Must be a whole number within this range. Error messages guide the user. Input includes a clear button (✕).
    *   **Carry over unused round time (Checkbox):**
        *   Visibility: Only shown if "Number of Rounds" is greater than 1.
        *   Default: Checked (true).
    *   **Use unused round time to pay off accumulated overdue (Checkbox):**
        *   Visibility: Only shown if "Number of Rounds" is greater than 1.
        *   Default: Checked (true).
*   **Displayed Information (Calculated):**
    *   **Approx. Time per Player per Round:** Dynamically calculated and displayed if inputs are valid, giving users an estimate of individual turn times.
*   **Actions & Navigation:**
    *   **"Back" Button:**
        *   Action: Discards current time configurations.
        *   Navigation: Returns to the Player Count Screen.
    *   **"Next: Set Player Names" Button:**
        *   Action: Submits all configured time settings.
        *   Navigation: If all validations pass, proceeds to the Player Name Screen, passing along the complete game settings.
*   **Footer:** Displays a copyright notice.

### 3.3. Player Name Screen

*   **Component:** `components/PlayerNameScreen.tsx`
*   **Purpose:** To allow users to enter custom names for each player.
*   **Displayed Information (from previous screen/settings):**
    *   A summary of the game settings: total session duration, number of rounds, number of players, and status of carry-over/pay-overdue features.
*   **Inputs & Validations:**
    *   **Player Name (one input field per player):**
        *   Input Type: Text field.
        *   Default: Pre-filled with "Player X" (e.g., "Player 1", "Player 2").
        *   Validation: Player names cannot be empty. An alert/message will appear if submitted with empty names. Max length of 50 characters.
        *   Each input includes a clear button (✕) if text is present.
    *   The list of player name inputs is scrollable if it exceeds the available vertical space.
*   **Actions & Navigation:**
    *   **"Back" Button:**
        *   Action: Discards current player name entries.
        *   Navigation: Returns to the Time Configuration Screen, retaining previously set time configurations.
    *   **"Start Game Session" Button:**
        *   Action: Confirms player names and finalizes game setup. Initializes player objects with their calculated time allocations.
        *   Navigation: If all names are valid, proceeds to the Game Screen.
*   **Footer:** Displays a copyright notice.

### 3.4. Game Screen

*   **Component:** `components/GameScreen.tsx`
*   **Purpose:** The main interactive screen where gameplay and timers are active.
*   **Displayed Information (Header Section - Sticky):**
    *   **Round Indicator:** "Round X / Y" (e.g., "Round 1 / 5").
    *   **Total Game Time Elapsed:** Live display of total active game time.
    *   **Session Time Remaining:** Live display of the overall session time left.
    *   **Total Session Overdue:** Live display of the sum of all players' accumulated overdue times (shown if > 0).
    *   **Game Controls:** "Advance to Next Round" (if applicable) and "Reset Game" buttons.
*   **Displayed Information (Main Area - Player Timers):**
    *   A grid of **Player Timer Boxes**, one for each player. The number of columns in the grid adjusts responsively based on the number of players.
    *   Each **PlayerTimerBox (`components/PlayerTimerBox.tsx`)** displays:
        *   Player's Name.
        *   Player's Current Round Time Remaining: Large, prominent display. Color may change (e.g., to red) if time is negative/overdue.
        *   "(Current Round)" label below round time if multiple rounds.
        *   Status Text: e.g., "ROUND OVER TIME" or "TIME UP" if the player's round time is negative.
        *   Total Accumulated Overdue Time for that player (if > 0), shown in red.
    *   **Active Player Highlight:** The Player Timer Box of the currently active player is visually distinct (e.g., different background color, border).
*   **Player Interactions:**
    *   **Select/Deselect Player (Tap on PlayerTimerBox):**
        *   If no player is active: Tapping a player box makes them the active player and starts their timer.
        *   If a player is active:
            *   Tapping the *same* active player's box pauses their timer (no player becomes active).
            *   Tapping a *different* player's box makes the tapped player active, starts their timer, and implicitly pauses the previously active player.
*   **Game Controls (in Header Section):**
    *   **"Advance to Next Round" Button:**
        *   Visibility: Shown only if `numberOfRounds > 1` and `currentRound < gameSettings.numberOfRounds`.
        *   Action:
            *   Pauses any active player timer.
            *   Applies end-of-round logic for each player (pay overdue, carry-over time based on settings).
            *   Resets `roundTimeRemaining` for all players for the new round (incorporating any carried-over time).
            *   Increments `currentRound`.
            *   Sets `activePlayerId` to null (no player is active at the start of the new round).
    *   **"Reset Game" Button:**
        *   Action: Ends the current game session immediately. Clears all game state (timers, player data, settings).
        *   Navigation: Returns the user to the Player Count Screen.
*   **Timer Behaviors on this Screen:**
    *   When a player is active, their `roundTimeRemaining` decrements.
    *   If `roundTimeRemaining` is positive, `player.timeRemaining` and `sessionTimeRemaining` also decrement.
    *   If `roundTimeRemaining` becomes negative, `player.accumulatedOverdueTime` increments.
    *   `totalGameTimeElapsed` increments if any player is active.
*   **Footer:** Displays instructional text (e.g., "Tap a player to start/stop their timer.") and a summary of the session setup (duration, rounds, players).

## 4. General Requirements

*   **Browser Caching:** The application should leverage standard browser caching mechanisms for assets.
*   **Responsiveness:** The UI must adapt to different screen sizes, providing a good user experience on both mobile devices and desktops. Layouts should adjust (e.g., grid columns for player boxes).
*   **Accessibility:** The application should follow accessibility best practices, including:
    *   Sufficient color contrast.
    *   Keyboard navigability for interactive elements.
    *   Use of ARIA attributes where appropriate to provide context for assistive technologies (e.g., `aria-label` on player boxes).
*   **Cross-Browser Compatibility:** The application should function correctly on modern major web browsers.
*   **Performance:** The application should be performant, with smooth transitions and responsive timers.
*   **User Experience:**
    *   Clear error messaging and input validation.
    *   Intuitive navigation and interaction patterns.
    *   Visual feedback for active states and timer status.
*   **State Management:** A running game's state is held in React components and would be lost on a hard refresh or browser close unless explicitly saved to local storage (which is not a current explicit requirement found).

This document outlines the core business requirements based on the provided application code.
Ensure all UI elements have clear labels and instructions.
Error states should be handled gracefully, guiding the user to correct issues.
The application should be intuitive, minimizing the learning curve for new users.
Ensure consistency in design and interaction patterns across different screens.
Test thoroughly for edge cases in timer logic and state transitions.
Prioritize readability and maintainability of the codebase.
Consider adding a "Settings" or "Help" section in the future for more complex features or user guidance.
Focus on a clean, modern aesthetic that is visually appealing and enhances usability.
The app relies on client-side logic for all its operations, including timer management and state updates. There is no backend server component described for game logic.
The app uses Tailwind CSS for styling, implying a utility-first approach to design.
React is the core framework for building the UI components and managing state.
Typescript is used for type safety.
ESM modules are used for JavaScript, with dependencies loaded from `esm.sh`.
The app uses standard HTML, CSS, and JavaScript, runnable in a web browser.
The `index.html` file sets up the basic page structure, loads Tailwind CSS, and initializes the React application via `index.tsx`.
The `metadata.json` seems to be for a specific platform or tool that uses it to understand the app's capabilities and permissions. Currently, it requests no special frame permissions.
The application assumes the `API_KEY` environment variable is pre-configured if any Gemini API features were to be added; however, no such features are currently implemented. The provided code does not use `@google/genai`.
The main application logic and screen orchestration is handled in `App.tsx`.
Reusable UI components like `Button.tsx`, `TimerDisplay.tsx`, etc., are located in the `components/` directory.
Type definitions for shared data structures like `Player` and `GameSettings` are in `types.ts`.
The entry point for the React application is `index.tsx`.
