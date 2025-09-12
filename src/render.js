import * as THREE from 'three';

let scene;
let camera;
let renderer;

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
  container.appendChild(renderer.domElement);
  camera.position.z = 5;
}

/**
 * Basic animation loop that continuously renders the scene.
 */
export function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
