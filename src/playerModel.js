// src/playerModel.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class PlayerModel {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.group.setDirection = (dir) => this.setDirection(dir);

    this.model = null;
    this.mixer = null;
    this.actions = { idle: null, walk: null, interact: null };
    this.currentAction = null;
    this.state = { yaw: 0, pitch: 0 };
    this.isMoving = false;

    // Use provided model path or fall back to a simple placeholder mesh.
    this.loadModel(options.modelPath);
  }

  loadModel(modelPath) {
    if (!modelPath) {
      // Fallback placeholder: a simple box mesh so the game can run without a GLB.
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
      this.model = new THREE.Mesh(geometry, material);
      this.group.add(this.model);
      return;
    }

    const loader = new GLTFLoader();
    const modelUrl = new URL(modelPath, import.meta.url).toString();
    loader.load(
      modelUrl,
      (gltf) => {
        this.model = gltf.scene;
        this.group.add(this.model);

        this.model.scale.setScalar(1.0); // tweak per asset
        this.model.rotation.y = Math.PI; // adjust if facing wrong way
        this.model.position.y = 0; // feet on ground

        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) child.material.shadowSide = THREE.FrontSide;
          }
        });

        // setup animation mixer
        this.mixer = new THREE.AnimationMixer(this.model);

        const by = (n) => THREE.AnimationClip.findByName(gltf.animations, n);
        const findLike = (k) =>
          gltf.animations.find((a) =>
            a.name.toLowerCase().includes(k.toLowerCase())
          );
        const idleClip = by('Idle') || findLike('idle');
        const walkClip =
          by('Walk') || by('Run') || findLike('walk') || findLike('run');
        const interactClip =
          by('Interact') ||
          findLike('interact') ||
          findLike('wave') ||
          findLike('talk');

        this.actions.idle = idleClip ? this.mixer.clipAction(idleClip) : null;
        this.actions.walk = walkClip ? this.mixer.clipAction(walkClip) : null;
        this.actions.interact = interactClip
          ? this.mixer.clipAction(interactClip)
          : null;

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

  update(delta) {
    if (this.mixer) this.mixer.update(delta);
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

  playOneShot(name, fade = 0.2, then = 'idle') {
    const act = this.actions[name];
    if (!act) return;
    const prev = this.currentAction;
    act.reset().setLoop(THREE.LoopOnce, 1);
    act.clampWhenFinished = true;
    act.play();
    if (prev) prev.crossFadeTo(act, fade, false);
    const onFinished = (e) => {
      if (e.action === act) {
        this.mixer.removeEventListener('finished', onFinished);
        this.fadeTo(then, 0.25);
      }
    };
    this.mixer.addEventListener('finished', onFinished);
  }
}
