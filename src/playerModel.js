// src/playerModel.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class PlayerModel {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.model = null;
    this.mixer = null;
    this.actions = {
      idle: null,
      walk: null,
      interact: null,
    };
    this.currentAction = null;
    this.clock = new THREE.Clock();

    this.loadModel(options.modelPath || 'assets/models/guardianCharacter.glb');
  }

  loadModel(path) {
    const loader = new GLTFLoader();
    loader.load(
      path,
      (gltf) => {
        this.model = gltf.scene;
        this.model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        this.scene.add(this.model);

        // setup animation mixer
        this.mixer = new THREE.AnimationMixer(this.model);

        // find clips by name (adjust names to match your GLB)
        const idleClip     = THREE.AnimationClip.findByName(gltf.animations, 'Idle');
        const walkClip     = THREE.AnimationClip.findByName(gltf.animations, 'Walk');
        const interactClip = THREE.AnimationClip.findByName(gltf.animations, 'Interact');

        if (idleClip)     this.actions.idle     = this.mixer.clipAction(idleClip);
        if (walkClip)     this.actions.walk     = this.mixer.clipAction(walkClip);
        if (interactClip) this.actions.interact = this.mixer.clipAction(interactClip);

        // Start idle by default
        if (this.actions.idle) {
          this.currentAction = this.actions.idle;
          this.currentAction.play();
        }
      },
      undefined, 
      (error) => {
        console.error('Error loading player model:', error);
      }
    );
  }

  update() {
    const delta = this.clock.getDelta();
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }

  // Switches action, fading from current to new
  fadeTo(actionName, fadeDuration = 0.5) {
    if (!this.actions[actionName]) return;
    if (this.currentAction === this.actions[actionName]) return;

    const prev = this.currentAction;
    const next = this.actions[actionName];

    next.reset();
    next.play();
    if (prev) {
      prev.crossFadeTo(next, fadeDuration, false);
    }

    this.currentAction = next;
  }
}
