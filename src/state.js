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
  selectedGuardian: '',
  selectedDomain: '',
  journalEntries: [],
  inventory: [],
};

/**
 * Update the active quest. Accepts either a quest object to append to the
 * quest list or a numeric index to switch to an existing quest. The updated
 * state is immediately persisted.
 */
export function updateQuestProgress(quest) {
  if (typeof quest === 'object' && quest !== null) {
    gameState.quests.push(quest);
    gameState.currentQuestIndex = gameState.quests.length - 1;
  } else if (
    typeof quest === 'number' &&
    quest >= 0 &&
    quest < gameState.quests.length
  ) {
    gameState.currentQuestIndex = quest;
  } else {
    return; // ignore invalid input
  }
  saveGame();
}

/**
 * Toggle combat status and persist the change.
 */
export function updateCombatStatus(active) {
  const normalized = !!active;
  if (gameState.isCombatActive !== normalized) {
    gameState.isCombatActive = normalized;
    saveGame();
  }
}

/**
 * Register which target the player can interact with and persist the change.
 */
export function updateInteractableTarget(target) {
  if (gameState.canInteractWith !== target) {
    gameState.canInteractWith = target;
    saveGame();
  }
}

/**
 * Persist the provided state object (defaults to the module's gameState) to
 * localStorage.
 */
export function saveGame(state = gameState) {
  try {
    localStorage.setItem('gameState', JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save game', err);
  }
}

/**
 * Load previously stored state from localStorage. Returns null if no saved
 * state exists.
 */
export function loadGame() {
  try {
    const data = localStorage.getItem('gameState');
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Failed to load game', err);
    return null;
  }
}

/**
 * Convenience helper to check whether a saved game is present in storage.
 * Returns false if accessing storage fails (e.g., in environments without
 * localStorage support).
 */
export function checkForSavedGame() {
  try {
    return !!localStorage.getItem('gameState');
  } catch (err) {
    console.error('Failed to access saved game', err);
    return false;
  }
}
