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

// Keep the village playable on devices where WebGL is blocked or unavailable.
// Everything in this illustration is static, so it works without a GPU context.
function mountFallbackVillage(container, visitElder) {
  const tree = (x, y, scale = 1) => `
    <g transform="translate(${x} ${y}) scale(${scale})">
      <ellipse cy="10" rx="24" ry="8" fill="#426f67" opacity=".25"/>
      <path d="M-4 1V-29H4V1Z" fill="#75533c"/>
      <path d="M-19-19 0-72 19-19Z" fill="#3f7967"/>
      <path d="M-24-5 0-55 24-5Z" fill="#518b70"/>
      <path d="M-19-28 0-72 4-62Z" fill="#82ac7c" opacity=".65"/>
    </g>`;

  const cottage = (x, y, scale = 1, roof = '#794d46') => `
    <g transform="translate(${x} ${y}) scale(${scale})">
      <ellipse cy="10" rx="78" ry="22" fill="#4c745a" opacity=".28"/>
      <path d="M-65-47 2-71 67-45 67 3 2 27-65 2Z" fill="#e5cc96" stroke="#806b53" stroke-width="3"/>
      <path d="M2-71 67-45 67 3 2 27Z" fill="#bd9c75"/>
      <path d="M-76-50-10-104 77-60 67-45 2-71-65-47Z" fill="${roof}" stroke="#4d4543" stroke-width="3"/>
      <path d="M-10-104 77-60 67-45 2-71Z" fill="#a56b58"/>
      <path d="M-57-45-8-88M-42-40 8-81M-25-34 27-73" stroke="#dba67d" stroke-width="4" opacity=".48"/>
      <path d="M-35-32h20v25h-20z" fill="#608b8b" stroke="#705943" stroke-width="5"/>
      <path d="M20-42h20v26H20z" fill="#4b6d72" stroke="#715941" stroke-width="5"/>
      <path d="M-4-17h23v38L2 27-4 25Z" fill="#77523b" stroke="#543d35" stroke-width="3"/>
      <circle cx="13" cy="2" r="2.5" fill="#eac77f"/>
      <path d="M-65 2 2 27 67 3" fill="none" stroke="#6a6151" stroke-width="3"/>
    </g>`;

  container.innerHTML = `<svg data-village-fallback xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 760" preserveAspectRatio="xMidYMid slice"
      width="100%" height="100%" style="display:block" aria-hidden="true">
    <defs>
      <linearGradient id="village-sky" x2="0" y2="1">
        <stop stop-color="#88bbcf"/><stop offset="1" stop-color="#d3e7d6"/>
      </linearGradient>
      <linearGradient id="village-sea" x2="0" y2="1">
        <stop stop-color="#78bac3"/><stop offset="1" stop-color="#428b9b"/>
      </linearGradient>
      <linearGradient id="village-grass" x2="0" y2="1">
        <stop stop-color="#a4bf80"/><stop offset="1" stop-color="#76a46d"/>
      </linearGradient>
      <clipPath id="village-land-clip"><ellipse cx="600" cy="460" rx="485" ry="243"/></clipPath>
    </defs>
    <rect width="1200" height="760" fill="url(#village-sky)"/>
    <path d="M0 242 Q124 183 231 233T472 227Q591 179 706 230T948 223Q1088 177 1200 217V353H0Z" fill="#87b5aa" opacity=".35"/>
    <path d="M0 277 Q194 226 379 278T758 265Q973 224 1200 273V760H0Z" fill="url(#village-sea)"/>
    <g fill="none" stroke="#c2e1d6" stroke-width="3" opacity=".36">
      <path d="M25 361q65-12 133 0m30 35q72-10 133 1m665-73q68-9 136 2m-87 80q55-10 112 1"/>
      <path d="M53 598q64-9 124 1m-163 85q69-10 124 0m913-92q62-9 125 1m-82 91q49-9 103 0"/>
    </g>
    <ellipse cx="600" cy="474" rx="515" ry="257" fill="#397e84" opacity=".3"/>
    <ellipse cx="600" cy="466" rx="510" ry="249" fill="#dfc99d"/>
    <ellipse cx="600" cy="460" rx="485" ry="243" fill="url(#village-grass)"/>
    <g clip-path="url(#village-land-clip)">
      <path d="M571 716 551 491 556 319H643L644 491 631 716Z" fill="#d7c395"/>
      <path d="M560 467 304 469 250 500 567 511ZM633 465 903 451 960 476 635 513Z" fill="#d7c395"/>
      <ellipse cx="600" cy="468" rx="93" ry="51" fill="#e2ceaa"/>
      <g opacity=".34" fill="#4b805d">
        <circle cx="198" cy="456" r="17"/><circle cx="248" cy="628" r="12"/>
        <circle cx="982" cy="605" r="18"/><circle cx="925" cy="292" r="11"/>
        <circle cx="353" cy="272" r="14"/><circle cx="778" cy="659" r="10"/>
      </g>
      <g fill="#e8dab5" opacity=".7">
        <circle cx="469" cy="564" r="3"/><circle cx="717" cy="575" r="3"/>
        <circle cx="513" cy="366" r="3"/><circle cx="691" cy="354" r="3"/>
        <circle cx="371" cy="520" r="3"/><circle cx="889" cy="518" r="3"/>
      </g>
    </g>
    <g>
      ${tree(188, 450, 1.08)}${tree(241, 369, .77)}${tree(300, 320, .83)}
      ${tree(423, 282, .78)}${tree(785, 274, .78)}${tree(982, 336, .91)}
      ${tree(1024, 461, 1.1)}${tree(963, 577, .79)}${tree(862, 644, .82)}
      ${tree(343, 631, .82)}${tree(250, 551, .74)}
    </g>
    <g transform="translate(600 356)">
      <ellipse cy="35" rx="114" ry="27" fill="#52775b" opacity=".28"/>
      <path d="M-85-51 0-79 86-51V21L0 48-85 21Z" fill="#d8c29a" stroke="#766954" stroke-width="4"/>
      <path d="M0-79 86-51V21L0 48Z" fill="#aa927c"/>
      <path d="M-101-56-77-115 0-144 91-112 103-55 0-88Z" fill="#5b6262" stroke="#465458" stroke-width="4"/>
      <path d="M0-144 91-112 103-55 0-88Z" fill="#77777a"/>
      <path d="M-90-122v-53h27v43m124 0v-43h27v53" fill="#a79e8d" stroke="#6b6a5f" stroke-width="4"/>
      <path d="M-95-177h37m115 0h37" stroke="#ddd1ae" stroke-width="7"/>
      <path d="M-26 0v39l26 9 26-9V0q-26-22-52 0Z" fill="#634b3b" stroke="#504339" stroke-width="4"/>
      <path d="M-69-32h24v26h-24zm113 0h24v26H44z" fill="#527e8b" stroke="#735f4b" stroke-width="5"/>
    </g>
    <g transform="translate(318 425)">
      <ellipse cy="19" rx="112" ry="21" fill="#4e7455" opacity=".28"/>
      <path d="M-88-30 14-68 91-36V13L14 42-88 11Z" fill="#dbbe84" stroke="#806e4e" stroke-width="4"/>
      <path d="M14-68 91-36V13L14 42Z" fill="#b89b6b"/>
      <path d="M-99-32-72-75 18-110 100-69 99-33 14-68-88-30Z" fill="#8a5d45" stroke="#664a3d" stroke-width="4"/>
      <path d="M18-110 100-69 99-33 14-68Z" fill="#aa7853"/>
      <path d="M-50-15h24v25h-24zm85-8h21v26H35z" fill="#5b817c" stroke="#765b43" stroke-width="5"/>
      <path d="M-7 4h22v37L-7 34Z" fill="#76553c"/>
      <path d="M-119 44q75-24 140 8m0 0q60-37 111-13" fill="none" stroke="#bbaa75" stroke-width="8"/>
    </g>
    <g transform="translate(864 426)">
      <ellipse cy="26" rx="99" ry="23" fill="#4e7455" opacity=".28"/>
      <path d="M-65-61 20-86 73-58V32L20 53-65 24Z" fill="#ece2c2" stroke="#7c7969" stroke-width="4"/>
      <path d="M20-86 73-58V32L20 53Z" fill="#c1b9a4"/>
      <path d="M-75-63 22-117 83-66 73-58 20-86-65-61Z" fill="#596e69" stroke="#485c5b" stroke-width="4"/>
      <path d="M22-117 83-66 73-58 20-86Z" fill="#788782"/>
      <path d="M9-117v-49h28v50" fill="#d9d4bb" stroke="#777b70" stroke-width="4"/>
      <path d="M15-166h17m-8-12v23" stroke="#f4deaa" stroke-width="5" stroke-linecap="round"/>
      <path d="M-30-28h24v30h-24Z" fill="#7ba6aa" stroke="#88796a" stroke-width="5"/>
      <path d="M10 13h20v35l-20 5Z" fill="#7b5b47"/>
      <path d="M48-43h18v30H48Z" fill="#6e969a" stroke="#807b70" stroke-width="4"/>
    </g>
    ${cottage(411, 560, .83)}${cottage(805, 551, .88, '#6c4e52')}
    <g transform="translate(600 475)" fill="#f0ddad" stroke="#ab8e6a" stroke-width="3">
      <circle r="19"/><path d="M-12-13 12 13m0-26-24 26"/>
    </g>
    <g fill="#735c43" stroke="#614c38" stroke-width="3">
      <path d="M518 531v-40m163 36v-40"/><path d="M517 491h9m154-4h9" stroke="#e7bd77" stroke-width="9"/>
    </g>
    <g data-village-gate style="cursor:pointer" tabindex="-1">
      <ellipse cx="600" cy="628" rx="76" ry="19" fill="#567459" opacity=".32"/>
      <path d="M535 642V555h18v86m94 0v-86h18v87" fill="#a79b82" stroke="#726e62" stroke-width="4"/>
      <path d="M529 548h142v20H529Z" fill="#8f816d" stroke="#666054" stroke-width="4"/>
      <path d="M545 540h111v31H545Z" fill="#604938" stroke="#d5ba83" stroke-width="4"/>
      <text x="600" y="561" fill="#fff3d2" font-family="Georgia,serif" font-size="15" font-weight="bold" text-anchor="middle">ELDER'S GATE</text>
      <path d="M549 638h102" stroke="#655e4d" stroke-width="5"/>
      <rect x="528" y="527" width="144" height="126" fill="#fff" opacity="0"/>
    </g>
  </svg>`;

  container.querySelector('[data-village-gate]')?.addEventListener('click', visitElder);
  return { fallback: true };
}

export function mountKokuraVillage(container, game) {
  function visitElder() {
    game?.openQuest?.('The Broken Beacon');
  }
  document.getElementById('village-gate-action')?.addEventListener('click', visitElder);

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  } catch (error) {
    console.warn('WebGL village unavailable; showing the illustrated village.', error);
    return mountFallbackVillage(container, visitElder);
  }
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

  renderer.domElement.addEventListener('pointerdown', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.intersectObject(gateTarget).length) visitElder();
  });

  let resizeObserver;
  let showingFallback = false;
  function showFallback() {
    if (showingFallback) return;
    showingFallback = true;
    resizeObserver?.disconnect();
    renderer.domElement.remove();
    renderer.dispose();
    mountFallbackVillage(container, visitElder);
  }
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    showFallback();
  }, { once: true });

  function render() {
    if (showingFallback) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    try {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    } catch (error) {
      console.warn('WebGL village render failed; showing the illustrated village.', error);
      showFallback();
    }
  }
  resizeObserver = new ResizeObserver(render);
  resizeObserver.observe(container);
  render();

  return { scene, camera, renderer, gate };
}
