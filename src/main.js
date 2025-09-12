import { initRenderer, animate } from './render.js';
import { initUI } from './ui.js';
import { gameState, saveGame, loadGame, checkForSavedGame } from './state.js';

/**
 * Entry point for the application. Initialises renderer, UI bindings, and
 * kicks off the animation loop.
 */
export function startGame() {
  initRenderer();
  initUI();
  animate();
}

// Automatically start the game when this module is loaded.
startGame();

// Re-export state helpers so they can be accessed from other modules if needed.
export { gameState, saveGame, loadGame, checkForSavedGame };
