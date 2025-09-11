import * as THREE from 'three';

export class SpriteCharacter extends THREE.Sprite {
  constructor(textureURL, options = {}) {
    const loader = new THREE.TextureLoader();
    const texture = loader.load(textureURL);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    super(material);

    this.texture = texture;
    this.columns = options.columns || 6;
    this.animations = options.animations || { idle: [0], walk: [1], farm: [2] };
    this.frameTime = options.frameTime || 0.2;
    this.currentAnim = 'idle';
    this.currentFrameIndex = 0;
    this.elapsed = 0;

    const scale = options.scale || 5;
    this.scale.set(scale, scale, 1);
    this.center.set(0.5, 0);
    this.updateFrame();
  }

  updateFrame() {
    const frames = this.animations[this.currentAnim];
    const frame = frames[this.currentFrameIndex];
    const col = frame % this.columns;
    // single row sprite sheet
    this.texture.repeat.set(1 / this.columns, 1);
    this.texture.offset.set(col / this.columns, 0);
  }

  setAnimation(name) {
    if (!this.animations[name] || this.currentAnim === name) return;
    this.currentAnim = name;
    this.currentFrameIndex = 0;
    this.elapsed = 0;
    this.updateFrame();
  }

  update(delta, camera) {
    this.quaternion.copy(camera.quaternion);
    this.elapsed += delta;
    if (this.elapsed >= this.frameTime) {
      this.elapsed = 0;
      const frames = this.animations[this.currentAnim];
      this.currentFrameIndex = (this.currentFrameIndex + 1) % frames.length;
      this.updateFrame();
    }
  }
}
