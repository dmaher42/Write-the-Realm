/**
 * Keyboard helpers to move the active camera with basic WASD controls and
 * handle simple NPC interactions.
 */
import * as THREE from 'three';
import { gameState } from './state.js';
import { setPointer, pick } from './picking.js';

const keys = {};
let camera;
let player;
let domElement;
let npcs = [];
let hovered = null;
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

function onMouseMove(event) {
  if (!domElement) return;
  setPointer(event, domElement);
  const hit = pick(
    npcs.map((n) => n.mesh),
    camera
  );
  let obj = hit ? hit.object : null;
  while (obj && !npcs.some((n) => n.mesh === obj)) {
    obj = obj.parent;
  }
  const npc = npcs.find((n) => n.mesh === obj) || null;
  if (hovered && hovered !== npc) {
    hovered.mesh.traverse((child) => {
      if (child.isMesh) child.material.emissive.set(0x000000);
    });
    hovered = null;
  }
  if (npc && hovered !== npc) {
    npc.mesh.traverse((child) => {
      if (child.isMesh) child.material.emissive.set(0x333333);
    });
    hovered = npc;
  }
}

function onClick() {
  if (hovered) hovered.triggerDialogue();
}

export function initControls(targetCamera, targetPlayer, element) {
  camera = targetCamera;
  player = targetPlayer;
  domElement = element || window;
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  domElement.addEventListener('mousemove', onMouseMove);
  domElement.addEventListener('click', onClick);
}

export function registerNPCs(list) {
  npcs = list;
}

function updateCamera() {
  const rotated = offset.clone();
  rotated.applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch);
  rotated.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  const target = player.position.clone().add(rotated);
  camera.position.lerp(target, 0.1);
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
