// assets/sprites/villageStructures.js
import * as THREE from 'three';

export function createHut() {
  return new THREE.Mesh(
    new THREE.BoxGeometry(2, 1, 2),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
  );
}

export function createFarmRow() {
  return new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.2, 1),
    new THREE.MeshStandardMaterial({ color: 0x556b2f })
  );
}

export function createLordHouse() {
  return new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 3),
    new THREE.MeshStandardMaterial({ color: 0xb0a18e })
  );
}

export function createChurch() {
  return new THREE.Mesh(
    new THREE.ConeGeometry(1.2, 2, 6),
    new THREE.MeshStandardMaterial({ color: 0xddd7cf })
  );
}
