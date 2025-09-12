export const state = {
  currentQuestIndex: 0,
  quests: [],
  canInteractWith: null,
  isCombatActive: false,
};

export function resetState() {
  state.currentQuestIndex = 0;
  state.quests = [];
  state.canInteractWith = null;
  state.isCombatActive = false;
}

export function addQuest(quest) {
  state.quests.push({ ...quest, isComplete: false });
}

export function getCurrentQuest() {
  return state.quests[state.currentQuestIndex];
}

export function completeCurrentQuest() {
  const quest = getCurrentQuest();
  if (quest) {
    quest.isComplete = true;
  }
}

export function advanceQuest() {
  if (state.currentQuestIndex < state.quests.length - 1) {
    state.currentQuestIndex++;
    return true;
  }
  return false;
}
