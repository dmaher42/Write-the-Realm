import * as THREE from 'three';

function solid(color, repeat = false) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const tex = new THREE.CanvasTexture(canvas);
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// Placeholder textures: replace with real assets when available
export const pathAlbedo = solid('#8d8365', true);
export const pathRough = solid('#777', true);
export const roofAlbedo = solid('#b44', true);
export const rockAlbedo = solid('#999', true);
