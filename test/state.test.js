import test from 'node:test';
import assert from 'node:assert/strict';
import {
  state,
  resetState,
  addQuest,
  getCurrentQuest,
  completeCurrentQuest,
  advanceQuest
} from '../src/state.js';

// Ensure each test starts with a clean state
function setup() {
  resetState();
}

test('adding and retrieving quests works', () => {
  setup();
  addQuest({ id: 'q1', title: 'First Quest' });
  addQuest({ id: 'q2', title: 'Second Quest' });
  assert.equal(state.quests.length, 2);
  assert.deepEqual(getCurrentQuest().id, 'q1');
});

test('completing current quest sets flag', () => {
  setup();
  addQuest({ id: 'q1', title: 'Quest' });
  completeCurrentQuest();
  assert.ok(getCurrentQuest().isComplete);
});

test('advanceQuest moves to next quest when possible', () => {
  setup();
  addQuest({ id: 'q1' });
  addQuest({ id: 'q2' });
  assert.equal(state.currentQuestIndex, 0);
  const advanced = advanceQuest();
  assert.ok(advanced);
  assert.equal(state.currentQuestIndex, 1);
  // Cannot advance past last quest
  assert.equal(advanceQuest(), false);
  assert.equal(state.currentQuestIndex, 1);
});

