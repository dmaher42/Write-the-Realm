import { initRenderer, animate } from './render.js';
import { initControls, updateControls } from './controls.js';
import { initUI } from './ui.js';
import { gameState, saveGame, loadGame, checkForSavedGame } from './state.js';

let lastFrame = 0;

function gameLoop(time) {
  const delta = (time - lastFrame) / 1000;
  lastFrame = time;
  updateControls(delta);
  requestAnimationFrame(gameLoop);
}

/**
 * Entry point for the application. Initialises renderer, UI bindings, and
 * kicks off the animation loop.
 */
export function startGame() {
  const { camera } = initRenderer();
  initControls(camera);
  initUI();
  animate();
  lastFrame = performance.now();
  requestAnimationFrame(gameLoop);
}

// Wait for the DOM to be fully loaded before starting the game.
// This ensures UI elements like the "Forge New Legend" button exist
// when event listeners are registered.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startGame);
} else {
  startGame();
}

// Re-export state helpers so they can be accessed from other modules if needed.
export { gameState, saveGame, loadGame, checkForSavedGame };
