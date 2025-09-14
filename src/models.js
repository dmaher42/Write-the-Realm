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

// Attempt to load a model only when the page sets `window.USE_3D_MODELS`.
// This prevents unnecessary network requests for absent assets.
async function maybeLoadModel(path) {
  if (typeof window === 'undefined' || !window.USE_3D_MODELS) return null;
  try {
    const gltf = await loadGLB(path);
    return gltf.scene;
  } catch (err) {
    console.warn(`${path} missing, using placeholder`, err);
    return null;
  }
}

// Prefabs return THREE.Group ready to add + cast/receive shadow flags set
export async function spawnHut(position, rotationY = 0) {
  let root = await maybeLoadModel('assets/models/hut_stylized.glb');
  if (!root) {
    const geom = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = mesh.receiveShadow = true;
    root = new THREE.Group();
    root.add(mesh);
  } else {
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
  }
  root.scale.setScalar(1.0);
  root.position.copy(position);
  root.rotation.y = rotationY;
  return root;
}

export async function spawnTree(position, scale = 1.0) {
  let root = await maybeLoadModel('assets/models/tree_stylized.glb');
  if (!root) {
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
  } else {
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
