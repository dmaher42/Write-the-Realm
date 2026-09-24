import * as THREE from 'three';

// Shared palette and geometry keep the village cheap to draw. All buildings
// stand on y=0 and face the village entrance (+z).
const mat = {
  plaster: new THREE.MeshStandardMaterial({ color: 0xe8d6ac, roughness: 0.95 }),
  gable: new THREE.MeshStandardMaterial({ color: 0xe8d6ac, roughness: 0.95, side: THREE.DoubleSide }),
  stone: new THREE.MeshStandardMaterial({ color: 0xa99d89, roughness: 1 }),
  paleStone: new THREE.MeshStandardMaterial({ color: 0xd7c9ab, roughness: 1 }),
  timber: new THREE.MeshStandardMaterial({ color: 0x684e3c, roughness: 1 }),
  darkTimber: new THREE.MeshStandardMaterial({ color: 0x352f30, roughness: 1 }),
  roof: new THREE.MeshStandardMaterial({ color: 0x315d65, roughness: 0.9 }),
  roofTrim: new THREE.MeshStandardMaterial({ color: 0x24464f, roughness: 0.9 }),
  copper: new THREE.MeshStandardMaterial({ color: 0xb77f53, roughness: 0.75 }),
  amber: new THREE.MeshStandardMaterial({ color: 0xe9ba6a, emissive: 0xa9632a, emissiveIntensity: 0.28 }),
  blueGlass: new THREE.MeshStandardMaterial({ color: 0x7bb1ab, emissive: 0x254b58, emissiveIntensity: 0.2 }),
  banner: new THREE.MeshStandardMaterial({ color: 0xb96751, roughness: 1, side: THREE.DoubleSide }),
  soil: new THREE.MeshStandardMaterial({ color: 0x5c4835, roughness: 1 }),
  leaves: new THREE.MeshStandardMaterial({ color: 0x648751, roughness: 1, flatShading: true }),
  crops: new THREE.MeshStandardMaterial({ color: 0x9eae65, roughness: 1 }),
};
const cube = new THREE.BoxGeometry(1, 1, 1);
const octagon = new THREE.CylinderGeometry(1, 1, 1, 8);
const spire = new THREE.ConeGeometry(1, 1, 8);

function block(group, material, width, height, depth, x, y, z) {
  const mesh = new THREE.Mesh(cube, material);
  mesh.scale.set(width, height, depth);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function tapered(group, geometry, material, width, height, depth, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(width, height, depth);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function pitchedRoof(group, width, depth, eave, rise, z) {
  const half = width / 2;
  const slope = Math.atan2(rise, half);
  for (const side of [-1, 1]) {
    const panel = block(group, mat.roof, Math.hypot(half, rise) + 0.13, 0.2,
      depth + 0.48, side * half / 2, eave + rise / 2, z);
    panel.rotation.z = -side * slope;
  }
  const outline = new THREE.Shape();
  outline.moveTo(-half + 0.12, 0);
  outline.lineTo(half - 0.12, 0);
  outline.lineTo(0, rise - 0.1);
  outline.closePath();
  const gable = new THREE.ShapeGeometry(outline);
  for (const end of [-1, 1]) {
    const face = new THREE.Mesh(gable, mat.gable);
    face.position.set(0, eave, z + end * depth / 2);
    face.castShadow = true;
    group.add(face);
  }
  block(group, mat.roofTrim, 0.16, 0.15, depth + 0.6, 0, eave + rise + 0.04, z);
}

function windowFrame(group, x, y, z, width = 0.68, height = 0.72) {
  block(group, mat.timber, width + 0.16, height + 0.16, 0.12, x, y, z);
  block(group, mat.amber, width, height, 0.14, x, y, z + 0.1);
  block(group, mat.darkTimber, 0.07, height, 0.16, x, y, z + 0.19);
}

export function createHut() {
  const hut = new THREE.Group();
  hut.name = 'Village cottage';
  block(hut, mat.stone, 4.6, 0.26, 4.12, 0, 0.13, 0);
  block(hut, mat.plaster, 4.18, 2.48, 3.72, 0, 1.5, 0);
  for (const x of [-1.98, 1.98]) {
    block(hut, mat.timber, 0.16, 2.42, 0.19, x, 1.48, 1.94);
  }
  block(hut, mat.timber, 4.14, 0.17, 0.18, 0, 2.65, 1.95);
  pitchedRoof(hut, 4.9, 4.05, 2.75, 1.35, 0);
  block(hut, mat.darkTimber, 0.94, 1.83, 0.15, 0, 1.14, 1.99);
  block(hut, mat.timber, 1.12, 0.16, 0.3, 0, 2.1, 2.04);
  block(hut, mat.copper, 0.12, 0.12, 0.08, 0.32, 1.17, 2.1);
  block(hut, mat.paleStone, 1.28, 0.14, 0.69, 0, 0.13, 2.23);
  windowFrame(hut, -1.36, 1.64, 1.99);
  windowFrame(hut, 1.36, 1.64, 1.99);
  block(hut, mat.stone, 0.48, 1.18, 0.58, 1.18, 3.72, -0.76);
  block(hut, mat.paleStone, 0.62, 0.14, 0.7, 1.18, 4.34, -0.76);
  return hut;
}

export function createFarmRow() {
  const farm = new THREE.Group();
  farm.name = 'Market garden';
  for (const x of [-2.1, 0, 2.1]) {
    block(farm, mat.timber, 1.52, 0.24, 4.46, x, 0.16, 0);
    block(farm, mat.soil, 1.33, 0.13, 4.24, x, 0.31, 0);
  }
  // One instanced mesh draws all 36 small plants in the raised beds.
  const leaves = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 4), mat.leaves, 36);
  const seedling = new THREE.Object3D();
  let index = 0;
  for (const x of [-2.1, 0, 2.1]) {
    for (const z of [-1.65, -0.98, -0.33, 0.33, 0.98, 1.65]) {
      for (const offset of [-0.33, 0.33]) {
        seedling.position.set(x + offset, 0.54, z);
        seedling.scale.set(0.22, 0.46, 0.22);
        seedling.updateMatrix();
        leaves.setMatrixAt(index++, seedling.matrix);
      }
    }
  }
  leaves.instanceMatrix.needsUpdate = true;
  leaves.castShadow = true;
  farm.add(leaves);
  // Leave a gap at the front for the path into the garden.
  for (const z of [-2.5, 2.5]) {
    for (const x of [-3.55, -1.1, 1.1, 3.55]) {
      block(farm, mat.timber, 0.15, 1.02, 0.15, x, 0.51, z);
    }
    for (const x of [-2.33, 2.33]) {
      block(farm, mat.timber, 2.4, 0.09, 0.12, x, 0.73, z);
    }
  }
  for (const x of [-3.55, 3.55]) {
    block(farm, mat.timber, 0.12, 0.09, 5.0, x, 0.73, 0);
  }
  block(farm, mat.timber, 0.72, 0.5, 0.68, 2.85, 0.25, -2.02);
  block(farm, mat.crops, 0.52, 0.15, 0.5, 2.85, 0.56, -2.02);
  return farm;
}

