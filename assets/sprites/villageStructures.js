import * as THREE from 'three';
import { roofTexture } from '../../src/textures.js';

const roofMaterial = new THREE.MeshStandardMaterial({
  map: roofTexture,
  roughness: 1,
  metalness: 0,
});

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
    roofMaterial
  );
  roof.position.y = baseHeight / 2 + roofHeight / 2;
  roof.castShadow = true;
  hut.add(roof);

  // Door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.2, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x654321 })
  );
  door.position.set(0, -baseHeight / 2 + 0.6, 2.05);
  hut.add(door);

  // Windows
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xadd8e6,
    transparent: true,
    opacity: 0.7,
  });
  const windowLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.1),
    windowMaterial
  );
  windowLeft.position.set(-1.2, 0, 1.9);
  const windowRight = windowLeft.clone();
  windowRight.position.x = 1.2;
  hut.add(windowLeft);
  hut.add(windowRight);

  // Chimney
  const chimney = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x555555 })
  );
  chimney.position.set(-0.8, baseHeight / 2 + roofHeight / 2, 0);
  hut.add(chimney);

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
    roofMaterial
  );
  roof.position.y = baseHeight / 2 + roofHeight / 2;
  roof.castShadow = true;
  house.add(roof);

  // Door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 1.8, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x654321 })
  );
  door.position.set(0, -baseHeight / 2 + 0.9, 4.05);
  house.add(door);

  // Windows
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xadd8e6,
    transparent: true,
    opacity: 0.7,
  });
  const windowGeom = new THREE.BoxGeometry(1, 1, 0.1);
  const positions = [
    [-2, 0.5, 4.05],
    [2, 0.5, 4.05],
    [-2, 1.8, 4.05],
    [2, 1.8, 4.05],
  ];
  positions.forEach(([x, y, z]) => {
    const win = new THREE.Mesh(windowGeom, windowMaterial);
    win.position.set(x, y - baseHeight / 2, z);
    house.add(win);
  });

  // Porch
  const porchFloor = new THREE.Mesh(
    new THREE.BoxGeometry(4, 0.2, 2),
    new THREE.MeshStandardMaterial({ color: 0xC2B280 })
  );
  porchFloor.position.set(0, -baseHeight / 2 + 0.1, 5);
  porchFloor.receiveShadow = true;
  house.add(porchFloor);

  // Chimney
  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.5, 0.6),
    new THREE.MeshStandardMaterial({ color: 0x555555 })
  );
  chimney.position.set(2.5, baseHeight / 2 + roofHeight / 2, 0);
  house.add(chimney);

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
    roofMaterial
  );
  roof.position.y = baseHeight / 2 + roofHeight / 2;
  roof.castShadow = true;
  church.add(roof);

  // Door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 3, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x654321 })
  );
  door.position.set(0, -baseHeight / 2 + 1.5, 2.05);
  church.add(door);

  // Stained glass windows
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0x87ceeb,
    transparent: true,
    opacity: 0.8,
  });
  const windowGeom = new THREE.BoxGeometry(1, 2, 0.1);
  const window1 = new THREE.Mesh(windowGeom, windowMaterial);
  window1.position.set(-2, 0, 2.05);
  const window2 = window1.clone();
  window2.position.x = 2;
  church.add(window1);
  church.add(window2);

  // Simple cross atop the roof
  const crossMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 });
  const vertical = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 1, 0.2),
    crossMaterial
  );
  vertical.position.set(0, baseHeight / 2 + roofHeight + 0.5, 0);
  const horizontal = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.2, 0.2),
    crossMaterial
  );
  horizontal.position.copy(vertical.position);
  church.add(vertical);
  church.add(horizontal);

  return church;
}
