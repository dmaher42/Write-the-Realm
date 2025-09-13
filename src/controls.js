/**
 * Keyboard helpers to move the active camera with basic WASD/E controls.
 * W/A/S/D move along the X/Z axes while E raises the camera on the Y axis.
 */
const keys = {};
let camera;
const SPEED = 0.1;

function onKeyDown(event) {
  keys[event.key.toLowerCase()] = true;
}

function onKeyUp(event) {
  keys[event.key.toLowerCase()] = false;
}

/**
 * Register event listeners and track the provided camera.
 */
export function initControls(targetCamera) {
  camera = targetCamera;
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

/**
 * Update the camera's position based on currently pressed keys.
 */
export function updateControls() {
  if (!camera) return;

  if (keys['w']) camera.position.z -= SPEED;
  if (keys['s']) camera.position.z += SPEED;
  if (keys['a']) camera.position.x -= SPEED;
  if (keys['d']) camera.position.x += SPEED;
  if (keys['e']) camera.position.y += SPEED;
}
