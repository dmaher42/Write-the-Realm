import { initGameController } from './gameController.js';
import {
  gameState,
  saveGame,
  loadGame,
  checkForSavedGame,
} from './state.js';

// The first upgrade keeps the lightweight procedural village and disables
// optional model requests until the core Chapter 1 loop is stable.
window.USE_3D_MODELS = false;

function boot() {
  const controller = initGameController({
    gameState,
    saveGame,
    loadGame,
    checkForSavedGame,
  });

  // KokuraVillageScene reads this API after the main module has initialised.
  // Exposing one controller prevents the scene and UI from maintaining
  // separate quest and inventory state.
  window.gameAPI = controller.gameApi;
  window.writeTheRealm = controller;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
