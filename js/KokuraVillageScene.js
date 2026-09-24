import * as THREE from 'three';
import {
  createHut,
  createFarmRow,
  createLordHouse,
  createChurch,
} from '../assets/sprites/villageStructures.js';

const LAND_HEIGHT = 0.55;
const colours = {
  sky: 0xb9dce7,
  water: 0x65afbd,
  shore: 0xd5bd89,
  grass: 0x86ad71,
  path: 0xd6c29d,
  stone: 0x9a9280,
  timber: 0x6a4935,
  leaves: [0x557b5b, 0x618b62, 0x73966a],
};

function makeMesh(geometry, color, options = {}) {
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...options })
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addTree(scene, x, z, scale = 1, shade = 0) {
  const group = new THREE.Group();
  const trunk = makeMesh(new THREE.CylinderGeometry(0.24, 0.3, 2.2, 7), 0x775a3d);
  trunk.position.y = 1.1;
  group.add(trunk);

  const foliage = new THREE.Group();
  [0, 0.9, 1.7].forEach((height, index) => {
    const crown = makeMesh(
      new THREE.ConeGeometry(1.45 - index * 0.22, 2.4, 8),
      colours.leaves[shade % colours.leaves.length]
    );
    crown.position.y = 2.2 + height;
    foliage.add(crown);
  });
  group.add(foliage);
  group.position.set(x, LAND_HEIGHT, z);
  group.scale.setScalar(scale);
  scene.add(group);
}

function addLantern(scene, x, z) {
  const post = makeMesh(new THREE.CylinderGeometry(0.1, 0.14, 2.7, 6), colours.timber);
  post.position.set(x, LAND_HEIGHT + 1.35, z);
  scene.add(post);
  const lamp = makeMesh(
    new THREE.BoxGeometry(0.55, 0.65, 0.55),
    0xffdf9e,
    { emissive: 0xe4a950, emissiveIntensity: 0.35 }
  );
  lamp.position.set(x, LAND_HEIGHT + 2.8, z);
  scene.add(lamp);
  const cap = makeMesh(new THREE.ConeGeometry(0.48, 0.45, 4), 0x465b59);
  cap.rotation.y = Math.PI / 4;
  cap.position.set(x, LAND_HEIGHT + 3.36, z);
  scene.add(cap);
}

function addGate(scene) {
  const gate = new THREE.Group();
  for (const x of [-2.7, 2.7]) {
    const pillar = makeMesh(new THREE.BoxGeometry(0.85, 3.7, 0.9), colours.stone);
    pillar.position.set(x, 1.85, 0);
    gate.add(pillar);
    const cap = makeMesh(new THREE.BoxGeometry(1.2, 0.28, 1.18), 0xb9ad93);
    cap.position.set(x, 3.83, 0);
    gate.add(cap);
  }
  const lintel = makeMesh(new THREE.BoxGeometry(6.4, 0.85, 1.1), 0xa6987d);
  lintel.position.y = 4.1;
  gate.add(lintel);

  const board = document.createElement('canvas');
  board.width = 512;
  board.height = 128;
  const context = board.getContext('2d');
  context.fillStyle = '#553c2c';
  context.fillRect(0, 0, board.width, board.height);
  context.strokeStyle = '#d7ba7c';
  context.lineWidth = 8;
  context.strokeRect(8, 8, board.width - 16, board.height - 16);
  context.fillStyle = '#fff0c9';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = 'bold 53px Georgia';
  context.fillText("ELDER'S GATE", board.width / 2, board.height / 2);
  const texture = new THREE.CanvasTexture(board);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(4.75, 1.18),
    new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
  );
  sign.position.set(0, 4.14, 0.6);
  gate.add(sign);

  gate.position.set(0, LAND_HEIGHT, 20);
  scene.add(gate);
  return gate;
}

