import * as THREE from 'three';
import { initRenderer, scene, camera, renderer, setComposer } from './render.js';
import { initUI, openDialoguePanel } from './ui.js';
import { initControls, updateControls } from './controls.js';
import { PlayerModel } from './playerModel.js';
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
  if (fxEnabled && composer) {
    composer.composer.render(delta);
  } else {
    renderer.render(scene, camera);
  }
}

export function startGame() {
  const init = initRenderer();
  npcs = init.npcs;

  // Create animated GLTF player; use its group as the movable object
  playerModel = new PlayerModel(scene, { modelPath: 'assets/models/guardianCharacter.glb' });
  player = playerModel.group;

  initUI();
  // Hook: flip Idle/Walk based on movement without rewriting controls.js
  initControls(camera, player, renderer.domElement, (isMoving) => {
    if (!playerModel || !playerModel.fadeTo) return;
    playerModel.fadeTo(isMoving ? 'walk' : 'idle', 0.25);
  });
  window.addEventListener('pointermove', (e) => updatePointerFromEvent(e, renderer.domElement));
  window.addEventListener('click', () => {
    if (gameState.canInteractWith)
      openDialoguePanel(gameState.canInteractWith.userData.name);
    // TODO: trigger quest or journal updates when interactions occur
  });
  setPickTargets(npcs, { maxDistance: 18 });
  if (fxEnabled) {
    composer = createComposer(renderer, scene, camera);
    composer.bloomPass.enabled = true;
    setComposer(composer);
  }
  animate();
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
