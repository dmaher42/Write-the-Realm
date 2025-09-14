import test from 'node:test';
import assert from 'node:assert/strict';

// Mock Three.js to avoid WebGL dependencies in Node.js tests
function createThreeMock() {
  class MockGroup {
    constructor() {
      this.children = [];
      this.setDirection = null;
    }
    add(child) {
      this.children.push(child);
    }
  }

  class MockScene {
    constructor() {
      this.children = [];
    }
    add(child) {
      this.children.push(child);
    }
  }

  class MockMesh {
    constructor(geometry, material) {
      this.geometry = geometry;
      this.material = material;
      this.scale = { setScalar: () => {} };
      this.rotation = { y: 0 };
      this.position = { y: 0 };
    }
  }

  class MockBoxGeometry {
    constructor(w, h, d) {
      this.width = w;
      this.height = h;
      this.depth = d;
    }
  }

  class MockMeshStandardMaterial {
    constructor(options) {
      this.color = options.color;
    }
  }

  return {
    Group: MockGroup,
    Scene: MockScene,
    Mesh: MockMesh,
    BoxGeometry: MockBoxGeometry,
    MeshStandardMaterial: MockMeshStandardMaterial,
  };
}

test('PlayerModel instantiation', async (t) => {
  // Mock Three.js globally
  const threeMock = createThreeMock();
  global.THREE = threeMock;

  // Mock import.meta.url for Node.js environment
  const originalImportMeta = global.import;
  global.import = {
    meta: { url: 'file:///test/' }
  };

  const { PlayerModel } = await import('../src/playerModel.js');

  await t.test('creates PlayerModel with correct group setup', () => {
    const mockScene = new threeMock.Scene();
    const playerModel = new PlayerModel(mockScene, {
      modelPath: '../assets/models/viking.glb'
    });

    // Verify the PlayerModel has the expected properties
    assert.ok(playerModel.group, 'PlayerModel should have a group property');
    assert.ok(playerModel.scene === mockScene, 'PlayerModel should store scene reference');
    assert.ok(typeof playerModel.group.setDirection === 'function', 'Group should have setDirection method');
    
    // Verify the group was added to the scene
    assert.ok(mockScene.children.includes(playerModel.group), 'PlayerModel group should be added to scene');
  });

  await t.test('creates PlayerModel without model path (fallback)', () => {
    const mockScene = new threeMock.Scene();
    const playerModel = new PlayerModel(mockScene);

    // Should still create a group and add it to scene
    assert.ok(playerModel.group, 'PlayerModel should have a group property even without modelPath');
    assert.ok(mockScene.children.includes(playerModel.group), 'PlayerModel group should be added to scene');
  });

  // Restore original import.meta
  global.import = originalImportMeta;
  delete global.THREE;
});