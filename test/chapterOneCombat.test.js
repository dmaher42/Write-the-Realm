import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assessCombatResponse,
  createCombatState,
  createMonsterFromWriting,
  resolveCombatTurn,
} from '../src/chapterOneCombat.js';

const opening =
  'Lightning split the sky as the guardian charged through the storm, climbing the ruined path toward the broken beacon.';

test('monster generation is deterministic and reflects the writing motif', () => {
  const first = createMonsterFromWriting({
    text: opening,
    domain: 'Coral Reef',
    obstacle: 'a violent storm',
    guardian: 'Shark Guardian',
  });
  const second = createMonsterFromWriting({
    text: opening,
    domain: 'Coral Reef',
    obstacle: 'a violent storm',
    guardian: 'Shark Guardian',
  });

  assert.deepEqual(first, second);
  assert.match(first.name, /^Tempest /);
  assert.match(first.description, /three precise pieces of writing/i);
  assert.equal(first.maxHealth, 100);
});

test('combat response assessment teaches the requirement for each turn', () => {
  const action = assessCombatResponse(
    'The guardian charged across the stones and struck the creature with the glowing blade.',
    0
  );
  assert.equal(action.valid, true);
  assert.equal(action.hasAction, true);
  assert.match(action.strength, /action word/i);
  assert.match(action.nextStep, /sound, sight or physical sensation/i);

  const sensory = assessCombatResponse(
    'A deafening roar echoed through the cold tower as the rough stones shook below.',
    1
  );
  assert.equal(sensory.valid, true);
  assert.equal(sensory.hasSensory, true);
  assert.match(sensory.strength, /sensory detail/i);

  const simile = assessCombatResponse(
    'The guardian sprang like a silver arrow and drove the blade through the dark mist.',
    2
  );
  assert.equal(simile.valid, true);
  assert.equal(simile.hasSimile, true);
  assert.match(simile.strength, /comparison/i);

  const incomplete = assessCombatResponse('I hit it hard.', 0);
  assert.equal(incomplete.valid, false);
  assert.match(incomplete.message, /at least 8 words/i);
});

test('three valid responses complete the battle in exactly three turns', () => {
  const monster = createMonsterFromWriting({ text: opening, domain: 'Deep Trench' });
  let combat = createCombatState({ monster, openingText: opening });

  let result = resolveCombatTurn(
    combat,
    'The guardian lunged over the broken wall and struck the monster with both hands.'
  );
  assert.equal(result.completed, false);
  assert.equal(result.combat.turn, 1);
  assert.equal(result.combat.enemyHealth, 70);
  combat = result.combat;

  result = resolveCombatTurn(
    combat,
    'A deafening crack echoed through the icy tower while cold rain stung the hero.'
  );
  assert.equal(result.completed, false);
  assert.equal(result.combat.turn, 2);
  assert.equal(result.combat.enemyHealth, 38);
  combat = result.combat;

  result = resolveCombatTurn(
    combat,
    'The guardian flew like a bright arrow and struck the creature beneath its jaw.'
  );
  assert.equal(result.completed, true);
  assert.equal(result.combat.turn, 3);
  assert.equal(result.combat.enemyHealth, 0);
  assert.equal(result.combat.status, 'victory');
  assert.equal(result.combat.responses.length, 3);
  assert.ok(result.combat.playerHealth > 0);
});

test('optional craft adds strike power while the three required turns still guarantee victory', () => {
  const monster = createMonsterFromWriting({ text: opening });
  let plain = createCombatState({ monster, openingText: opening });
  let crafted = createCombatState({ monster, openingText: opening });

  const plainFirst = resolveCombatTurn(
    plain,
    'The guardian charged over the stone path towards the beast.'
  );
  const craftedFirst = resolveCombatTurn(
    crafted,
    'The guardian charged like a bolt of lightning as cold rain struck the stone path.'
  );
  assert.equal(plainFirst.combat.responses[0].craftBonus, 0);
  assert.equal(plainFirst.combat.responses[0].damage, 30);
  assert.equal(craftedFirst.combat.responses[0].craftBonus, 4);
  assert.equal(craftedFirst.combat.responses[0].damage, 34);
  assert.equal(craftedFirst.combat.enemyHealth, 66);
  assert.ok(craftedFirst.combat.playerHealth > plainFirst.combat.playerHealth);

  plain = plainFirst.combat;
  crafted = craftedFirst.combat;
  for (const line of [
    'The cold air felt rough against the hero as the beast approached the tower.',
    'The hero moved like a hawk toward the creature and finished the fight at the beacon.',
  ]) {
    const plainResult = resolveCombatTurn(plain, line);
    const craftedResult = resolveCombatTurn(crafted, line);
    plain = plainResult.combat;
    crafted = craftedResult.combat;
  }
  assert.equal(plain.turn, 3);
  assert.equal(crafted.turn, 3);
  assert.equal(plain.enemyHealth, 0);
  assert.equal(crafted.enemyHealth, 0);
  assert.equal(plain.status, 'victory');
  assert.equal(crafted.status, 'victory');
});

