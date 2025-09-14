let _data = null;
let _openCb = null;
let _closeCb = null;

export async function loadDialogue() {
  if (_data) return _data;
  const res = await fetch('assets/data/dialogue.json', { cache: 'no-cache' });
  _data = await res.json();
  return _data;
}

// NPC name → { lines:[], options:[] }
export function getDialogueFor(npcName) {
  const d = _data?.[npcName];
  if (!d) return { lines: ["..."], options: [{ text: "Close", action: "close" }] };
  return { lines: d.intro ?? ["..."], options: d.options ?? [{ text: "Close", action: "close" }] };
}

// UI hooks (wired by ui.js)
export function onOpen(cb)  { _openCb  = cb; }
export function onClose(cb) { _closeCb = cb; }
export function open(payload) { _openCb && _openCb(payload); }
export function close()       { _closeCb && _closeCb(); }
