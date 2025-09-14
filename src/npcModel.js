// src/npcModel.js

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createNPC as createPrimitiveNPC } from './npcs.js';

export class NPCModel {
  constructor(scene, { name = 'NPC', position = new THREE.Vector3(), color = 0x8b4513, interactRadius = 2, modelPath = null } = {}) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
    this.group.position.copy(position);
    this.group.userData = { npcName: name, interactRadius, root: this.group };

    this.model = null;
    this.mixer = null;
    this.actions = { idle: null, interact: null };
    this.currentAction = null;

    if (modelPath) {
      this.loadModel(modelPath, color, interactRadius);
    } else {
      this.createFallback(color);
    }
  }

  createFallback(color) {
    const primitive = createPrimitiveNPC('npc', new THREE.Vector3(), color);
    while (primitive.children.length) {
      this.group.add(primitive.children[0]);
    }
  }

  loadModel(modelPath, color, interactRadius) {
    const loader = new GLTFLoader();
    const url = new URL(modelPath, import.meta.url).toString();
    loader.load(
      url,
      (gltf) => {
        this.model = gltf.scene;
        this.group.add(this.model);

        this.model.scale.setScalar(0.5);
        this.model.rotation.y = 0;
        this.model.position.y = 0;

        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) child.material.shadowSide = THREE.FrontSide;
          }
        });

        this.mixer = new THREE.AnimationMixer(this.model);
        const by = (n) => THREE.AnimationClip.findByName(gltf.animations, n);
        const findLike = (k) => gltf.animations.find((a) => a.name.toLowerCase().includes(k.toLowerCase()));
        const idleClip = by('Idle') || findLike('idle');
        const interactClip = by('Interact') || findLike('interact') || findLike('wave') || findLike('talk');
        this.actions.idle = idleClip ? this.mixer.clipAction(idleClip) : null;
        this.actions.interact = interactClip ? this.mixer.clipAction(interactClip) : null;
        if (this.actions.idle) {
          this.currentAction = this.actions.idle;
          this.currentAction.play();
        }
      },
      undefined,
      (err) => {
        console.error('Error loading NPC model:', err);
        this.createFallback(color);
      }
    );
  }

  update(delta) {
    if (this.mixer) this.mixer.update(delta);
  }

  fadeTo(actionName, fadeDuration = 0.5) {
    const next = this.actions[actionName];
    if (!next || this.currentAction === next) return;
    next.reset();
    next.play();
    if (this.currentAction) this.currentAction.crossFadeTo(next, fadeDuration, false);
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
