import * as THREE from 'three';
import { spawnNPCs } from './npcs.js';
import { createPath, createFence } from './environment.js';
import { initModelLoader, spawnHut, spawnTree } from './models.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { PMREMGenerator } from 'three/src/extras/PMREMGenerator.js';

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
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  // Start the camera farther back and slightly above the scene so that the
  // entire village is visible on load. Looking at the origin keeps the
  // village centred in view.
  camera.position.set(0, 5, 20);
  camera.lookAt(0, 0, 0);

  // Add simple lighting so that meshes using standard materials are visible
  // when the scene initializes. Without at least an ambient light the imported
  // models render completely black, which made characters appear to be missing.
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffe3b0, 1.1);
  directional.position.set(10, 15, 10);
  directional.castShadow = true;
  scene.add(directional);

  const pmrem = new PMREMGenerator(renderer);
  new RGBELoader()
    .setPath('assets/env/')
    .load('studio_small_08_1k.hdr', (hdr) => {
      const env = pmrem.fromEquirectangular(hdr).texture;
      scene.environment = env; // subtle reflections for wet stone/wood
      scene.background = new THREE.Color(0x9cc4e4); // keep sky color
      hdr.dispose(); pmrem.dispose();
    });

  window.addEventListener('resize', handleResize);

  initModelLoader(renderer);

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

  (async () => {
    const hut1 = await spawnHut(new THREE.Vector3(-4, 0, -2), Math.PI * 0.15);
    targetScene.add(hut1);
    const hut2 = await spawnHut(new THREE.Vector3(5, 0, -5), -Math.PI * 0.25);
    targetScene.add(hut2);

    for (let i = 0; i < 6; i++) {
      const t = await spawnTree(
        new THREE.Vector3(-8 + Math.random() * 16, 0, -6 + Math.random() * 8),
        0.9 + Math.random() * 0.4
      );
      targetScene.add(t);
    }
    // TODO: spawnRock/spawnFenceSection/spawnMarketStall
  })();

  const npcs = spawnNPCs(targetScene);
  return npcs;
}