export function createLordHouse() {
  const keep = new THREE.Group();
  keep.name = 'Kokura keep';
  block(keep, mat.stone, 8.55, 0.35, 6.5, 0, 0.18, 0);
  block(keep, mat.paleStone, 7.4, 4.6, 5.65, 0, 2.57, -0.23);
  block(keep, mat.stone, 7.62, 0.32, 5.75, 0, 0.51, -0.23);
  pitchedRoof(keep, 7.9, 6.1, 4.94, 1.75, -0.23);
  for (const x of [-3.62, 3.62]) {
    tapered(keep, octagon, mat.stone, 1.21, 6.55, 1.21, x, 3.28, -1.12);
    tapered(keep, spire, mat.roof, 1.59, 1.87, 1.59, x, 7.47, -1.12);
    block(keep, mat.darkTimber, 0.22, 0.77, 0.09, x, 4.5, 0.13);
    block(keep, mat.amber, 0.12, 0.46, 0.12, x, 4.52, 0.2);
  }
  block(keep, mat.darkTimber, 1.5, 2.45, 0.2, 0, 1.52, 2.72);
  block(keep, mat.timber, 1.8, 0.2, 0.37, 0, 2.8, 2.8);
  block(keep, mat.copper, 0.16, 0.16, 0.12, 0.46, 1.36, 2.87);
  block(keep, mat.paleStone, 1.87, 0.2, 0.89, 0, 0.19, 3.12);
  windowFrame(keep, -2.35, 2.85, 2.7, 0.75, 1.1);
  windowFrame(keep, 2.35, 2.85, 2.7, 0.75, 1.1);
  const flag = new THREE.Shape();
  flag.moveTo(-0.38, 0.6);
  flag.lineTo(0.38, 0.6);
  flag.lineTo(0.38, -0.45);
  flag.lineTo(0, -0.76);
  flag.lineTo(-0.38, -0.45);
  flag.closePath();
  const banner = new THREE.Mesh(new THREE.ShapeGeometry(flag), mat.banner);
  banner.position.set(0, 4.09, 2.7);
  keep.add(banner);
  block(keep, mat.amber, 0.13, 0.13, 0.1, 0, 3.97, 2.77);
  return keep;
}

export function createChurch() {
  const chapel = new THREE.Group();
  chapel.name = 'Harbour chapel';
  block(chapel, mat.stone, 5.95, 0.35, 7.2, 0, 0.18, 0);
  block(chapel, mat.plaster, 5.25, 3.86, 6.55, 0, 2.12, -0.12);
  pitchedRoof(chapel, 5.86, 6.91, 4.05, 2.03, -0.12);
  block(chapel, mat.paleStone, 2.03, 5.7, 2.1, 0, 3.02, 3.2);
  block(chapel, mat.stone, 2.28, 0.29, 2.32, 0, 5.94, 3.2);
  tapered(chapel, spire, mat.copper, 1.51, 2.3, 1.51, 0, 7.21, 3.2);
  tapered(chapel, octagon, mat.amber, 0.13, 0.3, 0.13, 0, 8.51, 3.2);
  tapered(chapel, spire, mat.amber, 0.31, 0.47, 0.31, 0, 8.89, 3.2);
  block(chapel, mat.darkTimber, 1.11, 2.08, 0.14, 0, 1.28, 4.32);
  block(chapel, mat.timber, 1.3, 0.15, 0.22, 0, 2.42, 4.38);
  block(chapel, mat.copper, 0.13, 0.13, 0.09, 0.37, 1.18, 4.41);
  block(chapel, mat.paleStone, 1.59, 0.17, 0.67, 0, 0.17, 4.5);
  for (const x of [-2.65, 2.65]) {
    for (const z of [-1.77, 0.52]) {
      block(chapel, mat.timber, 0.13, 1.34, 0.85, x, 2.25, z);
      block(chapel, mat.blueGlass, 0.13, 1.1, 0.54, x + Math.sign(x) * 0.05, 2.27, z);
    }
  }
  block(chapel, mat.blueGlass, 0.52, 0.86, 0.15, 0, 4.68, 4.36);
  block(chapel, mat.darkTimber, 0.1, 0.92, 0.17, 0, 4.68, 4.45);
  return chapel;
}
