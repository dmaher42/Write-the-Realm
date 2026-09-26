import { initGameController } from './gameController.js';
import { initChapterOneCombat } from './chapterOneCombat.js';
import { initTeacherSettings } from './teacherSettings.js';
import { mountKokuraVillage } from '../js/KokuraVillageScene.js';
import {
  gameState,
  saveGame,
  loadGame,
  checkForSavedGame,
} from './state.js';

// Keep the lightweight procedural village while the complete Chapter 1 loop
// is established. Optional GLB assets can be restored after gameplay is stable.
window.USE_3D_MODELS = false;

function preserveRequiredControls() {
  const actionChoice = document.getElementById('pre-action-bank')?.parentElement;
  if (!actionChoice) return;

  actionChoice.dataset.teacherRequiredControl = 'true';
  const style = document.createElement('style');
  style.id = 'required-writing-controls-style';
  style.textContent =
    '[data-teacher-required-control="true"] { display: block !important; }';
  document.head.appendChild(style);
}

function boot() {
  preserveRequiredControls();

  // Teacher validation uses capture listeners, so it must initialise before
  // the controller and combat modules register their submission handlers.
  const teacher = initTeacherSettings({ gameState, saveGame });

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
  // All modules extend the same controller and shared state.
  window.gameAPI = controller.gameApi;
  window.writeTheRealm = { ...controller, combat, teacher };

  const villageRoot = document.getElementById('kokura-root');
  if (villageRoot) mountKokuraVillage(villageRoot, controller.gameApi);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
