/**
 * Keyboard helpers to move the active camera with basic WASD/E controls.
 * W/A/S/D move along the X/Z axes while E raises the camera on the Y axis.
 * Arrow keys and Q/R provide camera rotation/look controls.
 */
const keys = {};
let camera;
const SPEED = 0.1;
const ROTATION_SPEED = 0.02;

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
 * Update the camera's position and rotation based on currently pressed keys.
 */
export function updateControls() {
  if (!camera) return;

  // Movement controls (WASD + E for up)
  if (keys['w']) camera.position.z -= SPEED;
  if (keys['s']) camera.position.z += SPEED;
  if (keys['a']) camera.position.x -= SPEED;
  if (keys['d']) camera.position.x += SPEED;
  if (keys['e']) camera.position.y += SPEED;
  if (keys['q']) camera.position.y -= SPEED; // Add Q for down movement
  
  // Rotation controls (Arrow keys for look/rotation)
  if (keys['arrowleft']) camera.rotation.y += ROTATION_SPEED;
  if (keys['arrowright']) camera.rotation.y -= ROTATION_SPEED;
  if (keys['arrowup']) camera.rotation.x += ROTATION_SPEED;
  if (keys['arrowdown']) camera.rotation.x -= ROTATION_SPEED;
  
  // Clamp vertical rotation to prevent over-rotation
  camera.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, camera.rotation.x));
}
