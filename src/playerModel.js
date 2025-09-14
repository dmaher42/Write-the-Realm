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

    this.loadModel(options.modelPath || 'assets/models/guardianCharacter.glb');
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
        const idleClip = THREE.AnimationClip.findByName(gltf.animations, 'Idle');
        const walkClip = THREE.AnimationClip.findByName(gltf.animations, 'Walk');
        const interactClip = THREE.AnimationClip.findByName(
          gltf.animations,
          'Interact'
        );

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
