import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCharacterData,
  setCharacterData,
  getPlayerStats,
  setPlayerStats,
  getGameState,
  setGameState
} from '../state.js';

test('setCharacterData updates state', () => {
  const data = { type: 'mage', domain: 'fire', customName: 'Fira' };
  setCharacterData(data);
  assert.deepEqual(getCharacterData(), data);
});

test('setPlayerStats updates state', () => {
  const stats = {
    level: 2,
    xp: 10,
    xpToNextLevel: 120,
    baseHealth: 110,
    baseDamage: 12,
    journal: [],
    achievements: {},
    collectedFragments: 1,
    inventory: {},
    equipmentSlots: { weapon: null, armor: null, trinket: null }
  };
  setPlayerStats(stats);
  assert.deepEqual(getPlayerStats(), stats);
});

test('setGameState updates state', () => {
  const state = {
    currentQuestIndex: 1,
    quests: [],
    canInteractWith: null,
    isCombatActive: true
  };
  setGameState(state);
  assert.deepEqual(getGameState(), state);
});
