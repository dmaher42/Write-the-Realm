import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader }  from 'three/examples/jsm/loaders/KTX2Loader.js';
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
