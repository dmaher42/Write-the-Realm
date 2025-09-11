import * as THREE from 'three';

// Utility to create a colored billboard sprite. The sprite will always face the camera
// and serves as a lightweight stand-in for what used to be fully modeled geometry.
function createBillboard(color, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#' + color.toString(16).padStart(6, '0');
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(width, height, 1);
  return sprite;
}

// Simple billboarded representations of the village structures.
export function createHut() {
  return createBillboard(0xF2D6B3, 4, 4);
}

export function createFarmRow() {
  return createBillboard(0xC9E4B4, 8, 2);
}

export function createLordHouse() {
  return createBillboard(0xF5E0C3, 8, 8);
}

export function createChurch() {
  return createBillboard(0xE3E3F7, 6, 10);
}
