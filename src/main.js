import { initGameController } from './gameController.js';
import { initChapterOneCombat } from './chapterOneCombat.js';
import {
  gameState,
  saveGame,
  loadGame,
  checkForSavedGame,
} from './state.js';

// Keep the lightweight procedural village while the complete Chapter 1 loop
// is established. Optional GLB assets can be restored after gameplay is stable.
window.USE_3D_MODELS = false;

function boot() {
  const controller = initGameController({
    gameState,
    saveGame,
    loadGame,
    checkForSavedGame,
  });

  const combat = initChapterOneCombat({
    gameState,
    saveGame,
    controller,
  });

  // KokuraVillageScene reads this API after the main module has initialised.
  // The combat upgrade extends the same controller rather than creating a
  // separate quest or inventory state.
  window.gameAPI = controller.gameApi;
  window.writeTheRealm = { ...controller, combat };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
