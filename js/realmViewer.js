import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'https://unpkg.com/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js';

const container = document.getElementById('realm-3d');

if (container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );

  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  const ktx2 = new KTX2Loader()
    .setTranscoderPath(
      'https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/'
    )
    .detectSupport(renderer);
  loader.setKTX2Loader(ktx2);

  loader.load(
    'assets/models/KokuraCastle_opt.glb',
    (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      scene.add(model);

      const dist = size * 0.9;
      const height = size * 0.35;
      camera.position.set(dist, height, dist);
      camera.lookAt(0, 0, 0);
    },
    undefined,
    (err) => {
      console.error('Failed to load GLB:', 'assets/models/KokuraCastle_opt.glb', err);
    }
  );

  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(container);

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
} else {
  console.error('Container #realm-3d not found');
}

