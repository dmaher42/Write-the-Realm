export const QuestState = {
  active:   new Set(),
  complete: new Set(),
};

export function acceptQuest(id) {
  if (!id) return;
  QuestState.complete.delete(id);
  QuestState.active.add(id);
}

export function completeQuest(id) {
  if (!id) return;
  QuestState.active.delete(id);
  QuestState.complete.add(id);
}

export function isActive(id)    { return QuestState.active.has(id); }
export function isComplete(id)  { return QuestState.complete.has(id); }
