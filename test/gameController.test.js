import test from 'node:test';
import assert from 'node:assert/strict';

import {
  chapterOpeningText,
  chapterWritingFeedback,
  composeChapterJournal,
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

test('editing a completed chapter isolates the opening and preserves battle lines', () => {
  const original = 'The guardian reaches the beacon.\n\nBattle at the Beacon\nTurn 1: I charged.\nTurn 2: Cold rain fell.\nTurn 3: I leapt like a hawk.';
  const combat = { openingText: 'The guardian reaches the beacon.', responses: [] };

  assert.equal(chapterOpeningText({ text: original }, combat), 'The guardian reaches the beacon.');
  assert.equal(chapterOpeningText({ text: original }, {}), 'The guardian reaches the beacon.');
  assert.equal(
    chapterOpeningText({ text: 'A newer revision.\n\nBattle at the Beacon\nTurn 1: I charged.' }, combat),
    'A newer revision.'
  );
  assert.equal(chapterOpeningText({ text: '' }, combat), 'The guardian reaches the beacon.');
  const revised = composeChapterJournal('The guardian races toward the beacon.', combat, original);
  assert.equal(revised,
    'The guardian races toward the beacon.\n\nBattle at the Beacon\nTurn 1: I charged.\nTurn 2: Cold rain fell.\nTurn 3: I leapt like a hawk.');

  // Repeating the edit replaces just the opening; it never duplicates the battle.
  const revisedAgain = composeChapterJournal('Lightning reveals the beacon.', combat, revised);
  assert.equal(revisedAgain,
    'Lightning reveals the beacon.\n\nBattle at the Beacon\nTurn 1: I charged.\nTurn 2: Cold rain fell.\nTurn 3: I leapt like a hawk.');
  assert.equal(chapterOpeningText({ text: revisedAgain }, {}), 'Lightning reveals the beacon.');
});

test('revision recovers battle lines from an older save with responses but no journal section', () => {
  assert.equal(
    composeChapterJournal('A clearer opening.', {
      responses: [{ turn: 1, text: 'I charged through the surf.' }],
    }, 'The old opening.'),
    'A clearer opening.\n\nBattle at the Beacon\nTurn 1: I charged through the surf.'
  );
});

test('reward feedback uses the saved battle criterion and supports older responses', () => {
  const newer = chapterWritingFeedback({ responses: [{
    turn: 3,
    text: 'I leapt like a hawk.',
    strength: 'Your simile makes the movement easier to picture.',
    nextStep: 'Try comparing the setting to something specific.',
  }] });
  assert.match(newer, /Turn 3.*Strength: Your simile.*Next step: Try comparing/);

  const legacy = chapterWritingFeedback({ responses: [{
    turn: 3,
    text: 'I leapt like a hawk.',
  }] });
  assert.match(legacy, /final battle line met the simile target/);
  assert.match(legacy, /Next step: Try a comparison/);
});
