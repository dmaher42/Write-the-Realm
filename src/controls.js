/**
 * Camera and interaction controls. Handles player movement, NPC picking, and
 * OrbitControls-based camera follow.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { gameState } from './state.js';
import { updatePointer, pick } from './picking.js';
import { openDialoguePanel } from './ui.js';

const keys = {};
let camera;
let player;
let domElement;
let orbit;
let npcs = [];
let hovered = null;
const interactPrompt = document.getElementById('interact-prompt');
const SPEED = 0.2;
const prevPlayer = new THREE.Vector3();

function onKeyDown(event) {
  keys[event.key.toLowerCase()] = true;
}

function onKeyUp(event) {
  keys[event.key.toLowerCase()] = false;
}

function onPointerMove(event) {
  if (!domElement) return;
  updatePointer(event, domElement);
}

function onClick() {
  if (hovered) openDialoguePanel(hovered.userData.name); // TODO: AI quests hook
}

export function initControls(targetCamera, targetPlayer, element) {
  camera = targetCamera;
  player = targetPlayer;
  domElement = element || window;

  orbit = new OrbitControls(camera, domElement);
  orbit.enablePan = false;
  orbit.minPolarAngle = Math.PI * 0.25;
  orbit.maxPolarAngle = Math.PI * 0.75;
  orbit.enableDamping = true;
  orbit.dampingFactor = 0.05;
  orbit.target.copy(player.position);
  prevPlayer.copy(player.position);

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  domElement.addEventListener('pointermove', onPointerMove);
  domElement.addEventListener('click', onClick);
}

export function registerNPCs(list) {
  npcs = list;
}

// No need for updateCamera() from the conflicted branch, as camera follow logic is handled in updateControls

export function updateControls() {
  if (!camera || !player) return;

  // Hover picking
  const hits = pick(camera, npcs);
  const hit = hits.length > 0 ? hits[0] : null;
  let obj = hit ? hit.object : null;
  while (obj && !npcs.includes(obj)) obj = obj.parent;
  if (hovered && hovered !== obj) {
    hovered.traverse((child) => {
      if (child.isMesh && child.material.emissive) child.material.emissive.set(0x000000);
    });
    hovered = null;
  }
  if (obj && hovered !== obj) {
    obj.traverse((child) => {
      if (child.isMesh && child.material.emissive) child.material.emissive.set(0x333333);
    });
    hovered = obj;
  }

  // Player movement relative to camera
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  const left = new THREE.Vector3();
  left.crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();
  const move = new THREE.Vector3();
  if (keys['w']) move.add(forward);
  if (keys['s']) move.sub(forward);
  if (keys['a']) move.add(left);
  if (keys['d']) move.sub(left);
  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(SPEED);
    player.position.add(move);
  }

  // Camera rotation via arrow keys
  if (keys['arrowleft']) orbit.rotateLeft(0.03);
  if (keys['arrowright']) orbit.rotateLeft(-0.03);
  if (keys['arrowup']) orbit.rotateUp(0.03);
  if (keys['arrowdown']) orbit.rotateUp(-0.03);

  // Camera follow
  const delta = new THREE.Vector3().subVectors(player.position, prevPlayer);
  camera.position.add(delta);
  orbit.target.copy(player.position);
  prevPlayer.copy(player.position);

  orbit.update();

  const dialogueBox = document.getElementById('dialogue-box');
  const dialogueVisible = dialogueBox && dialogueBox.style.display === 'block';
  if (dialogueVisible) {
    if (interactPrompt) interactPrompt.style.display = 'none';
    return;
  }

  let target = null;
  for (const npc of npcs) {
    const radius = npc.userData?.interactRadius || 2;
    if (player.position.distanceTo(npc.position) < radius) {
      target = npc;
      break;
    }
  }

  if (target) {
    gameState.canInteractWith = target;
    if (interactPrompt) interactPrompt.style.display = 'block';
    if (keys['e']) {
      openDialoguePanel(target.userData.name);
      keys['e'] = false;
    }
  } else {
    gameState.canInteractWith = null;
    if (interactPrompt) interactPrompt.style.display = 'none';
  }
}