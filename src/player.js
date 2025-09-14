import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function createPlayer() {
  const group = new THREE.Group();
  const loader = new GLTFLoader();
    // guardianCharacter model loaded from hosted asset; required for gameplay.
    loader.load(
      'https://dmaher42.github.io/Write-the-Realm/assets/models/guardianCharacter.glb',
      (gltf) => {
      const model = gltf.scene;
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      group.add(model);

      const mixer = new THREE.AnimationMixer(model);
      const idleClip = THREE.AnimationClip.findByName(gltf.animations, 'Idle');
      const walkClip =
        THREE.AnimationClip.findByName(gltf.animations, 'Walk') ||
        THREE.AnimationClip.findByName(gltf.animations, 'Run');
      const interactClip =
        THREE.AnimationClip.findByName(gltf.animations, 'Interact') ||
        THREE.AnimationClip.findByName(gltf.animations, 'Wave');

      const idleAction = idleClip ? mixer.clipAction(idleClip) : null;
      const walkAction = walkClip ? mixer.clipAction(walkClip) : null;
      const interactAction = interactClip ? mixer.clipAction(interactClip) : null;

      if (interactAction) {
        interactAction.loop = THREE.LoopOnce;
        interactAction.clampWhenFinished = true;
      }

      if (idleAction) idleAction.play();

      group.mixer = mixer;
      group.actions = { idle: idleAction, walk: walkAction, interact: interactAction };
      group.currentAction = idleAction;

      if (interactAction) {
        mixer.addEventListener('finished', (e) => {
          if (e.action === interactAction) {
            const next = group.isMoving && walkAction ? walkAction : idleAction;
            if (group.currentAction !== next) {
              interactAction.fadeOut(0.2);
              next?.reset().fadeIn(0.2).play();
              group.currentAction = next;
            }
          }
        });
      }
      },
      undefined,
      (err) => console.error('Error loading player model', err)
    );
  return group;
}
