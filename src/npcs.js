import * as THREE from 'three';
import { showDialogue } from './ui.js';

function createNPC(name, color, dialogue, quest, radius = 2) {
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

  return {
    name,
    mesh: group,
    dialogue,
    quest,
    radius,
    triggerDialogue() {
      showDialogue({ name, dialogue, quest });
    },
  };
}

export function createVillageElder() {
  return createNPC(
    'Village Elder',
    0x8b4513,
    'Our village needs your help. Seek the ancient relic in the forest.',
    {
      title: 'The Elder\'s Request',
      objective: 'Retrieve the relic from the forest',
    }
  );
}

export function createFisherman() {
  return createNPC(
    'Fisherman',
    0x1e90ff,
    'The tides behave strangely. Investigate the shoreline for me.',
    {
      title: 'Strange Tides',
      objective: 'Investigate the shoreline for anomalies',
    }
  );
}

export function createSageOfTheTides() {
  return createNPC(
    'Sage of the Tides',
    0x228b22,
    'Bring me a pearl so I may divine the future.',
    {
      title: 'Wisdom of the Tides',
      objective: 'Bring a pearl to the Sage',
    }
  );
}
