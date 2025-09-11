const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

test('villageStructures.js uses 3D geometry instead of billboard sprites', () => {
  const filePath = path.join(__dirname, '../assets/sprites/villageStructures.js');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Verify the old billboard approach is removed
  assert.ok(!fileContent.includes('createBillboard'), 'Should not contain createBillboard function');
  assert.ok(!fileContent.includes('SpriteMaterial'), 'Should not use SpriteMaterial');
  assert.ok(!fileContent.includes('Sprite'), 'Should not use Sprite objects');
  assert.ok(!fileContent.includes('CanvasTexture'), 'Should not use CanvasTexture for sprites');

  // Verify the new 3D geometry approach is used
  assert.ok(fileContent.includes('BoxGeometry'), 'Should use BoxGeometry for buildings');
  assert.ok(fileContent.includes('ConeGeometry'), 'Should use ConeGeometry for roofs');
  assert.ok(fileContent.includes('MeshStandardMaterial'), 'Should use MeshStandardMaterial');
  assert.ok(fileContent.includes('THREE.Group'), 'Should return THREE.Group objects');
  assert.ok(fileContent.includes('castShadow'), 'Should enable shadow casting');
  assert.ok(fileContent.includes('receiveShadow'), 'Should enable shadow receiving');
});

test('all exported functions exist and follow consistent pattern', () => {
  const filePath = path.join(__dirname, '../assets/sprites/villageStructures.js');
  const fileContent = fs.readFileSync(filePath, 'utf8');

  // Verify all required exported functions exist
  assert.ok(fileContent.includes('export function createHut'), 'Should export createHut function');
  assert.ok(fileContent.includes('export function createFarmRow'), 'Should export createFarmRow function');
  assert.ok(fileContent.includes('export function createLordHouse'), 'Should export createLordHouse function');
  assert.ok(fileContent.includes('export function createChurch'), 'Should export createChurch function');

  // Verify they all return group objects for consistency
  const exportMatches = fileContent.match(/export function create\w+\(\)[^}]+}/gs);
  assert.ok(exportMatches && exportMatches.length >= 4, 'Should have at least 4 exported functions');
});

test('architectural consistency with main building functions', () => {
  const villageStructuresPath = path.join(__dirname, '../assets/sprites/villageStructures.js');
  const indexPath = path.join(__dirname, '../index.html');
  
  const villageContent = fs.readFileSync(villageStructuresPath, 'utf8');
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  // Verify that both use the same Three.js geometry approach
  assert.ok(villageContent.includes('BoxGeometry'), 'villageStructures should use BoxGeometry');
  assert.ok(indexContent.includes('BoxGeometry'), 'index.html should use BoxGeometry');
  
  assert.ok(villageContent.includes('ConeGeometry'), 'villageStructures should use ConeGeometry for roofs');
  assert.ok(indexContent.includes('ConeGeometry'), 'index.html should use ConeGeometry for roofs');

  // Verify both use Group objects
  assert.ok(villageContent.includes('THREE.Group'), 'villageStructures should use THREE.Group');
  assert.ok(indexContent.includes('THREE.Group'), 'index.html should use THREE.Group');
});