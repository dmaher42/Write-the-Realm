const STORAGE_KEY = 'writeTheRealmTeacherSettingsV1';
const BASE_COMBAT_WORDS = [8, 10, 10];

export const TEACHER_PRESETS = Object.freeze({
  guided: Object.freeze({
    id: 'guided',
    label: 'Guided',
    description: 'Keeps the core writing targets and adds clickable sentence starters.',
    prewriteMinimumWords: 6,
    openingMinimumWords: 15,
    openingMinimumCharacters: 80,
    combatExtraWords: 0,
    showScaffolds: true,
    showSentenceStarters: true,
    allowSpecialMove: true,
  }),
  standard: Object.freeze({
    id: 'standard',
    label: 'Standard',
    description: 'Uses the normal Chapter 1 targets, word banks and Simile Power.',
    prewriteMinimumWords: 6,
    openingMinimumWords: 15,
    openingMinimumCharacters: 80,
    combatExtraWords: 0,
    showScaffolds: true,
    showSentenceStarters: false,
    allowSpecialMove: true,
  }),
  challenge: Object.freeze({
    id: 'challenge',
    label: 'Challenge',
    description: 'Raises writing targets, hides word banks and removes Simile Power.',
    prewriteMinimumWords: 10,
    openingMinimumWords: 30,
    openingMinimumCharacters: 160,
    combatExtraWords: 5,
    showScaffolds: false,
    showSentenceStarters: false,
    allowSpecialMove: false,
  }),
});

export function normaliseTeacherSettings(value) {
  const preset = typeof value === 'string' ? value : value?.preset;
  return {
    preset: Object.hasOwn(TEACHER_PRESETS, preset) ? preset : 'standard',
  };
}

export function requirementsForPreset(value, roundIndex = 0) {
  const settings = normaliseTeacherSettings(value);
  const preset = TEACHER_PRESETS[settings.preset];
  const safeRound = Math.max(0, Math.min(BASE_COMBAT_WORDS.length - 1, Number(roundIndex) || 0));

  return {
    ...preset,
    combatMinimumWords: BASE_COMBAT_WORDS[safeRound] + preset.combatExtraWords,
  };
}

function countWords(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean).length;
}

function readStoredSettings() {
  try {
    return normaliseTeacherSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
  } catch (error) {
    console.warn('Teacher settings could not be read', error);
    return normaliseTeacherSettings(null);
  }
}

function writeStoredSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Teacher settings could not be saved', error);
  }
}

function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);
  if (options.id) element.id = options.id;
  if (options.className) element.className = options.className;
  if (options.text) element.textContent = options.text;
  if (options.type) element.type = options.type;
  return element;
}

function insertAtCursor(input, text) {
  if (!input) return;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const before = input.value.slice(0, start);
  const after = input.value.slice(end);
  const prefix = before && !/\s$/.test(before) ? ' ' : '';
  const suffix = after && !/^\s/.test(after) ? ' ' : '';
  input.value = `${before}${prefix}${text}${suffix}${after}`;
  const cursor = before.length + prefix.length + text.length + suffix.length;
  input.setSelectionRange(cursor, cursor);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.focus();
}

function installStyles() {
  if (document.getElementById('teacher-settings-styles')) return;
  const style = createElement('style', { id: 'teacher-settings-styles' });
  style.textContent = `
    #teacher-settings-panel { z-index: 260; }
    #teacher-settings-panel .teacher-settings-grid {
      display: grid;
      gap: 0.75rem;
      text-align: left;
      margin: 1rem 0;
    }
    #teacher-settings-panel label {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.75rem;
      align-items: start;
      background: #fff;
      border: 2px solid var(--panel-border);
      border-radius: 8px;
      padding: 0.85rem;
      cursor: pointer;
    }
    #teacher-settings-panel label:has(input:checked) {
      border-color: #00796b;
      background: #e0f2f1;
    }
    #teacher-settings-panel input[type="radio"] {
      margin-top: 0.25rem;
      width: 1.1rem;
      height: 1.1rem;
    }
    #teacher-settings-summary {
      background: #fff;
      border-left: 4px solid #00796b;
      border-radius: 4px;
      padding: 0.75rem;
      text-align: left;
    }
    .teacher-starter-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      margin-top: 0.6rem;
      padding: 0.65rem;
      background: #f4f0e6;
      border: 1px dashed var(--panel-border);
      border-radius: 6px;
    }
    .teacher-starter-strip strong {
      width: 100%;
      font-size: 0.85rem;
    }
    .teacher-starter-strip button {
      margin: 0;
      padding: 0.4rem 0.65rem;
      font-family: 'Lora', serif;
      font-size: 0.82rem;
    }
    #teacher-settings-btn {
      font-size: 0.9rem;
      padding: 0.45rem 0.65rem;
    }
    #teacher-mode-indicator {
      display: block;
      margin-top: 0.35rem;
      font-size: 0.75rem;
      font-weight: 700;
    }
  `;
  document.head.appendChild(style);
}

