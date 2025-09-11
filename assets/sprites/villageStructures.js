import * as THREE from 'three';

// Simple geometry-based representations of village structures.
export function createHut() {
  const hut = new THREE.Group();

  const baseHeight = 2;
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2, baseHeight, 6),
    new THREE.MeshStandardMaterial({ color: 0x8B4513 })
  );
  base.castShadow = true;
  base.receiveShadow = true;
  hut.add(base);

  const roofHeight = 1.5;
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.2, roofHeight, 6),
    new THREE.MeshStandardMaterial({ color: 0xCD853F })
  );
  roof.position.y = baseHeight / 2 + roofHeight / 2;
  roof.castShadow = true;
  hut.add(roof);

  return hut;
}

export function createFarmRow() {
  const row = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.2, 2),
    new THREE.MeshStandardMaterial({ color: 0x228B22 })
  );
  row.position.y = 0.1;
  row.receiveShadow = true;
  return row;
}

export function createLordHouse() {
  const house = new THREE.Group();

  const baseHeight = 3;
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(8, baseHeight, 8),
    new THREE.MeshStandardMaterial({ color: 0xB5651D })
  );
  base.castShadow = true;
  base.receiveShadow = true;
  house.add(base);

  const roofHeight = 2.5;
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(6, roofHeight, 4),
    new THREE.MeshStandardMaterial({ color: 0x8B4513 })
  );
  roof.position.y = baseHeight / 2 + roofHeight / 2;
  roof.castShadow = true;
  house.add(roof);

  return house;
}

export function createChurch() {
  const church = new THREE.Group();

  const baseHeight = 6;
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(6, baseHeight, 4),
    new THREE.MeshStandardMaterial({ color: 0xD8D8D8 })
  );
  body.castShadow = true;
  body.receiveShadow = true;
  church.add(body);

  const roofHeight = 3;
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(5, roofHeight, 4),
    new THREE.MeshStandardMaterial({ color: 0x8B0000 })
  );
  roof.position.y = baseHeight / 2 + roofHeight / 2;
  roof.castShadow = true;
  church.add(roof);

  return church;
}
