import * as THREE from 'three';
import { initRenderer, scene, camera, renderer, setComposer } from './render.js';
import { loadDialogue, getDialogueFor, open as openDialogue } from './dialogue.js';
import { initUI, setActionHandler } from './ui.js';
import { initControls, updateControls } from './controls.js';
import { PlayerModel } from './playerModel.js';
import { npcModels } from './npcs.js';
import { gameState, saveGame, loadGame, checkForSavedGame } from './state.js';
import { createComposer } from './postfx.js';
import { updatePointerFromEvent, pick, setPickTargets } from './picking.js';

/**
 * Entry point for the application. Initialises renderer, UI bindings, and
 * kicks off the animation loop.
 */
const params = new URLSearchParams(window.location.search);
const fxEnabled = params.get('fx') === '1';
let composer = null;
let player; // THREE.Object3D used by controls
let playerModel; // PlayerModel instance (GLTF + mixer)
let npcs = [];
let interactPrompt = null;
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  updateControls();
  const hovered = pick(camera);
  let target = null;
  if (hovered && npcs.includes(hovered)) {
    const radius = hovered.userData?.interactRadius || 2;
    if (player && player.position.distanceTo(hovered.position) < radius)
      target = hovered;
  }
  gameState.canInteractWith = target;
  if (!interactPrompt) interactPrompt = document.getElementById('interact-prompt');
  if (interactPrompt) interactPrompt.style.display = target ? 'block' : 'none';
  const delta = clock.getDelta();
  if (playerModel && playerModel.update) playerModel.update(delta);
  for (const npc of npcModels) npc.update(delta);
  if (fxEnabled && composer) {
    composer.composer.render(delta);
  } else {
    renderer.render(scene, camera);
  }
}

export async function startGame() {
  const init = initRenderer();
  npcs = init.npcs;

  // Create animated GLTF player; use its group as the movable object
  playerModel = new PlayerModel(scene, {
    modelPath: '../assets/models/viking.glb'
  });
  player = playerModel.group;

  initUI('#ui-root');
  setActionHandler(() => {
    // optional: update HUD/quest log here
  });

  // Hook: flip Idle/Walk and handle interact one-shots
  initControls(
    camera,
    player,
    renderer.domElement,
    (isMoving) => {
      if (!playerModel) return;
      if (isMoving) {
        if (playerModel.actions.walk) playerModel.actions.walk.timeScale = 1.0;
        playerModel.fadeTo('walk', 0.25);
      } else {
        if (playerModel.actions.idle) playerModel.actions.idle.timeScale = 1.0;
        playerModel.fadeTo('idle', 0.25);
      }
    },
    (isMoving) => {
      if (!playerModel) return;
      playerModel.playOneShot('interact', 0.15, isMoving ? 'walk' : 'idle');
    },
    playerModel
  );

  window.addEventListener('pointermove', (e) => updatePointerFromEvent(e, renderer.domElement));

  setPickTargets(npcs, { maxDistance: 16 });

  function tryInteract() {
    const hovered = pick(camera);
    const target = hovered && (hovered.userData?.npcName || hovered.parent?.userData?.npcName);
    if (!target) return;

    const npcObj = hovered.userData?.root || hovered.parent;
    const playerPos = (playerModel?.model ?? player).position;
    if (npcObj.position.distanceTo(playerPos) > (hovered.userData?.interactRadius ?? 2)) return;

    playerModel?.playOneShot('interact', 0.15, updateControls?._moving ? 'walk' : 'idle');

    const npcModel = npcModels.find((n) => n.group === npcObj);
    npcModel?.playOneShot('interact');

    const { lines, options } = getDialogueFor(target);
    openDialogue({ npcName: target, lines, options });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'e') tryInteract();
  });

  await loadDialogue();

  if (fxEnabled) {
    composer = createComposer(renderer, scene, camera);
    composer.bloomPass.enabled = true;
    setComposer(composer);
  }
  animate();
}

/**
 * Prepare the initial start screen and character creator before the game
 * begins. Handles button clicks for starting a new game or continuing an
 * existing one.
 */
function setupStartScreen() {
  const startModal = document.getElementById('start-modal');
  const characterCreator = document.getElementById('character-creator');
  const uiContainer = document.getElementById('ui-container');
  const newGameBtn = document.getElementById('new-game-btn');
  const continueGameBtn = document.getElementById('continue-game-btn');
  const startGameBtn = document.getElementById('start-game-btn');

  if (!startModal || !characterCreator || !uiContainer) {
    // Fallback: if the expected UI elements aren't present, start immediately.
    startGame();
    return;
  }

  // Enable continue button only if a saved game exists.
  continueGameBtn.disabled = !checkForSavedGame();

  // Show character creator when forging a new legend.
  newGameBtn.addEventListener('click', () => {
    startModal.style.display = 'none';
    characterCreator.style.display = 'block';
  });

  // Load saved state and begin the game when continuing a journey.
  continueGameBtn.addEventListener('click', () => {
    const saved = loadGame();
    if (saved) Object.assign(gameState, saved);
    startModal.style.display = 'none';
    uiContainer.style.visibility = 'visible';
    startGame();
  });

  // Begin the adventure after selecting a guardian and domain.
  startGameBtn.addEventListener('click', () => {
    const guardianEl = document.querySelector('#guardian-type-options .selected');
    const domainEl = document.querySelector('#guardian-domain-options .selected');
    const customInput = document.getElementById('custom-guardian-input');

    gameState.selectedGuardian = '';
    gameState.selectedDomain = '';

    if (guardianEl) {
      if (guardianEl.dataset.type === 'custom' && customInput) {
        gameState.selectedGuardian = customInput.value.trim();
      } else {
        gameState.selectedGuardian = guardianEl.dataset.type || '';
      }
    }

    if (domainEl) {
      gameState.selectedDomain = domainEl.dataset.domain || '';
    }

    characterCreator.style.display = 'none';
    uiContainer.style.visibility = 'visible';
    startGame();
  });

  // Optional: toggle "selected" class for guardian and domain options.
  function enableSelection(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const options = container.querySelectorAll('.creator-option');
    options.forEach((opt) => {
      opt.addEventListener('click', () => {
        options.forEach((o) => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });
  }

  enableSelection('#guardian-type-options');
  enableSelection('#guardian-domain-options');
}

// Wait for the DOM to be fully loaded before starting the game.
// This ensures UI elements like the "Forge New Legend" button exist
// when event listeners are registered.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupStartScreen);
} else {
  setupStartScreen();
}

// Re-export state helpers so they can be accessed from other modules if needed.
export { gameState, saveGame, loadGame, checkForSavedGame };
