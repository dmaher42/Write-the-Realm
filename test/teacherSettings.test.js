import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TEACHER_PRESETS,
  normaliseTeacherSettings,
  requirementsForPreset,
} from '../src/teacherSettings.js';

test('teacher settings default to standard mode', () => {
  assert.deepEqual(normaliseTeacherSettings(null), { preset: 'standard' });
  assert.deepEqual(normaliseTeacherSettings({ preset: 'unknown' }), { preset: 'standard' });
});

test('guided mode preserves baseline targets and adds scaffolds', () => {
  const requirements = requirementsForPreset('guided', 1);

  assert.equal(requirements.label, 'Guided');
  assert.equal(requirements.openingMinimumWords, 15);
  assert.equal(requirements.combatMinimumWords, 10);
  assert.equal(requirements.showScaffolds, true);
  assert.equal(requirements.showSentenceStarters, true);
  assert.equal(requirements.allowSpecialMove, true);
});

test('challenge mode raises all writing targets', () => {
  const firstRound = requirementsForPreset({ preset: 'challenge' }, 0);
  const finalRound = requirementsForPreset({ preset: 'challenge' }, 2);

  assert.equal(firstRound.prewriteMinimumWords, 10);
  assert.equal(firstRound.openingMinimumWords, 30);
  assert.equal(firstRound.openingMinimumCharacters, 160);
  assert.equal(firstRound.combatMinimumWords, 13);
  assert.equal(finalRound.combatMinimumWords, 15);
  assert.equal(firstRound.showScaffolds, false);
  assert.equal(firstRound.allowSpecialMove, false);
});

test('combat round index is safely bounded', () => {
  assert.equal(requirementsForPreset('standard', -4).combatMinimumWords, 8);
  assert.equal(requirementsForPreset('standard', 99).combatMinimumWords, 10);
  assert.equal(Object.isFrozen(TEACHER_PRESETS), true);
});
