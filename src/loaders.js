import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader }  from 'three/addons/loaders/KTX2Loader.js';
import * as THREE from 'three';

export function makeGLTFLoader(renderer) {
  const gltf = new GLTFLoader();
  const draco = new DRACOLoader();
  draco.setDecoderPath('libs/draco/'); // put decoders here
  gltf.setDRACOLoader(draco);

  const ktx2 = new KTX2Loader()
    .setTranscoderPath('libs/basis/')
    .detectSupport(renderer);
  gltf.setKTX2Loader(ktx2);
  return gltf;
}
