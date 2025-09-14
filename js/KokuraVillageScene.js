import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export function mountKokuraVillage(container, game) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    300
  );

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  const resizeObserver = new ResizeObserver(() => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(container);

  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);

  const ktx2 = new KTX2Loader()
    .setTranscoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/basis/')
    .detectSupport(renderer);
  loader.setKTX2Loader(ktx2);

  const hotspots = [];
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function handlePointer(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hotspots, false);
    if (hits.length > 0) {
      const name = hits[0].object.name;
      if (name === 'Hotspot_Gate') {
        game?.openQuest?.('Welcome to Kokura');
      } else if (name === 'Hotspot_KeepDoor') {
        game?.grantLoot?.('Shrine Key');
      } else if (name === 'Hotspot_Market') {
        if (game?.openShop) {
          game.openShop('starter');
        } else {
          game?.refreshUI?.();
        }
      } else if (name === 'Hotspot_Shrine') {
        game?.setFlag?.('kokura.shrine.unlocked', true);
      }
      game?.refreshUI?.();
    }
  }
  renderer.domElement.addEventListener('pointerdown', handlePointer);

  loader.load(
    './assets/models/viking.glb',
    (gltf) => {
      const root = gltf.scene;
      scene.add(root);
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
      root.position.sub(center);

      camera.position.set(0, size * 0.35, size * 0.95);
      camera.lookAt(0, 0, 0);

      const geo = new THREE.SphereGeometry(size * 0.05, 16, 16);
      const mat = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0,
      });

      const positions = {
        Hotspot_Gate: new THREE.Vector3(0, size * 0.05, size * 0.5),
        Hotspot_KeepDoor: new THREE.Vector3(0, size * 0.05, -size * 0.2),
        Hotspot_Market: new THREE.Vector3(-size * 0.3, size * 0.05, size * 0.1),
        Hotspot_Shrine: new THREE.Vector3(size * 0.3, size * 0.05, -size * 0.1),
      };

      Object.entries(positions).forEach(([name, pos]) => {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.name = name;
        mesh.position.copy(pos);
        root.add(mesh);
        hotspots.push(mesh);
      });
    },
    undefined,
    (err) => {
      console.error('Failed to load viking.glb', err);
    }
  );

  function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
}
