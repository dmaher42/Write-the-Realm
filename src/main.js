import * as THREE from 'three';
import { initRenderer, scene, camera, renderer, setComposer } from './render.js';
import { initUI } from './ui.js';
import { initControls, updateControls } from './controls.js';
import { createPlayer } from './player.js';
import { gameState, saveGame, loadGame, checkForSavedGame } from './state.js';
import { createComposer } from './postfx.js';

/**
 * Entry point for the application. Initialises renderer, UI bindings, and
 * kicks off the animation loop.
 */
const params = new URLSearchParams(window.location.search);
const fxEnabled = params.get('fx') === '1';
let composer = null;
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  updateControls();
  const delta = clock.getDelta();
  if (fxEnabled && composer) {
    composer.render(delta);
  } else {
    renderer.render(scene, camera);
  }
}

export function startGame() {
  initRenderer();
  const player = createPlayer();
  scene.add(player);
  initUI();
  initControls(camera, player, renderer.domElement);
  if (fxEnabled) {
    const result = createComposer(renderer, scene, camera);
    composer = result.composer;
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
