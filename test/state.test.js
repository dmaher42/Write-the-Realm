const test = require('node:test');
const assert = require('node:assert/strict');

const { saveGame, loadGame, checkForSavedGame } = require('../src/state.js');

// When localStorage is unavailable (e.g., in Node), the state module should
// surface errors via return values rather than throwing.

test('saveGame returns false when storage is unavailable', () => {
  assert.strictEqual(saveGame(), false);
});

test('loadGame returns null when storage is unavailable', () => {
  assert.strictEqual(loadGame(), null);
});

test('checkForSavedGame returns false when storage is unavailable', () => {
  assert.strictEqual(checkForSavedGame(), false);
});
