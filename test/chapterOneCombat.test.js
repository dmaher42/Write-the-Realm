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

  const sensory = assessCombatResponse(
    'A deafening roar echoed through the cold tower as the rough stones shook below.',
    1
  );
  assert.equal(sensory.valid, true);
  assert.equal(sensory.hasSensory, true);

  const simile = assessCombatResponse(
    'The guardian sprang like a silver arrow and drove the blade through the dark mist.',
    2
  );
  assert.equal(simile.valid, true);
  assert.equal(simile.hasSimile, true);

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
  assert.equal(result.combat.enemyHealth, 40);
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
