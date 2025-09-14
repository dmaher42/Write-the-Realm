import * as THREE from 'three';

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let targets = [];
let maxDistance = 18;
let hovered = null;

function applyHighlight(obj) {
  obj.traverse((child) => {
    if (child.isMesh && child.material && child.material.emissive) {
      child.userData._origEmissive = child.material.emissive.getHex();
      child.material.emissive.setHex(0x333333);
    }
  });
}

function removeHighlight(obj) {
  obj.traverse((child) => {
    if (child.isMesh && child.material && child.material.emissive && child.userData._origEmissive !== undefined) {
      child.material.emissive.setHex(child.userData._origEmissive);
      delete child.userData._origEmissive;
    }
  });
}

export function setPickTargets(meshes, opts = {}) {
  targets = meshes || [];
  if (opts.maxDistance !== undefined) maxDistance = opts.maxDistance;
}

export function updatePointerFromEvent(evt, dom = window) {
  let rect = {
    left: 0,
    top: 0,
    width: dom.innerWidth || window.innerWidth,
    height: dom.innerHeight || window.innerHeight,
  };
  if (dom && dom.getBoundingClientRect) {
    rect = dom.getBoundingClientRect();
  }
  pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
}

export function pick(camera) {
  raycaster.far = maxDistance;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(targets, true);
  let obj = hits.length > 0 ? hits[0].object : null;
  while (obj && !targets.includes(obj)) obj = obj.parent;
  if (hovered && hovered !== obj) {
    removeHighlight(hovered);
    hovered = null;
  }
  if (obj && hovered !== obj) {
    applyHighlight(obj);
    hovered = obj;
  }
  return obj;
}
