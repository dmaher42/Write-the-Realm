import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
raycaster.far = 20;

export function setPickRange(dist) {
  raycaster.far = dist;
}

export function updatePointer(event, domElement) {
  const rect = domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

export function pick(camera, targets) {
  raycaster.setFromCamera(pointer, camera);
  return raycaster.intersectObjects(targets, true);
}
