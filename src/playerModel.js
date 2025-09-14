// src/playerModel.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class PlayerModel {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.model = null;
    this.mixer = null;
    this.actions = { idle: null, walk: null, interact: null };
    this.currentAction = null;
    this.state = { yaw: 0, pitch: 0 };
    this.isMoving = false;

    // Use provided model path or fall back to hosted default. If the model
    // fails to load, a simple placeholder mesh will be added instead.
    this.loadModel(
      options.modelPath ||
        'https://dmaher42.github.io/Write-the-Realm/assets/models/guardianCharacter.glb'
    );
  }

  loadModel(path) {
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        this.model = gltf.scene;
        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        this.group.add(this.model);

        // setup animation mixer
        this.mixer = new THREE.AnimationMixer(this.model);

        // find clips by name (adjust names to match your GLB)
        const idleClip =
          THREE.AnimationClip.findByName(gltf.animations, 'Idle') ||
          THREE.AnimationClip.findByName(gltf.animations, 'Survey');
        const walkClip =
          THREE.AnimationClip.findByName(gltf.animations, 'Walk') ||
          THREE.AnimationClip.findByName(gltf.animations, 'Run');
        const interactClip =
          THREE.AnimationClip.findByName(gltf.animations, 'Interact') ||
          THREE.AnimationClip.findByName(gltf.animations, 'Wave');

        if (idleClip) this.actions.idle = this.mixer.clipAction(idleClip);
        if (walkClip) this.actions.walk = this.mixer.clipAction(walkClip);
        if (interactClip) {
          const action = this.mixer.clipAction(interactClip);
          action.loop = THREE.LoopOnce;
          action.clampWhenFinished = true;
          this.actions.interact = action;
        }

        // Start idle by default
        if (this.actions.idle) {
          this.currentAction = this.actions.idle;
          this.currentAction.play();
        }

        // revert to idle/walk when interaction finishes
        if (this.actions.interact) {
          this.mixer.addEventListener('finished', (e) => {
            if (e.action === this.actions.interact) {
              const next = this.isMoving && this.actions.walk
                ? this.actions.walk
                : this.actions.idle;
              next?.reset().fadeIn(0.2).play();
              this.currentAction = next;
            }
          });
        }
      },
      undefined,
      (error) => {
        console.error('Error loading player model:', error);
        const placeholder = new THREE.Mesh(
          new THREE.BoxGeometry(1, 2, 1),
          new THREE.MeshStandardMaterial({ color: 0x808080 })
        );
        placeholder.castShadow = true;
        placeholder.receiveShadow = true;
        this.group.add(placeholder);
      }
    );
  }

  update(delta) {
    const d = delta !== undefined ? delta : 0;
    if (this.mixer) {
      this.mixer.update(d);
    }
  }

  // rotate the player to face movement direction
  setDirection(dir) {
    if (!dir || dir.lengthSq() === 0) return;
    const yaw = Math.atan2(dir.x, dir.z);
    this.state.yaw = yaw;
    this.group.rotation.y = yaw;
  }

  // Switches action, fading from current to new
  fadeTo(actionName, fadeDuration = 0.5) {
    const next = this.actions[actionName];
    if (!next || this.currentAction === next) return;

    next.reset();
    next.play();
    if (this.currentAction) {
      this.currentAction.crossFadeTo(next, fadeDuration, false);
    }

    this.currentAction = next;
  }
}
