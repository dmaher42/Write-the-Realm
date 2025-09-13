import * as THREE from 'three';
import {
  rockTexture,
  pathAlbedoTexture,
  pathRoughTexture,
} from './textures.js';

const rockMaterial = new THREE.MeshStandardMaterial({
  map: rockTexture,
  roughness: 1,
  metalness: 0,
});

export function createPath(length = 5, width = 2) {
  const geometry = new THREE.PlaneGeometry(length, width, 1, 1);
  const albedo = pathAlbedoTexture.clone();
  const rough = pathRoughTexture.clone();
  albedo.wrapS = albedo.wrapT = THREE.RepeatWrapping;
  rough.wrapS = rough.wrapT = THREE.RepeatWrapping;
  albedo.repeat.set(length, width);
  rough.repeat.set(length, width);
  const material = new THREE.MeshStandardMaterial({
    map: albedo,
    roughnessMap: rough,
    roughness: 1,
    metalness: 0,
  });
  const path = new THREE.Mesh(geometry, material);
  path.rotation.x = -Math.PI / 2;
  path.receiveShadow = true;
  return path;
}

export function createFence(planks = 5) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
  for (let i = 0; i < planks; i++) {
    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1, 0.5),
      material
    );
    plank.position.set(i * 0.5, 0.5, 0);
    plank.castShadow = true;
    group.add(plank);
  }
  return group;
}

export function createTree() {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.3, 2, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b4513 })
  );
  trunk.position.y = 1;
  trunk.castShadow = trunk.receiveShadow = true;
  group.add(trunk);

  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(1, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x228b22 })
  );
  canopy.position.y = 2.5;
  canopy.castShadow = true;
  group.add(canopy);

  return group;
}

export function createRock() {
  const geometry = new THREE.DodecahedronGeometry(0.5, 0);
  const rock = new THREE.Mesh(geometry, rockMaterial);
  rock.castShadow = rock.receiveShadow = true;
  return rock;
}
