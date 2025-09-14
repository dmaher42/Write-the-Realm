import * as THREE from 'three';
import { pathAlbedo, pathRough, rockAlbedo } from './textures.js';

const shared = {};

function init() {
  if (shared.initialized) return;
  shared.geometries = {
    path: new THREE.PlaneGeometry(1, 2),
    box: new THREE.BoxGeometry(1, 1, 1),
    cylinder: new THREE.CylinderGeometry(1, 1, 1, 8),
    sphere: new THREE.SphereGeometry(1, 8, 8),
    icosa: new THREE.IcosahedronGeometry(1, 0),
  };
  shared.materials = {
    path: new THREE.MeshStandardMaterial({
      map: pathAlbedo,
      roughnessMap: pathRough,
      roughness: 1,
      metalness: 0,
    }),
    fence: new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8, metalness: 0 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x8b4513 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x228b22 }),
    rock: new THREE.MeshStandardMaterial({ map: rockAlbedo, roughness: 1, metalness: 0 }),
  };
  shared.initialized = true;
}

function getShared() {
  if (!shared.initialized) init();
  return shared;
}

export function createPath(points) {
  const { geometries, materials } = getShared();
  const group = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3(points);
  const len = Math.max(1, Math.floor(curve.getLength()));
  const pts = curve.getPoints(len);
  for (let i = 0; i < pts.length - 1; i++) {
    const start = pts[i];
    const end = pts[i + 1];
    const dir = end.clone().sub(start);
    const angle = Math.atan2(dir.x, dir.z);
    const tile = new THREE.Mesh(geometries.path, materials.path);
    tile.rotation.x = -Math.PI / 2;
    tile.position.copy(start).add(end).multiplyScalar(0.5);
    tile.rotation.y = angle;
    tile.receiveShadow = true;
    group.add(tile);
  }
  return group;
}

export function createFence(length = 8) {
  const { geometries, materials } = getShared();
  const group = new THREE.Group();
  const postGeom = geometries.box;
  const railGeom = geometries.box;
  for (let x = 0; x <= length; x += 2) {
    const post = new THREE.Mesh(postGeom, materials.fence);
    post.scale.set(0.2, 1, 0.2);
    post.position.set(x - length / 2, 0.5, 0);
    post.castShadow = true;
    group.add(post);
  }
  for (let i = 0; i < 2; i++) {
    const rail = new THREE.Mesh(railGeom, materials.fence);
    rail.scale.set(length, 0.1, 0.2);
    rail.position.set(0, 0.4 + i * 0.3, 0);
    rail.castShadow = true;
    group.add(rail);
  }
  return group;
}

export function createTree() {
  const { geometries, materials } = getShared();
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(geometries.cylinder, materials.trunk);
  trunk.scale.set(0.2, 2, 0.2);
  trunk.position.y = 1;
  trunk.castShadow = trunk.receiveShadow = true;
  group.add(trunk);
  const canopy = new THREE.Mesh(geometries.sphere, materials.leaf);
  canopy.scale.set(1.5, 1.5, 1.5);
  canopy.position.y = 2.5;
  canopy.castShadow = canopy.receiveShadow = true;
  group.add(canopy);
  return group;
}

export function createRock() {
  const { geometries, materials } = getShared();
  const group = new THREE.Group();
  const rock = new THREE.Mesh(geometries.icosa, materials.rock);
  const s = 0.6 + Math.random() * 0.4;
  rock.scale.set(s, s, s);
  rock.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );
  rock.castShadow = rock.receiveShadow = true;
  group.add(rock);
  return group;
}
