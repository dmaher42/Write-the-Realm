import * as THREE from 'three';

export function createNPC(name, position, color = 0x8b4513, interactRadius = 2) {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, 2, 8),
    new THREE.MeshStandardMaterial({ color })
  );
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffe0bd })
  );
  head.position.y = 1.25;
  head.castShadow = true;
  group.add(head);

  group.position.copy(position);
  group.userData = { npcName: name, interactRadius, root: group };
  return group;
}

export function spawnNPCs(scene) {
  const list = [];

  const elder = createNPC('Village Elder', new THREE.Vector3(-8, 1, -1), 0x8b4513);
  scene.add(elder);
  list.push(elder);

  const fisherman = createNPC('Fisherman', new THREE.Vector3(4, 1, -6), 0x1e90ff);
  scene.add(fisherman);
  list.push(fisherman);

  const sage = createNPC('Sage of the Tides', new THREE.Vector3(1, 1, 4), 0x228b22);
  scene.add(sage);
  list.push(sage);

  return list;
}
