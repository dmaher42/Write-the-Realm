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
  const gltf = await loadGLB('assets/models/hut_stylized.glb');
  const root = gltf.scene;
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
  root.scale.setScalar(1.0);
  root.position.copy(position);
  root.rotation.y = rotationY;
  return root;
}

export async function spawnTree(position, scale = 1.0) {
  const gltf = await loadGLB('assets/models/tree_stylized.glb');
  const root = gltf.scene;
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
  root.scale.setScalar(scale);
  root.position.copy(position);
  return root;
}

export function computeAABB(root) {
  const box = new THREE.Box3().setFromObject(root);
  root.userData.aabb = box;
  return box;
}
