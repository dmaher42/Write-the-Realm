import * as THREE from 'three';
import {
  createHut,
  createFarmRow,
  createLordHouse,
  createChurch,
} from '../assets/sprites/villageStructures.js';
import { registerNPCs } from './controls.js';
import {
  createVillageElder,
  createFisherman,
  createSageOfTheTides,
} from './npcs.js';

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
  // Start the camera farther back and slightly above the scene so that the
  // entire village is visible on load. Looking at the origin keeps the
  // village centred in view.
  camera.position.set(0, 5, 20);
  camera.lookAt(0, 0, 0);

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

  // Structures
  const hut1 = createHut();
  hut1.position.set(-5, 1, -2);
  targetScene.add(hut1);

  const hut2 = createHut();
  hut2.position.set(8, 1, 4);
  targetScene.add(hut2);

  const hut3 = createHut();
  hut3.position.set(-10, 1, 3);
  targetScene.add(hut3);

  const farm1 = createFarmRow();
  farm1.position.set(-2, 0, -8);
  targetScene.add(farm1);

  const farm2 = createFarmRow();
  farm2.position.set(5, 0, -9);
  targetScene.add(farm2);

  const house1 = createLordHouse();
  house1.position.set(5, 1.5, -2);
  house1.rotation.y = Math.PI / 4;
  targetScene.add(house1);

  const house2 = createLordHouse();
  house2.position.set(-6, 1.5, 6);
  house2.rotation.y = -Math.PI / 6;
  targetScene.add(house2);

  const church = createChurch();
  church.position.set(-8, 3, -2);
  church.rotation.y = -Math.PI / 2;
  targetScene.add(church);

  // NPCs
  const elder = createVillageElder();
  elder.mesh.position.set(-8, 1, -4);
  targetScene.add(elder.mesh);

  const fisherman = createFisherman();
  fisherman.mesh.position.set(2, 1, -6);
  targetScene.add(fisherman.mesh);

  const sage = createSageOfTheTides();
  sage.mesh.position.set(0, 1, 4);
  targetScene.add(sage.mesh);

  registerNPCs([elder, fisherman, sage]);
}
