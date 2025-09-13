/**
 * Keyboard helpers to move the active camera with basic WASD controls and
 * handle simple NPC interactions.
 */
import { gameState } from './state.js';

const keys = {};
let camera;
let npcs = [];
const interactPrompt = document.getElementById('interact-prompt');
// Increased speed for more responsive keyboard navigation around the scene.
const SPEED = 0.5;

function onKeyDown(event) {
  keys[event.key.toLowerCase()] = true;
}

function onKeyUp(event) {
  keys[event.key.toLowerCase()] = false;
}

/**
 * Register event listeners and track the provided camera.
 */
export function initControls(targetCamera) {
  camera = targetCamera;
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

export function registerNPCs(list) {
  npcs = list;
}

/**
 * Update the camera's position based on currently pressed keys.
 */
export function updateControls() {
  if (!camera) return;

  if (keys['w']) camera.position.z -= SPEED;
  if (keys['s']) camera.position.z += SPEED;
  if (keys['a']) camera.position.x -= SPEED;
  if (keys['d']) camera.position.x += SPEED;

  const dialogueBox = document.getElementById('dialogue-box');
  const dialogueVisible = dialogueBox && dialogueBox.style.display === 'block';
  if (dialogueVisible) {
    if (interactPrompt) interactPrompt.style.display = 'none';
    return;
  }

  let target = null;
  for (const npc of npcs) {
    const dist = camera.position.distanceTo(npc.mesh.position);
    if (dist < 2) {
      target = npc;
      break;
    }
  }

  if (target) {
    gameState.canInteractWith = target;
    if (interactPrompt) interactPrompt.style.display = 'block';
    if (keys['e']) {
      target.triggerDialogue();
      keys['e'] = false;
    }
  } else {
    gameState.canInteractWith = null;
    if (interactPrompt) interactPrompt.style.display = 'none';
  }
}
