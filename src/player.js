import * as THREE from 'three';

export function createPlayer() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 2, 12),
    new THREE.MeshStandardMaterial({ color: 0x0077ff })
  );
  body.castShadow = body.receiveShadow = true;
  group.add(body);
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffe0bd })
  );
  head.position.y = 1.2;
  head.castShadow = true;
  group.add(head);
  return group;
}
