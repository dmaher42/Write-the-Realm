import * as THREE from 'three';

// Utility to create a 3D building with base and roof geometry
// This provides consistent 3D appearance throughout the game world
function createBuilding(width, height, depth, baseColor, roofColor) {
  const group = new THREE.Group();
  
  // Create base building structure
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth), 
    new THREE.MeshStandardMaterial({ color: baseColor })
  );
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);
  
  // Create roof
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.7, height * 0.5, 4),
    new THREE.MeshStandardMaterial({ color: roofColor })
  );
  roof.position.y = height / 2 + height * 0.25;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);
  
  return group;
}

// 3D representations of village structures that match the game's visual style
export function createHut() {
  return createBuilding(4, 3, 4, 0xF2D6B3, 0x8B4513);
}

export function createFarmRow() {
  // Create a farm structure - wider and lower for crops
  const group = new THREE.Group();
  const farmBase = new THREE.Mesh(
    new THREE.BoxGeometry(8, 1, 2), 
    new THREE.MeshStandardMaterial({ color: 0xC9E4B4 })
  );
  farmBase.position.y = 0.5;
  farmBase.castShadow = true;
  farmBase.receiveShadow = true;
  group.add(farmBase);
  return group;
}

export function createLordHouse() {
  return createBuilding(8, 6, 8, 0xF5E0C3, 0x8B0000);
}

export function createChurch() {
  return createBuilding(6, 8, 10, 0xE3E3F7, 0x654321);
}
