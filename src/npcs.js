import * as THREE from 'three';
import { NPCModel } from './npcModel.js';

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
  head.receiveShadow = true;
  group.add(head);

  group.position.copy(position);
  group.userData = { npcName: name, interactRadius, root: group };
  return group;
}

export const npcModels = [];

export function spawnNPCs(scene) {
  const list = [];

  const elder = new NPCModel(scene, {
    name: 'Village Elder',
    position: new THREE.Vector3(-8, 1, -1),
    color: 0x8b4513,
    modelPath: '../assets/models/elder.glb',
  });
  npcModels.push(elder);
  list.push(elder.group);

  const fisherman = new NPCModel(scene, {
    name: 'Fisherman',
    position: new THREE.Vector3(4, 1, -6),
    color: 0x1e90ff,
    modelPath: '../assets/models/fisherman.glb',
  });
  npcModels.push(fisherman);
  list.push(fisherman.group);

  const sage = new NPCModel(scene, {
    name: 'Sage of the Tides',
    position: new THREE.Vector3(1, 1, 4),
    color: 0x228b22,
    modelPath: '../assets/models/sage.glb',
  });
  npcModels.push(sage);
  list.push(sage.group);

  return list;
}
