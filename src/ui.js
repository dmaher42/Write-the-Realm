import { acceptQuest, completeQuest } from './questState.js';
import { onOpen, onClose } from './dialogue.js';

let root;
let onAction;

export function initUI(rootSelector = '#ui-root') {
  root = document.querySelector(rootSelector) || document.body;
  onOpen(renderDialogue);
  onClose(destroyDialogue);
}

export function setActionHandler(fn) { onAction = fn; }

function renderDialogue({ npcName, lines, options }) {
  destroyDialogue();

  const wrap = document.createElement('div');
  wrap.id = 'dialogue-panel';
  Object.assign(wrap.style, {
    position:'absolute', left:'50%', top:'10%', transform:'translateX(-50%)',
    background:'rgba(10,20,30,0.9)', color:'#fff', padding:'16px 20px',
    borderRadius:'12px', width:'min(520px, 90vw)', zIndex: 1000, boxShadow:'0 6px 24px rgba(0,0,0,.4)'
  });

  const title = document.createElement('div');
  title.textContent = npcName;
  Object.assign(title.style, { fontWeight:'600', marginBottom:'8px', fontSize:'18px' });

  const text = document.createElement('div');
  text.innerHTML = lines.map(l => `<p style="margin:6px 0;">${l}</p>`).join('');

  const buttons = document.createElement('div');
  Object.assign(buttons.style, { display:'grid', gap:'8px', marginTop:'12px' });
  options.forEach(opt => {
    const b = document.createElement('button');
    b.textContent = opt.text;
    Object.assign(b.style, { padding:'10px 12px', borderRadius:'10px', border:'none', cursor:'pointer' });
    b.onclick = () => {
      if (opt.action === 'accept_quest') acceptQuest(opt.questId);
      if (opt.action === 'complete_quest') completeQuest(opt.questId);
      if (onAction) onAction(opt);
      if (opt.action === 'close' || opt.action === 'complete_quest') destroyDialogue();
    };
    buttons.appendChild(b);
  });

  const close = document.createElement('button');
  close.textContent = 'Close';
  Object.assign(close.style, { marginTop:'6px', padding:'8px 10px', borderRadius:'10px', border:'none', cursor:'pointer' });
  close.onclick = destroyDialogue;

  wrap.appendChild(title);
  wrap.appendChild(text);
  wrap.appendChild(buttons);
  wrap.appendChild(close);

  root.appendChild(wrap);
}

function destroyDialogue() {
  const old = document.getElementById('dialogue-panel');
  if (old && old.parentNode) old.parentNode.removeChild(old);
}
