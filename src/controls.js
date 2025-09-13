/**
 * Keyboard helpers to move the active camera with basic WASD controls and
 * handle simple NPC interactions.
 */
import * as THREE from 'three';
import { gameState } from './state.js';

const keys = {};
let camera;
let player;
let npcs = [];
const interactPrompt = document.getElementById('interact-prompt');

const SPEED = 0.2;
let yaw = 0;
let pitch = 0.6;
const offset = new THREE.Vector3(0, 3, 6);

function onKeyDown(event) {
  keys[event.key.toLowerCase()] = true;
}

function onKeyUp(event) {
  keys[event.key.toLowerCase()] = false;
}

export function initControls(targetCamera, targetPlayer) {
  camera = targetCamera;
  player = targetPlayer;
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

export function registerNPCs(list) {
  npcs = list;
}

function updateCamera() {
  const rotated = offset.clone();
  rotated.applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
  rotated.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  camera.position.copy(player.position).add(rotated);
  camera.lookAt(player.position);
}

export function updateControls() {
  if (!camera || !player) return;

  const move = new THREE.Vector3();
  if (keys['w']) move.z -= 1;
  if (keys['s']) move.z += 1;
  if (keys['a']) move.x -= 1;
  if (keys['d']) move.x += 1;
  if (move.lengthSq() > 0) {
    move.normalize();
    move.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    player.position.add(move.multiplyScalar(SPEED));
  }

  if (keys['arrowleft']) yaw += 0.03;
  if (keys['arrowright']) yaw -= 0.03;
  if (keys['arrowup']) pitch = Math.max(0.2, pitch - 0.03);
  if (keys['arrowdown']) pitch = Math.min(1.2, pitch + 0.03);

  updateCamera();

  const dialogueBox = document.getElementById('dialogue-box');
  const dialogueVisible = dialogueBox && dialogueBox.style.display === 'block';
  if (dialogueVisible) {
    if (interactPrompt) interactPrompt.style.display = 'none';
    return;
  }

  let target = null;
  for (const npc of npcs) {
    const dist = player.position.distanceTo(npc.mesh.position);
    if (dist < npc.radius) {
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
