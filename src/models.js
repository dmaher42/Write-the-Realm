import * as THREE from 'three';
import { makeGLTFLoader } from './loaders.js';

let _loader;
export function initModelLoader(renderer) {
  _loader = makeGLTFLoader(renderer);
}

export async function loadGLB(path) {
  return new Promise((res, rej) => {
    _loader.load(path, (gltf) => res(gltf), undefined, rej);
  });
}

// Prefabs return THREE.Group ready to add + cast/receive shadow flags set
export async function spawnHut(position, rotationY = 0) {
  let root;
  try {
    const gltf = await loadGLB('assets/models/hut_stylized.glb');
    root = gltf.scene;
    root.traverse((m) => {
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
        if (m.material) {
          if (m.material.map) m.material.map.colorSpace = THREE.SRGBColorSpace;
          m.material.roughness = Math.min(1, m.material.roughness ?? 1);
          m.material.metalness = Math.min(0.05, m.material.metalness ?? 0);
          if (m.material.normalMap) {
            m.material.normalScale.set(0.5, 0.5);
          }
        }
      }
    });
  } catch (err) {
    console.warn('hut model missing, using placeholder', err);
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    root = new THREE.Group();
    root.add(mesh);
  }
  root.scale.setScalar(1.0);
  root.position.copy(position);
  root.rotation.y = rotationY;
  return root;
}

export async function spawnTree(position, scale = 1.0) {
  let root;
  try {
    const gltf = await loadGLB('assets/models/tree_stylized.glb');
    root = gltf.scene;
    root.traverse((m) => {
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
        if (m.material) {
          if (m.material.map) m.material.map.colorSpace = THREE.SRGBColorSpace;
          m.material.roughness = Math.min(1, m.material.roughness ?? 1);
          m.material.metalness = Math.min(0.05, m.material.metalness ?? 0);
          if (m.material.normalMap) {
            m.material.normalScale.set(0.5, 0.5);
          }
        }
      }
    });
  } catch (err) {
    console.warn('tree model missing, using placeholder', err);
    const trunkGeom = new THREE.CylinderGeometry(0.2, 0.3, 1, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
    const trunk = new THREE.Mesh(trunkGeom, trunkMat);
    trunk.position.y = 0.5;
    trunk.castShadow = trunk.receiveShadow = true;

    const leavesGeom = new THREE.ConeGeometry(0.8, 1.5, 8);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const leaves = new THREE.Mesh(leavesGeom, leavesMat);
    leaves.position.y = 1.75;
    leaves.castShadow = leaves.receiveShadow = true;

    root = new THREE.Group();
    root.add(trunk);
    root.add(leaves);
  }
  root.scale.setScalar(scale);
  root.position.copy(position);
  return root;
}

export function computeAABB(root) {
  const box = new THREE.Box3().setFromObject(root);
  root.userData.aabb = box;
  return box;
}
