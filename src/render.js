import * as THREE from 'three';

let scene;
let camera;
let renderer;

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

  // Add simple lighting so that meshes using standard materials are visible
  // when the scene initializes. Without at least an ambient light the imported
  // models render completely black, which made characters appear to be missing.
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 10, 7.5);
  scene.add(directional);

  window.addEventListener('resize', handleResize);
  return { scene, camera, renderer };
}

/**
 * Basic animation loop that continuously renders the scene.
 */
export function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