test('repeated padding and preference phrasing do not earn writing craft', () => {
  const monster = createMonsterFromWriting({ text: opening });
  const combat = createCombatState({ monster, openingText: opening });
  const repeated = resolveCombatTurn(
    combat,
    'charged charged charged charged charged charged charged charged'
  );
  assert.equal(repeated.assessment.valid, false);
  assert.match(repeated.assessment.message, /new details/i);
  assert.equal(repeated.combat.turn, 0);
  assert.equal(repeated.combat.currentDraft, 'charged charged charged charged charged charged charged charged');
  assert.equal(repeated.combat.responses.length, 0);

  const soundEffect = assessCombatResponse(
    'Crash! Crash! Crash! Crash! Crash! The tower shook and fell.',
    1
  );
  assert.equal(soundEffect.valid, true);
  assert.equal(soundEffect.hasSensory, true);

  const turnThree = assessCombatResponse(
    'I like a pizza and charged through the tower with my blade.',
    2
  );
  assert.equal(turnThree.valid, false);
  assert.equal(turnThree.hasSimile, false);
  assert.match(turnThree.message, /simile/i);

  for (const preference of [
    'I do not like the creature and I will defeat it quickly now.',
    "I don't like the creature and I will defeat it quickly now.",
    'I really do not like the creature and I will defeat it now.',
    'I feel like I can finally defeat the creature at the beacon tonight.',
    'The guardian looked like he might fall but then rushed forward to fight.',
  ]) {
    const result = assessCombatResponse(preference, 2);
    assert.equal(result.hasSimile, false, preference);
    assert.equal(result.valid, false, preference);
  }
  const comparison = assessCombatResponse(
    'The hero moved like a hawk through the icy air and struck the creature.',
    2
  );
  assert.equal(comparison.valid, true);
  assert.equal(comparison.hasSimile, true);

  const ordinary = assessCombatResponse(
    'The guardian charged and charged across the stones while the creature waited.',
    0
  );
  assert.equal(ordinary.valid, true);
  assert.equal(ordinary.craftBonus, 0);
});

test('saved battle lines keep feedback and craft impact across a reload', () => {
  const monster = createMonsterFromWriting({ text: opening });
  const combat = createCombatState({ monster, openingText: opening });
  const first = resolveCombatTurn(
    combat,
    'The guardian charged like a bolt of lightning as cold rain struck the stone path.'
  );
  const reloaded = JSON.parse(JSON.stringify(first.combat));
  assert.equal(reloaded.responses[0].craftBonus, 4);
  assert.match(reloaded.responses[0].strength, /action word/i);
  assert.match(reloaded.responses[0].nextStep, /creature reacts/i);

  // A previously saved response with no new rubric fields remains playable.
  delete reloaded.responses[0].craftBonus;
  delete reloaded.responses[0].strength;
  delete reloaded.responses[0].nextStep;
  const second = resolveCombatTurn(
    reloaded,
    'The cold air felt rough against the hero as the beast approached the tower.'
  );
  assert.equal(second.assessment.valid, true);
  assert.equal(second.combat.turn, 2);
  assert.equal(second.combat.responses.length, 2);
  assert.match(second.combat.responses[1].strength, /sensory detail/i);
});

test('Simile Power requires a simile and reduces retaliation when used', () => {
  const monster = createMonsterFromWriting({ text: opening, domain: 'Kelp Forest' });
  const combat = createCombatState({ monster, openingText: opening });

  const rejected = resolveCombatTurn(
    combat,
    'The guardian charged across the stones and struck the creature with the blade.',
    { specialArmed: true }
  );
  assert.equal(rejected.assessment.valid, false);
  assert.match(rejected.assessment.message, /simile/i);

  const powered = resolveCombatTurn(
    combat,
    'The guardian charged like a falling star and struck the creature with the blade.',
    { specialArmed: true }
  );
  assert.equal(powered.assessment.valid, true);
  assert.equal(powered.assessment.usedSpecial, true);
  assert.equal(powered.combat.specialMoveReady, false);
  assert.ok(powered.combat.responses[0].retaliation < 10);
});
