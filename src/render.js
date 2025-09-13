import * as THREE from 'three';
import {
  createHut,
  createFarmRow,
  createLordHouse,
  createChurch,
} from '../assets/sprites/villageStructures.js';

export let scene;
export let camera;
export let renderer;

function handleResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

/**
 * Initialize basic Three.js renderer and camera.
 * Appends the canvas to the provided container (defaults to document.body).
 */
export function initRenderer(container = document.body) {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Use a lighter background so a completely empty scene doesn't look like a
  // loading error.
  renderer.setClearColor(0x9cc4e4);
  container.appendChild(renderer.domElement);
  
  // Position camera above ground looking at the village center
  camera.position.set(-2.5, 20, 20);
  camera.lookAt(-2.5, 0, 0);

  // Add simple lighting so that meshes using standard materials are visible
  // when the scene initializes. Without at least an ambient light the imported
  // models render completely black, which made characters appear to be missing.
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 10, 7.5);
  scene.add(directional);

  window.addEventListener('resize', handleResize);

  populateVillage(scene);
  return { scene, camera, renderer };
}

/**
 * Add basic terrain and a handful of structures to the scene.
 */
export function populateVillage(targetScene = scene) {
  if (!targetScene) return;

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0x228b22 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  targetScene.add(ground);

  const hut = createHut();
  hut.position.set(-5, 1, -2);
  targetScene.add(hut);

  const farm = createFarmRow();
  farm.position.set(0, 0, -5);
  targetScene.add(farm);

  const house = createLordHouse();
  house.position.set(5, 1.5, 5);
  house.rotation.y = Math.PI / 4;
  targetScene.add(house);

  const church = createChurch();
  church.position.set(-10, 3, 5);
  church.rotation.y = -Math.PI / 2;
  targetScene.add(church);
}
