const test = require('node:test');
const assert = require('node:assert/strict');

function createMockLocalStorage(initial = {}) {
  const store = { ...initial };
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = String(value);
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      for (const key of Object.keys(store)) {
        delete store[key];
      }
    },
  };
}

test('state persistence', async (t) => {
  const stateModule = await import('../src/state.js');

  await t.test('saveGame stores state to localStorage', () => {
    const mock = createMockLocalStorage();
    global.localStorage = mock;
    const snapshot = {
      currentQuestIndex: 2,
      quests: [{ title: 'a' }],
      isCombatActive: true,
      canInteractWith: 'npc',
    };
    stateModule.saveGame(snapshot);
    assert.equal(mock.getItem('gameState'), JSON.stringify(snapshot));
  });

  await t.test('loadGame retrieves stored state', () => {
    const snapshot = {
      quests: ['a', 'b'],
      isCombatActive: true,
      canInteractWith: 'npc',
    };
    const mock = createMockLocalStorage({ gameState: JSON.stringify(snapshot) });
    global.localStorage = mock;
    const loaded = stateModule.loadGame();
    assert.deepEqual(loaded, snapshot);
  });

  await t.test('loadGame returns null when no saved state', () => {
    const mock = createMockLocalStorage();
    global.localStorage = mock;
    const loaded = stateModule.loadGame();
    assert.equal(loaded, null);
  });

  await t.test('checkForSavedGame reflects persistence', () => {
    const mock = createMockLocalStorage();
    global.localStorage = mock;
    assert.strictEqual(stateModule.checkForSavedGame(), false);
    mock.setItem('gameState', '{}');
    assert.strictEqual(stateModule.checkForSavedGame(), true);
  });

  await t.test('checkForSavedGame returns false when storage is inaccessible', () => {
    delete global.localStorage;
    assert.strictEqual(stateModule.checkForSavedGame(), false);
  });

  await t.test('state helpers update quest and combat information', () => {
    const { gameState, updateQuestProgress, updateCombatStatus, updateInteractableTarget } = stateModule;
    global.localStorage = createMockLocalStorage();

    // reset state
    gameState.currentQuestIndex = 0;
    gameState.quests = [];
    gameState.isCombatActive = false;
    gameState.canInteractWith = null;

    updateQuestProgress({ title: 'test quest', objective: 'do things' });
    assert.deepEqual(gameState.quests[0], { title: 'test quest', objective: 'do things' });
    assert.strictEqual(gameState.currentQuestIndex, 0);

    updateCombatStatus(true);
    assert.strictEqual(gameState.isCombatActive, true);

    updateInteractableTarget('merchant');
    assert.strictEqual(gameState.canInteractWith, 'merchant');
  });

  delete global.localStorage;
});
