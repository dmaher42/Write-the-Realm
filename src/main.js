import * as THREE from 'three';
import { initRenderer, scene, camera, renderer, setComposer } from './render.js';
import { loadDialogue, getDialogueFor, open as openDialogue } from './dialogue.js';
import { initUI, setActionHandler } from './ui.js';
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

export async function startGame() {
  const init = initRenderer();
  npcs = init.npcs;

  // Create animated GLTF player; use its group as the movable object
  playerModel = new PlayerModel(scene);
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

    const { lines, options } = getDialogueFor(target);
    openDialogue({ npcName: target, lines, options });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'e') tryInteract();
  });

  await loadDialogue();

  // Add event listener for "Forge New Legend" button
  document.getElementById('new-game-btn').addEventListener('click', () => {
    document.getElementById('character-creator').style.display = 'block';
    document.getElementById('start-modal').style.display = 'none';
  });

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