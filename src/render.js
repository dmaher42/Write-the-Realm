import * as THREE from 'three';
import { createHut, createChurch } from '../assets/sprites/villageStructures.js';

let scene;
let camera;
let renderer;
let cube;

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
  camera.position.z = 5;

  // Display a simple cube so the player doesn't see a blank screen when the
  // game boots. This placeholder geometry can be replaced with actual game
  // assets later.
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x00796b });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Add simple lighting so that meshes using standard materials are visible
  // when the scene initializes. Without at least an ambient light the imported
  // models render completely black, which made characters appear to be missing.
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 10, 7.5);
  scene.add(directional);

  window.addEventListener('resize', handleResize);
}

/**
 * Basic animation loop that continuously renders the scene.
 */
export function animate() {
  requestAnimationFrame(animate);
  if (cube) {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  }
  renderer.render(scene, camera);
}

/**
 * Set up the game scene by removing the placeholder cube and adding basic game assets.
 * This includes a ground plane, a player mesh, and two NPC structures.
 */
export function setupGameScene() {
  // Remove the blue cube placeholder
  if (cube) {
    scene.remove(cube);
    cube = null;
  }

  // Create ground plane
  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a9c4a,  // Green grass color
    roughness: 0.8 
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
  ground.position.y = -2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Create a simple player mesh (capsule representing the player character)
  const playerGeometry = new THREE.CapsuleGeometry(0.5, 2, 4, 8);
  const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x4169e1 }); // Royal blue
  const player = new THREE.Mesh(playerGeometry, playerMaterial);
  player.position.set(0, 0, 2);
  player.castShadow = true;
  scene.add(player);

  // Create NPC 1: A hut positioned to the left
  const npc1 = createHut();
  npc1.position.set(-8, -1, -5);
  scene.add(npc1);

  // Create NPC 2: A church positioned to the right
  const npc2 = createChurch();
  npc2.position.set(8, -2, -8);
  scene.add(npc2);

  // Adjust camera position for better view of the scene
  camera.position.set(0, 3, 8);
  camera.lookAt(0, 0, 0);
}