function createStarterStrip(id, title, starters, target) {
  const strip = createElement('div', {
    id,
    className: 'teacher-starter-strip',
  });
  strip.appendChild(createElement('strong', { text: title }));
  starters.forEach((starter) => {
    const button = createElement('button', {
      type: 'button',
      text: starter,
    });
    button.addEventListener('click', () => insertAtCursor(target, starter));
    strip.appendChild(button);
  });
  return strip;
}

export function initTeacherSettings({ gameState, saveGame } = {}) {
  if (!gameState) throw new TypeError('Teacher settings require the shared game state.');

  installStyles();
  let settings = readStoredSettings();
  let applyQueued = false;
  let inputToRestore = null;

  const elements = {
    questLogContent: document.getElementById('quest-log-content'),
    saveGameBtn: document.getElementById('save-game-btn'),
    prewriteSubmit: document.getElementById('prewrite-submit-btn'),
    prewriteInput: document.getElementById('prewrite-sentence'),
    prewriteFeedback: document.getElementById('prewrite-feedback'),
    preActionBank: document.getElementById('pre-action-bank'),
    prewriteHint: document.querySelector('#prewrite-battle .hint'),
    writingSubmit: document.getElementById('writing-submit'),
    writingInput: document.getElementById('writing-input'),
    writingTips: document.getElementById('writing-tips-box'),
    actionWordBank: document.getElementById('action-word-bank'),
    combatSubmit: document.getElementById('combat-submit-btn'),
    combatInput: document.getElementById('combat-writing-input'),
    combatFeedback: document.getElementById('combat-feedback'),
    specialMove: document.getElementById('special-move-btn'),
    messageBox: document.getElementById('message-box'),
    messageText: document.getElementById('message-text'),
    messageButton: document.getElementById('message-button'),
    uiContainer: document.getElementById('ui-container'),
  };

  const teacherButton = createElement('button', {
    id: 'teacher-settings-btn',
    type: 'button',
    text: 'Teacher Settings',
  });
  const modeIndicator = createElement('span', {
    id: 'teacher-mode-indicator',
  });
  teacherButton.appendChild(modeIndicator);

  const controls = elements.saveGameBtn?.parentElement || elements.questLogContent;
  if (controls) controls.insertBefore(teacherButton, elements.saveGameBtn || null);

  const panel = createElement('div', {
    id: 'teacher-settings-panel',
    className: 'modal-backdrop',
  });
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'teacher-settings-heading');
  panel.style.display = 'none';

  const content = createElement('div', { className: 'modal-content' });
  const heading = createElement('h1', {
    id: 'teacher-settings-heading',
    text: 'Teacher Settings',
  });
  const intro = createElement('p', {
    text: 'Choose the amount of scaffolding and the writing targets for this device.',
  });
  const grid = createElement('div', { className: 'teacher-settings-grid' });
  const summary = createElement('div', { id: 'teacher-settings-summary' });

  Object.values(TEACHER_PRESETS).forEach((preset) => {
    const label = createElement('label');
    const radio = createElement('input', { type: 'radio' });
    radio.name = 'teacher-preset';
    radio.value = preset.id;
    const copy = createElement('span');
    copy.appendChild(createElement('strong', { text: preset.label }));
    copy.appendChild(createElement('span', {
      text: ` — ${preset.description}`,
    }));
    label.append(radio, copy);
    grid.appendChild(label);
  });

  const actions = createElement('div', { className: 'flex justify-center gap-4 flex-wrap' });
  const saveButton = createElement('button', {
    id: 'save-teacher-settings-btn',
    type: 'button',
    text: 'Save and Apply',
  });
  const closeButton = createElement('button', {
    id: 'close-teacher-settings-btn',
    type: 'button',
    text: 'Close',
  });
  actions.append(saveButton, closeButton);
  content.append(heading, intro, grid, summary, actions);
  panel.appendChild(content);
  document.body.appendChild(panel);

  const prewriteStarters = createStarterStrip(
    'teacher-prewrite-starters',
    'Sentence starters',
    [
      'I charged towards the beacon because',
      'To overcome the obstacle, my hero',
      'Without warning, I',
    ],
    elements.prewriteInput
  );
  elements.prewriteInput?.insertAdjacentElement('afterend', prewriteStarters);

  const writingStarters = createStarterStrip(
    'teacher-writing-starters',
    'Opening-scene starters',
    [
      'The air around the broken beacon',
      'Beyond the village, the path',
      'Without warning, the darkness',
    ],
    elements.writingInput
  );
  elements.writingInput?.insertAdjacentElement('afterend', writingStarters);

  const combatStarters = createStarterStrip(
    'teacher-combat-starters',
    'Battle-line starters',
    [
      'I charged forward and',
      'A deafening crack filled the air as',
      'I moved like a',
    ],
    elements.combatInput
  );
  elements.combatInput?.parentElement?.insertBefore(
    combatStarters,
    elements.combatInput.nextSibling
  );

  function currentPreset() {
    return TEACHER_PRESETS[settings.preset];
  }

  function updateSummary(presetId = settings.preset) {
    const requirements = requirementsForPreset({ preset: presetId });
    summary.replaceChildren(
      createElement('strong', { text: `${requirements.label} targets` }),
      document.createElement('br'),
      document.createTextNode(
        `Plan: ${requirements.prewriteMinimumWords}+ words. `
        + `Opening: ${requirements.openingMinimumWords}+ words and `
        + `${requirements.openingMinimumCharacters}+ characters. `
        + `Battle turns: ${BASE_COMBAT_WORDS.map((base) => base + requirements.combatExtraWords).join(', ')}+ words.`
      )
    );
  }

  function updateButton() {
    const preset = currentPreset();
    teacherButton.firstChild.textContent = 'Teacher Settings';
    modeIndicator.textContent = `${preset.label} mode`;
  }

  function setInlineDisplay(element, visible) {
    if (!element) return;
    const expected = visible ? '' : 'none';
    if (element.style.display !== expected) element.style.display = expected;
  }

  function applySettings() {
    const preset = currentPreset();
    if (!preset.allowSpecialMove && gameState.combat?.specialMoveArmed) {
      gameState.combat.specialMoveArmed = false;
      if (elements.combatInput) elements.combatInput.placeholder = 'Describe your action…';
      if (gameState.combat.feedback?.startsWith('Simile Power armed')) {
        gameState.combat.feedback = '';
        if (elements.combatFeedback) {
          elements.combatFeedback.textContent = '';
          elements.combatFeedback.className = 'combat-feedback';
        }
      }
      if (typeof saveGame === 'function') saveGame(gameState);
    }
    setInlineDisplay(elements.writingTips, preset.showScaffolds);
    setInlineDisplay(elements.actionWordBank?.parentElement, preset.showScaffolds);
    setInlineDisplay(elements.preActionBank?.parentElement, preset.showScaffolds);
    setInlineDisplay(elements.prewriteHint, preset.showScaffolds);
    setInlineDisplay(prewriteStarters, preset.showSentenceStarters);
    setInlineDisplay(writingStarters, preset.showSentenceStarters);
    setInlineDisplay(combatStarters, preset.showSentenceStarters);
    setInlineDisplay(elements.specialMove, preset.allowSpecialMove);
    updateButton();
  }

  function queueApplySettings() {
    if (applyQueued) return;
    applyQueued = true;
    window.queueMicrotask(() => {
      applyQueued = false;
      applySettings();
    });
  }

  function openPanel() {
    panel.querySelectorAll('input[name="teacher-preset"]').forEach((radio) => {
      radio.checked = radio.value === settings.preset;
    });
    updateSummary();
    panel.style.display = 'flex';
    panel.querySelector(`input[value="${settings.preset}"]`)?.focus();
  }

  function closePanel() {
    panel.style.display = 'none';
    teacherButton.focus();
  }

  function savePanel() {
    const selected = panel.querySelector('input[name="teacher-preset"]:checked');
    settings = normaliseTeacherSettings({ preset: selected?.value });
    writeStoredSettings(settings);
    applySettings();
    closePanel();
    document.dispatchEvent(new CustomEvent('write-the-realm:teacher-settings', {
      detail: { ...settings },
    }));
  }

  function showMessage(message) {
    if (!elements.messageBox || !elements.messageText) return;
    elements.messageText.textContent = message;
    elements.messageBox.style.display = 'block';
    elements.messageButton?.focus();
  }

  function stopSubmission(event, message, input) {
    event.preventDefault();
    event.stopImmediatePropagation();
    inputToRestore = input;
    showMessage(message);
    if (!elements.messageButton) input?.focus();
  }

  function restoreInputAfterMessage() {
    const input = inputToRestore;
    inputToRestore = null;
    if (!input) return;
    // The controller's click listener closes the alertdialog after this listener.
    // Wait for the entire click dispatch before moving focus back to the field.
    window.setTimeout(() => {
      if (elements.messageBox?.style.display === 'none'
        && input.isConnected && !input.disabled && input.getClientRects().length) {
        input.focus();
      }
    }, 0);
  }

  teacherButton.addEventListener('click', openPanel);
  elements.messageButton?.addEventListener('click', restoreInputAfterMessage);
  closeButton.addEventListener('click', closePanel);
  saveButton.addEventListener('click', savePanel);
  panel.addEventListener('change', (event) => {
    if (event.target.matches('input[name="teacher-preset"]')) {
      updateSummary(event.target.value);
    }
  });
  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanel();
  });

  elements.prewriteSubmit?.addEventListener('click', (event) => {
    const requirement = requirementsForPreset(settings);
    const words = countWords(elements.prewriteInput?.value);
    if (words >= requirement.prewriteMinimumWords) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (elements.prewriteFeedback) {
      elements.prewriteFeedback.textContent =
        `${requirement.label} mode requires at least ${requirement.prewriteMinimumWords} words in the plan.`;
      elements.prewriteFeedback.className = 'mt-2 feedback-error';
    }
    elements.prewriteInput?.focus();
  }, { capture: true });

  elements.writingSubmit?.addEventListener('click', (event) => {
    if (gameState.phase !== 'writing') return;
    const requirement = requirementsForPreset(settings);
    const text = elements.writingInput?.value.trim() || '';
    const words = countWords(text);
    if (
      words >= requirement.openingMinimumWords
      && text.length >= requirement.openingMinimumCharacters
    ) return;

    stopSubmission(
      event,
      `${requirement.label} mode requires at least ${requirement.openingMinimumWords} words `
        + `and ${requirement.openingMinimumCharacters} characters in the opening scene.`,
      elements.writingInput
    );
  }, { capture: true });

  elements.combatSubmit?.addEventListener('click', (event) => {
    const combat = gameState.combat;
    if (!combat || combat.status !== 'active') return;
    const requirement = requirementsForPreset(settings, combat.turn);
    const draft = elements.combatInput?.value || '';
    const words = countWords(draft);
    if (words >= requirement.combatMinimumWords) return;

    const message = `${requirement.label} mode requires at least ${requirement.combatMinimumWords} words for this battle turn.`;
    combat.currentDraft = draft;
    combat.feedback = message;
    if (elements.combatFeedback) {
      elements.combatFeedback.textContent = message;
      elements.combatFeedback.className = 'combat-feedback feedback-error';
    }
    if (typeof saveGame === 'function') saveGame(gameState);
    stopSubmission(
      event,
      message,
      elements.combatInput
    );
  }, { capture: true });

  elements.specialMove?.addEventListener('click', (event) => {
    if (currentPreset().allowSpecialMove) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    showMessage('Simile Power is unavailable in Challenge mode. The final turn still requires a simile.');
  }, { capture: true });

  const observer = elements.uiContainer
    ? new MutationObserver(queueApplySettings)
    : null;
  observer?.observe(elements.uiContainer, {
    attributes: true,
    subtree: true,
    attributeFilter: ['style', 'class'],
  });

  applySettings();

  return {
    open: openPanel,
    close: closePanel,
    getSettings: () => ({ ...settings }),
    setPreset(preset) {
      settings = normaliseTeacherSettings({ preset });
      writeStoredSettings(settings);
      applySettings();
    },
    requirements: (roundIndex = 0) => requirementsForPreset(settings, roundIndex),
    destroy() {
      observer?.disconnect();
      panel.remove();
      teacherButton.remove();
      prewriteStarters.remove();
      writingStarters.remove();
      combatStarters.remove();
    },
  };
}
