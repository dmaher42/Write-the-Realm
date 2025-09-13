// Helper module to manage keyboard controls for camera movement.
// Provides initControls to register key handlers and updateControls
// to move the camera each frame based on pressed keys.

let camera;
const keyState = {
  w: false,
  a: false,
  s: false,
  d: false,
  e: false,
};
let movementSpeed = 5;

function onKeyDown(event) {
  const key = event.key.toLowerCase();
  if (keyState.hasOwnProperty(key)) {
    keyState[key] = true;
    event.preventDefault();
  }
}

function onKeyUp(event) {
  const key = event.key.toLowerCase();
  if (keyState.hasOwnProperty(key)) {
    keyState[key] = false;
    event.preventDefault();
  }
}

export function initControls(cam, speed = 5) {
  camera = cam;
  movementSpeed = speed;
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

export function updateControls(delta) {
  if (!camera) return;
  const distance = movementSpeed * delta;
  if (keyState.w) camera.position.z -= distance;
  if (keyState.s) camera.position.z += distance;
  if (keyState.a) camera.position.x -= distance;
  if (keyState.d) camera.position.x += distance;
  // Placeholder for interact key 'E'
  if (keyState.e) {
    // Future interaction logic can be added here
  }
}