export function mountKokuraVillage(container, game) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(colours.sky);
  scene.fog = new THREE.Fog(colours.sky, 100, 165);

  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 200);
  camera.position.set(38, 39, 51);
  camera.lookAt(0, 1.4, 0);

  scene.add(new THREE.HemisphereLight(0xf4f9f5, 0x6e7861, 2.1));
  const sunlight = new THREE.DirectionalLight(0xffe5bd, 2.5);
  sunlight.position.set(-24, 42, 28);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(1024, 1024);
  sunlight.shadow.camera.left = -38;
  sunlight.shadow.camera.right = 38;
  sunlight.shadow.camera.top = 38;
  sunlight.shadow.camera.bottom = -38;
  scene.add(sunlight);

  const sea = makeMesh(new THREE.PlaneGeometry(1000, 1000), colours.water);
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -1.4;
  sea.castShadow = false;
  sea.receiveShadow = false;
  scene.add(sea);

  const shoreline = makeMesh(new THREE.CylinderGeometry(29.5, 30.5, 1.15, 64), colours.shore);
  shoreline.position.y = -0.5;
  scene.add(shoreline);
  const green = makeMesh(new THREE.CylinderGeometry(27.5, 28.5, 0.7, 64), colours.grass);
  green.position.y = 0.2;
  scene.add(green);

  const plaza = makeMesh(new THREE.CylinderGeometry(6.2, 6.2, 0.09, 32), colours.path);
  plaza.position.set(0, LAND_HEIGHT + 0.03, 2);
  scene.add(plaza);
  const mainPath = makeMesh(new THREE.BoxGeometry(3.8, 0.07, 25), colours.path);
  mainPath.position.set(0, LAND_HEIGHT + 0.06, 11);
  scene.add(mainPath);
  const sidePath = makeMesh(new THREE.BoxGeometry(25, 0.07, 3.2), colours.path);
  sidePath.position.set(0, LAND_HEIGHT + 0.07, 9);
  scene.add(sidePath);
  const keepPath = makeMesh(new THREE.BoxGeometry(3.6, 0.07, 13), colours.path);
  keepPath.position.set(0, LAND_HEIGHT + 0.07, -6);
  scene.add(keepPath);

  const keep = createLordHouse();
  keep.position.set(0, LAND_HEIGHT, -8);
  scene.add(keep);
  const hutA = createHut();
  hutA.position.set(-11, LAND_HEIGHT, 9);
  scene.add(hutA);
  const hutB = createHut();
  hutB.position.set(11, LAND_HEIGHT, 9);
  scene.add(hutB);
  const farm = createFarmRow();
  farm.position.set(-12, LAND_HEIGHT, -12);
  scene.add(farm);
  const church = createChurch();
  church.position.set(12, LAND_HEIGHT, -12);
  scene.add(church);

  [
    [-20, 16, 1.1, 0], [-21, 4, 0.95, 1], [-19, -15, 1.1, 2],
    [19, 15, 1.15, 1], [21, 1, 0.9, 0], [19, -18, 1.05, 2],
    [-5, -23, 1, 0], [6, -23, 1.15, 1], [-13, 20, 0.75, 2],
    [14, 21, 0.8, 0],
  ].forEach(([x, z, scale, shade]) => addTree(scene, x, z, scale, shade));

  for (const [x, z] of [[-4.2, 17], [4.2, 17], [-4.1, -2], [4.1, -2]]) {
    addLantern(scene, x, z);
  }

  const gate = addGate(scene);
  const gateTarget = new THREE.Mesh(
    new THREE.BoxGeometry(7, 6, 2.5),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  );
  gateTarget.name = 'Hotspot_Gate';
  gateTarget.position.set(0, LAND_HEIGHT + 2.6, 20);
  scene.add(gateTarget);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  function visitElder() {
    game?.openQuest?.('The Broken Beacon');
  }

  renderer.domElement.addEventListener('pointerdown', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.intersectObject(gateTarget).length) visitElder();
  });
  document.getElementById('village-gate-action')?.addEventListener('click', visitElder);

  function render() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  const resizeObserver = new ResizeObserver(render);
  resizeObserver.observe(container);
  render();

  return { scene, camera, renderer, gate };
}
