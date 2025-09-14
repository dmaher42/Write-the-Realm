import * as THREE from 'three';
import {
  createHut,
  createFarmRow,
  createLordHouse,
  createChurch,
} from '../assets/sprites/villageStructures.js';
import { spawnNPCs } from './npcs.js';
import { createPath, createFence, createTree, createRock } from './environment.js';

export let scene;
export let camera;
export let renderer;
export let composer = null;

function handleResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  if (composer) composer.setSize(width, height);
}

/**
 * Initialize basic Three.js renderer and camera.
 * Appends the canvas to the provided container (defaults to document.body).
 */
export function initRenderer(container = document.body) {
  scene = new THREE.Scene();
  const FOG_COLOR = 0x9cc4e4;
  scene.fog = new THREE.Fog(FOG_COLOR, 35, 140);
  scene.background = new THREE.Color(FOG_COLOR);
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);
  // Start the camera farther back and slightly above the scene so that the
  // entire village is visible on load. Looking at the origin keeps the
  // village centred in view.
  camera.position.set(0, 5, 20);
  camera.lookAt(0, 0, 0);

  // Add simple lighting so that meshes using standard materials are visible
  // when the scene initializes. Without at least an ambient light the imported
  // models render completely black, which made characters appear to be missing.
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xfff0e0, 1.0);
  directional.position.set(10, 15, 10);
  directional.castShadow = true;
  scene.add(directional);

  window.addEventListener('resize', handleResize);

  const npcs = populateVillage(scene);
  return { scene, camera, renderer, npcs };
}

export function setComposer(instance) {
  composer = instance;
  handleResize();
}

/**
 * Add basic terrain and a handful of structures to the scene.
 */
export function populateVillage(targetScene = scene) {
  if (!targetScene) return [];

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x228b22 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  targetScene.add(ground);

  const pathA = createPath([
    new THREE.Vector3(-15, 0, -5),
    new THREE.Vector3(-5, 0, 0),
    new THREE.Vector3(5, 0, 0),
    new THREE.Vector3(15, 0, -5),
  ]);
  pathA.position.y = 0.01;
  targetScene.add(pathA);

  const pathB = createPath([
    new THREE.Vector3(-10, 0, 6),
    new THREE.Vector3(-3, 0, 4),
    new THREE.Vector3(4, 0, 8),
  ]);
  pathB.position.y = 0.01;
  targetScene.add(pathB);

  const fence1 = createFence(12);
  fence1.position.set(-15, 0, -6);
  fence1.rotation.y = Math.PI / 2;
  targetScene.add(fence1);
  const fence2 = createFence(10);
  fence2.position.set(5, 0, 5);
  fence2.rotation.y = -Math.PI / 4;
  targetScene.add(fence2);

  const hut1 = createHut();
  hut1.position.set(-6, 1, -4);
  targetScene.add(hut1);

  const hut2 = createHut();
  hut2.position.set(7, 1, 5);
  hut2.rotation.y = Math.PI / 8;
  targetScene.add(hut2);

  const hut3 = createHut();
  hut3.position.set(-2, 1, 2);
  hut3.rotation.y = -Math.PI / 5;
  targetScene.add(hut3);

  const farm1 = createFarmRow();
  farm1.position.set(-4, 0, -9);
  targetScene.add(farm1);

  const farm2 = createFarmRow();
  farm2.position.set(6, 0, -7);
  targetScene.add(farm2);

  const house1 = createLordHouse();
  house1.position.set(3, 1.5, -3);
  house1.rotation.y = Math.PI / 4;
  targetScene.add(house1);

  const church = createChurch();
  church.position.set(-9, 3, 1);
  church.rotation.y = Math.PI / 2;
  targetScene.add(church);

  const propCount = 8 + Math.floor(Math.random() * 5);
  for (let i = 0; i < propCount; i++) {
    const prop = Math.random() > 0.5 ? createTree() : createRock();
    prop.position.set(Math.random() * 40 - 20, 0, Math.random() * 40 - 20);
    prop.rotation.y = Math.random() * Math.PI * 2;
    targetScene.add(prop);
  }

  const npcs = spawnNPCs(targetScene);
  return npcs;
}
