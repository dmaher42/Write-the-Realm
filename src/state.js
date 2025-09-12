/**
 * Global game state container. In the real game this would be populated with
 * quest data, player information, and other runtime flags. The simplified
 * version here demonstrates how state is encapsulated in its own module.
 */
export const gameState = {
  currentQuestIndex: 0,
  quests: [],
  canInteractWith: null,
  isCombatActive: false,
};

// Key used for localStorage persistence
const STORAGE_KEY = 'gameState';

// Detect whether localStorage is available (e.g., in a browser environment)
function hasStorage() {
  return typeof localStorage !== 'undefined';
}

/**
 * Persist the provided state object (defaults to the module's gameState) to
 * localStorage.
 */
export function saveGame(state = gameState) {
  if (!hasStorage()) {
    console.error('localStorage is unavailable; cannot save game');
    return false;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.error('Failed to save game', err);
    return false;
  }
}

/**
 * Load previously stored state from localStorage. Returns null if no saved
 * state exists.
 */
export function loadGame() {
  if (!hasStorage()) {
    console.error('localStorage is unavailable; cannot load game');
    return null;
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to load game', err);
    return null;
  }
}

/**
 * Convenience helper to check whether a saved game is present in storage.
 */
export function checkForSavedGame() {
  if (!hasStorage()) {
    return false;
  }
  return !!localStorage.getItem(STORAGE_KEY);
}
