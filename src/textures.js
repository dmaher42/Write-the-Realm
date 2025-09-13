import * as THREE from 'three';

function checkerTexture(c1, c2, size = 2) {
  const data = new Uint8Array(3 * size * size);
  let ptr = 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const color = (x + y) % 2 === 0 ? c1 : c2;
      data[ptr++] = color[0];
      data[ptr++] = color[1];
      data[ptr++] = color[2];
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

export const rockTexture = checkerTexture([160, 160, 160], [100, 100, 100]);
export const pathAlbedoTexture = checkerTexture([150, 111, 51], [130, 95, 45]);
export const pathRoughTexture = checkerTexture([200, 200, 200], [180, 180, 180]);
export const roofTexture = checkerTexture([200, 30, 30], [160, 20, 20]);
