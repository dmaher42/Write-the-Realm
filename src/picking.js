import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

export function setPointer(event, domElement) {
  const rect = domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

export function pick(targets, camera) {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(targets, true);
  return intersects.length > 0 ? intersects[0] : null;
}
