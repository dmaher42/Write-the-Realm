import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createInitialState,
  normaliseState,
} from '../src/gameController.js';

test('createInitialState returns isolated mutable collections', () => {
  const first = createInitialState();
  const second = createInitialState();

  first.inventory.push({ name: 'Test Item', slot: 'weapon' });
  first.prewrite.focus.goal = 'changed';

  assert.equal(second.inventory.length, 0);
  assert.equal(second.prewrite.focus.goal, '');
});

test('normaliseState upgrades legacy state while preserving progress', () => {
  const state = normaliseState({
    selectedGuardian: 'Knight',
    selectedDomain: 'Kelp Forest',
    player: { xp: 75 },
    inventory: [{ name: 'Shrine Key', slot: 'weapon' }],
    equipment: { weapon: 'Shrine Key' },
  });

  assert.equal(state.version, 2);
  assert.equal(state.selectedGuardian, 'Knight');
  assert.equal(state.selectedDomain, 'Kelp Forest');
  assert.equal(state.player.xp, 75);
  assert.equal(state.player.health, 100);
  assert.equal(state.inventory.length, 1);
  assert.equal(state.equipment.weapon, 'Shrine Key');
  assert.equal(state.equipment.head, '');
});
