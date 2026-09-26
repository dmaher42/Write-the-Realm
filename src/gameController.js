const STORAGE_VERSION = 2;
const CHAPTER_ONE_ID = 'chapter-one-broken-beacon';
const BATTLE_JOURNAL_HEADING = '\n\nBattle at the Beacon\n';

const ACTION_WORDS = [
  'charge',
  'climb',
  'dodge',
  'race',
  'search',
  'shield',
  'sprint',
  'struggle',
];

const ACTION_WORD_FORMS = {
  charge: ['charge', 'charges', 'charged', 'charging'],
  climb: ['climb', 'climbs', 'climbed', 'climbing'],
  dodge: ['dodge', 'dodges', 'dodged', 'dodging'],
  race: ['race', 'races', 'raced', 'racing'],
  search: ['search', 'searches', 'searched', 'searching'],
  shield: ['shield', 'shields', 'shielded', 'shielding'],
  sprint: ['sprint', 'sprints', 'sprinted', 'sprinting'],
  struggle: ['struggle', 'struggles', 'struggled', 'struggling'],
};

const GOALS = [
  'reach the broken beacon',
  'warn the village before nightfall',
  'recover the Elder’s missing map',
  'relight the signal above the harbour',
];

const OBSTACLES = [
  'a wall of poisonous fog',
  'a flooded path beneath the cliffs',
  'a creature guarding the ruined tower',
  'a violent storm closing over the village',
];

const REWARDS = {
  'Coral Reef': { name: 'Tidal Blade', slot: 'weapon' },
  'Deep Trench': { name: 'Abyssal Helm', slot: 'head' },
  'Kelp Forest': { name: 'Verdant Mail', slot: 'chest' },
  default: { name: 'Beacon Keeper’s Charm', slot: 'head' },
};

export function createInitialState() {
  return {
    version: STORAGE_VERSION,
    phase: 'start',
    selectedGuardian: '',
    selectedDomain: '',
    player: {
      level: 1,
      xp: 0,
      attack: 8,
      health: 100,
      speed: 5,
    },
    journalEntries: [],
    inventory: [],
    equipment: { head: '', chest: '', weapon: '' },
    activeQuest: null,
    completedQuests: [],
    flags: {},
    prewrite: {
      actionWord: '',
      focus: { who: '', goal: '', obstacle: '' },
      sentence: '',
    },
    draft: '',
    pendingReward: null,
    lastSavedAt: null,
  };
}

export function normaliseState(saved) {
  const defaults = createInitialState();
  const source = saved && typeof saved === 'object' ? saved : {};

  return {
    ...defaults,
    ...source,
    version: STORAGE_VERSION,
    player: {
      ...defaults.player,
      ...(source.player && typeof source.player === 'object' ? source.player : {}),
    },
    equipment: {
      ...defaults.equipment,
      ...(source.equipment && typeof source.equipment === 'object'
        ? source.equipment
        : {}),
    },
    prewrite: {
      ...defaults.prewrite,
      ...(source.prewrite && typeof source.prewrite === 'object'
        ? source.prewrite
        : {}),
      focus: {
        ...defaults.prewrite.focus,
        ...(source.prewrite?.focus && typeof source.prewrite.focus === 'object'
          ? source.prewrite.focus
          : {}),
      },
    },
    journalEntries: Array.isArray(source.journalEntries)
      ? source.journalEntries
      : defaults.journalEntries,
    inventory: Array.isArray(source.inventory)
      ? source.inventory
      : defaults.inventory,
    completedQuests: Array.isArray(source.completedQuests)
      ? source.completedQuests
      : defaults.completedQuests,
    flags:
      source.flags && typeof source.flags === 'object'
        ? source.flags
        : defaults.flags,
  };
}

function replaceState(target, nextState) {
  Object.keys(target).forEach((key) => delete target[key]);
  Object.assign(target, nextState);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsActionWord(sentence, actionWord) {
  const forms = ACTION_WORD_FORMS[actionWord] || [actionWord];
  const pattern = forms.map(escapeRegExp).join('|');
  return new RegExp(`\\b(?:${pattern})\\b`, 'i').test(sentence);
}

function createTextElement(tagName, text, className = '') {
  const element = document.createElement(tagName);
  element.textContent = text;
  if (className) element.className = className;
  return element;
}

export function chapterOpeningText(entry, combat) {
  const journalText = String(entry?.text || '');
  const battleStart = journalText.indexOf(BATTLE_JOURNAL_HEADING);
  const journalOpening = (battleStart < 0 ? journalText : journalText.slice(0, battleStart)).trim();
  if (journalOpening) return journalOpening;
  return typeof combat?.openingText === 'string' ? combat.openingText.trim() : '';
}

export function composeChapterJournal(opening, combat, previousText = '') {
  const oldBattleStart = String(previousText).indexOf(BATTLE_JOURNAL_HEADING);
  if (oldBattleStart >= 0) {
    return `${opening}${String(previousText).slice(oldBattleStart)}`;
  }

  // A legacy save can have the battle responses without a composed journal entry.
  const responses = Array.isArray(combat?.responses) ? combat.responses : [];
  const lines = responses.filter((response) => typeof response?.text === 'string' && response.text.trim())
    .map((response, index) => `Turn ${response.turn || index + 1}: ${response.text.trim()}`);
  return lines.length ? `${opening}${BATTLE_JOURNAL_HEADING}${lines.join('\n')}` : opening;
}

export function chapterWritingFeedback(combat) {
  const responses = Array.isArray(combat?.responses) ? combat.responses : [];
  for (let index = responses.length - 1; index >= 0; index -= 1) {
    const response = responses[index];
    if (typeof response?.strength === 'string' && response.strength.trim()
      && typeof response?.nextStep === 'string' && response.nextStep.trim()) {
      return `Turn ${response.turn || index + 1} — Strength: ${response.strength.trim()} Next step: ${response.nextStep.trim()}`;
    }
  }

  // Older saves only retain the accepted writing, without the newer feedback fields.
  for (let index = responses.length - 1; index >= 0; index -= 1) {
    const response = responses[index];
    if (typeof response?.text !== 'string' || !response.text.trim()) continue;
    const round = Number(response.turn) || index + 1;
    if (round === 3) {
      return 'Strength: Your final battle line met the simile target. Next step: Try a comparison in your opening that makes the danger easier to picture.';
    }
    if (round === 2) {
      return 'Strength: Your second battle line met the sensory-detail target. Next step: Try adding one sound, sight or touch to your opening.';
    }
    if (round === 1) {
      return 'Strength: Your first battle line met the action-verb target. Next step: Try choosing a more precise verb in your opening.';
    }
  }

  return 'You completed the chapter opening. Next step: Try adding one precise sensory detail when you revise it.';
}

export function initGameController({
  gameState,
  saveGame,
  loadGame,
  checkForSavedGame,
}) {
  if (!gameState || typeof saveGame !== 'function' || typeof loadGame !== 'function') {
    throw new TypeError('Game controller requires state, saveGame, and loadGame.');
  }

  replaceState(gameState, normaliseState(gameState));

  const elements = {
    startModal: document.getElementById('start-modal'),
    characterCreator: document.getElementById('character-creator'),
    uiContainer: document.getElementById('ui-container'),
    newGameBtn: document.getElementById('new-game-btn'),
    continueGameBtn: document.getElementById('continue-game-btn'),
    startGameBtn: document.getElementById('start-game-btn'),
    guardianOptions: document.getElementById('guardian-type-options'),
    domainOptions: document.getElementById('guardian-domain-options'),
    customGuardianInput: document.getElementById('custom-guardian-input'),
    questLog: document.getElementById('quest-log'),
    questLogContent: document.getElementById('quest-log-content'),
    minimiseQuestLogBtn: document.getElementById('minimize-quest-log'),
    playerLevelInfo: document.getElementById('player-level-info'),
    xpBar: document.getElementById('xp-bar'),
    playerAttack: document.getElementById('player-attack'),
    playerHealth: document.getElementById('player-health'),
    playerSpeed: document.getElementById('player-speed'),
    slotHead: document.getElementById('slot-head'),
    slotChest: document.getElementById('slot-chest'),
    slotWeapon: document.getElementById('slot-weapon'),
    questTitle: document.getElementById('quest-title'),
    questObjective: document.getElementById('quest-objective'),
    saveGameBtn: document.getElementById('save-game-btn'),
    openJournalBtn: document.getElementById('open-journal-inventory-btn'),
    dialogueBox: document.getElementById('dialogue-box'),
    dialogueTitle: document.getElementById('dialogue-title'),
    dialogueText: document.getElementById('dialogue-text'),
    dialogueButton: document.getElementById('dialogue-button'),
    villageHub: document.getElementById('village-hub'),
    villagePlaceText: document.getElementById('village-place-text'),
    villagePlaceMarket: document.getElementById('village-place-market'),
    villagePlaceChapel: document.getElementById('village-place-chapel'),
    villagePlaceKeep: document.getElementById('village-place-keep'),
    villageReadJournal: document.getElementById('village-read-journal'),
    villageClose: document.getElementById('village-close'),
    villageGateAction: document.getElementById('village-gate-action'),
    prewritePanel: document.getElementById('prewrite-battle'),
    preActionBank: document.getElementById('pre-action-bank'),
    focusWho: document.getElementById('focus-who'),
    focusGoal: document.getElementById('focus-goal'),
    focusObstacle: document.getElementById('focus-obstacle'),
    prewriteSentence: document.getElementById('prewrite-sentence'),
    prewriteShuffleBtn: document.getElementById('prewrite-roll-btn'),
    prewriteSubmitBtn: document.getElementById('prewrite-submit-btn'),
    prewriteFeedback: document.getElementById('prewrite-feedback'),
    writingPanel: document.getElementById('writing-challenge'),
    narrativeStage: document.getElementById('narrative-stage'),
    challengeTitle: document.getElementById('challenge-title'),
    challengePrompt: document.getElementById('challenge-prompt'),
    currentTips: document.getElementById('current-tips'),
    actionWordBank: document.getElementById('action-word-bank'),
    writingInput: document.getElementById('writing-input'),
    writingSubmit: document.getElementById('writing-submit'),
    questCompletePanel: document.getElementById('quest-complete'),
    rewardText: document.getElementById('reward-text'),
    improvementSuggestion: document.getElementById('improvement-suggestion'),
    tryAgainBtn: document.getElementById('try-again-btn'),
    continueQuestingBtn: document.getElementById('continue-questing-btn'),
    journalPanel: document.getElementById('journal-panel'),
    journalEntries: document.getElementById('journal-entries'),
    achievementsList: document.getElementById('achievements-list'),
    storyTab: document.getElementById('story-tab'),
    achievementsTab: document.getElementById('achievements-tab'),
    inventoryList: document.getElementById('inventory-list'),
    copyJournalBtn: document.getElementById('copy-journal-btn'),
    closeJournalBtn: document.getElementById('close-journal-btn'),
    lootPanel: document.getElementById('loot-panel'),
    lootCard: document.getElementById('loot-card'),
    lootEquipBtn: document.getElementById('loot-equip-btn'),
    lootCloseBtn: document.getElementById('loot-close-btn'),
    messageBox: document.getElementById('message-box'),
    messageText: document.getElementById('message-text'),
    messageButton: document.getElementById('message-button'),
    autosaveNotification: document.getElementById('autosave-notification'),
    interactPrompt: document.getElementById('interact-prompt'),
    legacyRealmViewer: document.getElementById('realm-3d'),
  };

  const flowPanels = [
    elements.dialogueBox,
    elements.villageHub,
    elements.prewritePanel,
    elements.writingPanel,
    elements.questCompletePanel,
    elements.journalPanel,
    elements.lootPanel,
  ].filter(Boolean);

  let draftSaveTimer = null;
  let journalOpenedFromVillage = false;

  const villagePlaces = [
    {
      button: elements.villagePlaceMarket,
      text: 'Market Garden: The fields are growing again, and neighbours trade fresh food beside the path. The beacon guides supply boats safely into the harbour.',
    },
    {
      button: elements.villagePlaceChapel,
      text: 'Harbour Chapel: Lanterns shine in the windows. The villagers gather here to remember the storm and thank you for bringing light back to Kokura.',
    },
    {
      button: elements.villagePlaceKeep,
      text: 'Kokura Keep: From the high windows, you can see the restored beacon across the water. Its steady light tells every traveller that the village is safe.',
    },
  ];

  function setVisible(element, visible, visibleDisplay = 'block') {
    if (!element) return;
    element.style.display = visible ? visibleDisplay : 'none';
  }

  function hideFlowPanels(except = null) {
    flowPanels.forEach((panel) => {
      if (panel !== except) setVisible(panel, false);
    });
  }

  function showMessage(message) {
    if (!elements.messageBox || !elements.messageText) return;
    elements.messageText.textContent = message;
    setVisible(elements.messageBox, true);
  }

  function closeMessage() {
    setVisible(elements.messageBox, false);
  }

  function persist({ manual = false } = {}) {
    gameState.lastSavedAt = new Date().toISOString();
    saveGame(gameState);

    if (elements.continueGameBtn) {
      elements.continueGameBtn.disabled = false;
    }

    if (elements.autosaveNotification) {
      elements.autosaveNotification.textContent = manual
        ? 'Game saved.'
        : 'Auto-saving...';
      elements.autosaveNotification.style.opacity = '1';
      window.setTimeout(() => {
        elements.autosaveNotification.style.opacity = '0';
      }, 1300);
    }
  }

  function gainXp(amount) {
    gameState.player.xp += amount;
    while (gameState.player.xp >= gameState.player.level * 100) {
      gameState.player.xp -= gameState.player.level * 100;
      gameState.player.level += 1;
      gameState.player.attack += 2;
      gameState.player.health += 10;
    }
  }

  function renderHud() {
    const guardianName = gameState.selectedGuardian || 'Guardian';
    if (elements.playerLevelInfo) {
      elements.playerLevelInfo.textContent = `Level ${gameState.player.level} ${guardianName}`;
    }

    if (elements.xpBar) {
      const target = Math.max(100, gameState.player.level * 100);
      const percent = Math.min(100, (gameState.player.xp / target) * 100);
      elements.xpBar.style.width = `${percent}%`;
    }

    if (elements.playerAttack) elements.playerAttack.textContent = gameState.player.attack;
    if (elements.playerHealth) elements.playerHealth.textContent = gameState.player.health;
    if (elements.playerSpeed) elements.playerSpeed.textContent = gameState.player.speed;
    if (elements.slotHead) elements.slotHead.textContent = gameState.equipment.head || 'Empty';
    if (elements.slotChest) elements.slotChest.textContent = gameState.equipment.chest || 'Empty';
    if (elements.slotWeapon) elements.slotWeapon.textContent = gameState.equipment.weapon || 'Empty';

    if (elements.questTitle && elements.questObjective) {
      if (gameState.activeQuest) {
        elements.questTitle.textContent = gameState.activeQuest.title;
        elements.questObjective.textContent = gameState.activeQuest.objective;
      } else if (gameState.completedQuests.includes(CHAPTER_ONE_ID)) {
        elements.questTitle.textContent = 'Chapter 1 complete';
        elements.questObjective.textContent = 'Visit the Elder’s Gate to explore Kokura and read your story.';
      } else {
        elements.questTitle.textContent = 'Find the Village Elder';
        elements.questObjective.textContent = 'The Elder is waiting near the village gate.';
      }
    }
  }

  function setSelection(container, selectedElement) {
    if (!container || !selectedElement) return;
    container.querySelectorAll('.creator-option').forEach((option) => {
      option.classList.toggle('selected', option === selectedElement);
      option.setAttribute('aria-pressed', option === selectedElement ? 'true' : 'false');
    });

    if (container === elements.guardianOptions && elements.customGuardianInput) {
      const isCustom = selectedElement.dataset.type === 'custom';
      elements.customGuardianInput.style.display = isCustom ? 'block' : 'none';
      if (isCustom) elements.customGuardianInput.focus();
    }

    refreshCreatorButton();
  }

  function refreshCreatorButton() {
    if (!elements.startGameBtn) return;
    const guardian = elements.guardianOptions?.querySelector('.creator-option.selected');
    const domain = elements.domainOptions?.querySelector('.creator-option.selected');
    const customValid =
      guardian?.dataset.type !== 'custom' ||
      Boolean(elements.customGuardianInput?.value.trim());
    elements.startGameBtn.disabled = !(guardian && domain && customValid);
  }

  function bindOptionGroup(container) {
    if (!container) return;
    container.querySelectorAll('.creator-option').forEach((option) => {
      option.setAttribute('aria-pressed', 'false');
      option.addEventListener('click', () => setSelection(container, option));
      option.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setSelection(container, option);
        }
      });
    });
  }

  function openCreator() {
    replaceState(gameState, createInitialState());
    setVisible(elements.startModal, false);
    setVisible(elements.characterCreator, true, 'flex');
    if (elements.uiContainer) elements.uiContainer.style.visibility = 'hidden';

    elements.guardianOptions?.querySelectorAll('.creator-option').forEach((option) => {
      option.classList.remove('selected');
      option.setAttribute('aria-pressed', 'false');
    });
    elements.domainOptions?.querySelectorAll('.creator-option').forEach((option) => {
      option.classList.remove('selected');
      option.setAttribute('aria-pressed', 'false');
    });
    if (elements.customGuardianInput) {
      elements.customGuardianInput.value = '';
      elements.customGuardianInput.style.display = 'none';
    }
    refreshCreatorButton();
    elements.guardianOptions?.querySelector('.creator-option')?.focus();
  }

  function showGameShell() {
    setVisible(elements.startModal, false);
    setVisible(elements.characterCreator, false);
    if (elements.uiContainer) elements.uiContainer.style.visibility = 'visible';
    if (elements.legacyRealmViewer) elements.legacyRealmViewer.style.display = 'none';
    renderHud();
  }

  function beginNewJourney() {
    const guardianOption = elements.guardianOptions?.querySelector('.creator-option.selected');
    const domainOption = elements.domainOptions?.querySelector('.creator-option.selected');

    if (!guardianOption || !domainOption) {
      showMessage('Choose both a hero and a realm before beginning.');
      return;
    }

    const customName = elements.customGuardianInput?.value.trim() || '';
    const guardian =
      guardianOption.dataset.type === 'custom'
        ? customName
        : guardianOption.dataset.type;

    if (!guardian) {
      showMessage('Give your custom hero a name before beginning.');
      return;
    }

    gameState.selectedGuardian = guardian;
    gameState.selectedDomain = domainOption.dataset.domain || '';
    gameState.phase = 'exploring';
    gameState.prewrite.focus.who = guardian;
    showGameShell();
    persist();

    window.setTimeout(() => {
      if (!gameState.activeQuest && !gameState.completedQuests.includes(CHAPTER_ONE_ID)) {
        presentElderDialogue();
      }
    }, 350);
  }

  function continueJourney() {
    const loaded = loadGame();
    if (!loaded) {
      showMessage('No saved journey was found. Start a new legend instead.');
      if (elements.continueGameBtn) elements.continueGameBtn.disabled = true;
      return;
    }

    replaceState(gameState, normaliseState(loaded));
    showGameShell();
    resumePhase();
  }

  function presentElderDialogue() {
    hideFlowPanels(elements.dialogueBox);
    if (elements.dialogueTitle) elements.dialogueTitle.textContent = 'Village Elder';
    if (elements.dialogueText) {
      elements.dialogueText.textContent =
        `${gameState.selectedGuardian}, the signal above Kokura has gone dark. ` +
        'Plan your route to the broken beacon, then write the opening of your legend.';
    }
    if (elements.dialogueButton) {
      elements.dialogueButton.textContent = 'Accept Chapter 1';
      elements.dialogueButton.onclick = acceptChapterOne;
    }
    setVisible(elements.dialogueBox, true);
  }

  function selectVillagePlace(place) {
    for (const choice of villagePlaces) {
      choice.button?.setAttribute('aria-pressed', choice === place ? 'true' : 'false');
    }
    if (elements.villagePlaceText) elements.villagePlaceText.textContent = place.text;
  }

  function openVillageHub({ resetSelection = true } = {}) {
    closeMessage();
    if (elements.interactPrompt) elements.interactPrompt.style.display = 'none';
    hideFlowPanels(elements.villageHub);
    if (resetSelection) {
      journalOpenedFromVillage = false;
      for (const place of villagePlaces) place.button?.setAttribute('aria-pressed', 'false');
      if (elements.villagePlaceText) {
        elements.villagePlaceText.textContent = 'Choose a place to hear what has changed in the village.';
      }
    }
    setVisible(elements.villageHub, true);
    elements.villagePlaceMarket?.focus();
  }

  function closeVillageHub() {
    setVisible(elements.villageHub, false);
    elements.villageGateAction?.focus();
  }

  function createFocus() {
    gameState.prewrite.focus = {
      who: gameState.selectedGuardian || 'The hero',
      goal: randomItem(GOALS),
      obstacle: randomItem(OBSTACLES),
    };
  }

  function acceptChapterOne() {
    if (!gameState.activeQuest) {
      gameState.activeQuest = {
        id: CHAPTER_ONE_ID,
        title: 'Chapter 1: The Broken Beacon',
        objective: 'Plan a strong action sentence before writing the opening scene.',
        status: 'prewrite',
        rewardClaimed: false,
        journalEntryId: null,
      };
    }
    gameState.phase = 'prewrite';
    if (!gameState.prewrite.focus.goal) createFocus();
    persist();
    renderHud();
    showPrewrite();
  }

  function renderPrewrite() {
    if (elements.focusWho) elements.focusWho.textContent = gameState.prewrite.focus.who;
    if (elements.focusGoal) elements.focusGoal.textContent = gameState.prewrite.focus.goal;
    if (elements.focusObstacle) elements.focusObstacle.textContent = gameState.prewrite.focus.obstacle;
    if (elements.prewriteSentence) elements.prewriteSentence.value = gameState.prewrite.sentence || '';

    if (elements.preActionBank) {
      elements.preActionBank.replaceChildren();
      ACTION_WORDS.forEach((word) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip';
        chip.textContent = word;
        const selected = gameState.prewrite.actionWord === word;
        chip.classList.toggle('selected', selected);
        chip.setAttribute('aria-pressed', selected ? 'true' : 'false');
        if (selected) {
          chip.style.background = '#e0f2f1';
          chip.style.borderColor = '#00796b';
        }
        chip.addEventListener('click', () => {
          gameState.prewrite.actionWord = word;
          renderPrewrite();
          elements.prewriteSentence?.focus();
        });
        elements.preActionBank.appendChild(chip);
      });
    }
  }

  function showPrewrite() {
    hideFlowPanels(elements.prewritePanel);
    if (!gameState.prewrite.focus.goal) createFocus();
    renderPrewrite();
    if (elements.prewriteFeedback) elements.prewriteFeedback.replaceChildren();
    setVisible(elements.prewritePanel, true);
  }

  function shufflePrewrite() {
    createFocus();
    gameState.prewrite.sentence = '';
    renderPrewrite();
  }

  function submitPrewrite() {
    const sentence = elements.prewriteSentence?.value.trim() || '';
    const actionWord = gameState.prewrite.actionWord;
    gameState.prewrite.sentence = sentence;

    let message = '';
    if (!actionWord) {
      message = 'Choose an action word first.';
    } else if (sentence.split(/\s+/).filter(Boolean).length < 6) {
      message = 'Write one clear sentence of at least six words.';
    } else if (!containsActionWord(sentence, actionWord)) {
      message = `Use the action word “${actionWord}” in your sentence.`;
    }

    if (message) {
      if (elements.prewriteFeedback) {
        elements.prewriteFeedback.textContent = message;
        elements.prewriteFeedback.className = 'mt-2 feedback-error';
      }
      return;
    }

    if (elements.prewriteFeedback) {
      elements.prewriteFeedback.textContent = 'Strong plan. The path to the beacon is open.';
      elements.prewriteFeedback.className = 'mt-2 feedback-success';
    }

    gameState.phase = 'writing';
    gameState.activeQuest.status = 'writing';
    gameState.activeQuest.objective = 'Write the opening scene of Chapter 1.';
    persist();
    renderHud();
    window.setTimeout(showWriting, 450);
  }

  function insertWord(textarea, word) {
    if (!textarea) return;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    const prefix = before && !/\s$/.test(before) ? ' ' : '';
    const suffix = after && !/^\s/.test(after) ? ' ' : '';
    textarea.value = `${before}${prefix}${word}${suffix}${after}`;
    const cursor = before.length + prefix.length + word.length + suffix.length;
    textarea.setSelectionRange(cursor, cursor);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.focus();
  }

  function renderWritingWordBank() {
    if (!elements.actionWordBank) return;
    elements.actionWordBank.replaceChildren();
    ACTION_WORDS.forEach((word) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = word;
      chip.addEventListener('click', () => insertWord(elements.writingInput, word));
      elements.actionWordBank.appendChild(chip);
    });
  }

  function showWriting() {
    hideFlowPanels(elements.writingPanel);
    if (elements.narrativeStage) elements.narrativeStage.textContent = 'Chapter 1: The Broken Beacon';
    if (elements.challengeTitle) elements.challengeTitle.textContent = 'Write the opening scene';
    if (elements.challengePrompt) {
      elements.challengePrompt.textContent =
        `Your ${gameState.selectedGuardian} must ${gameState.prewrite.focus.goal}, ` +
        `but ${gameState.prewrite.focus.obstacle} stands in the way. ` +
        'Describe the setting, the danger and the first decisive action.';
    }
    if (elements.currentTips) {
      elements.currentTips.textContent =
        'Write at least 80 characters. Use a strong verb, one sensory detail and a clear obstacle.';
    }
    if (elements.writingInput) elements.writingInput.value = gameState.draft || '';
    if (elements.writingSubmit) elements.writingSubmit.textContent = 'Complete Chapter Opening';
    renderWritingWordBank();
    setVisible(elements.writingPanel, true);
    elements.writingInput?.focus();
  }

  function chapterReward() {
    return REWARDS[gameState.selectedDomain] || REWARDS.default;
  }

  function saveJournalEntry(text) {
    const existingId = gameState.activeQuest?.journalEntryId;
    const existing = gameState.journalEntries.find((entry) => entry.id === existingId);
    if (existing) {
      existing.text = text;
      existing.updatedAt = new Date().toISOString();
      return existing;
    }

    const entry = {
      id: `entry-${Date.now()}`,
      questId: CHAPTER_ONE_ID,
      title: 'Chapter 1: The Broken Beacon',
      stage: 'Opening',
      text,
      createdAt: new Date().toISOString(),
    };
    gameState.journalEntries.push(entry);
    gameState.activeQuest.journalEntryId = entry.id;
    return entry;
  }

  function submitWriting() {
    const text = elements.writingInput?.value.trim() || '';
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    if (text.length < 80 || wordCount < 15) {
      showMessage('Build the scene further: write at least 15 words and 80 characters.');
      return;
    }

    const revisingCompletedEntry = Boolean(gameState.activeQuest?.rewardClaimed);
    const previousEntry = gameState.journalEntries.find(
      (entry) => entry.id === gameState.activeQuest?.journalEntryId
    );
    const journalText = revisingCompletedEntry
      ? composeChapterJournal(text, gameState.combat, previousEntry?.text)
      : text;
    const entry = saveJournalEntry(journalText);
    if (revisingCompletedEntry && journalText.includes(BATTLE_JOURNAL_HEADING)) {
      entry.stage = 'Opening and Battle';
    }
    if (revisingCompletedEntry && gameState.combat) {
      gameState.combat.openingText = text;
    }
    gameState.draft = '';
    gameState.activeQuest.status = 'complete';
    gameState.activeQuest.objective = 'Collect the Elder’s reward.';

    if (!gameState.activeQuest.rewardClaimed) {
      gameState.activeQuest.rewardClaimed = true;
      gainXp(100);
      if (!gameState.completedQuests.includes(CHAPTER_ONE_ID)) {
        gameState.completedQuests.push(CHAPTER_ONE_ID);
      }
      gameState.pendingReward = chapterReward();
      gameState.phase = 'loot';
    } else {
      gameState.phase = 'reward';
    }

    persist();
    renderHud();
    if (gameState.phase === 'loot') showLoot();
    else showReward();
  }

  function ensureInventoryItem(item) {
    if (!item?.name) return;
    const exists = gameState.inventory.some((owned) => owned.name === item.name);
    if (!exists) gameState.inventory.push({ ...item });
  }

  function showLoot() {
    hideFlowPanels(elements.lootPanel);
    const item = gameState.pendingReward || chapterReward();
    if (elements.lootCard) {
      elements.lootCard.replaceChildren(
        createTextElement('h3', item.name, 'text-xl font-bold'),
        createTextElement('p', `Equipment slot: ${item.slot}`, 'mt-2'),
        createTextElement('p', 'Earned by completing the opening of Chapter 1.', 'mt-2')
      );
    }
    setVisible(elements.lootPanel, true);
    elements.lootEquipBtn?.focus();
  }

  function resolveLoot(equip) {
    const item = gameState.pendingReward || chapterReward();
    ensureInventoryItem(item);
    if (equip && item.slot && Object.hasOwn(gameState.equipment, item.slot)) {
      gameState.equipment[item.slot] = item.name;
    }
    gameState.pendingReward = null;
    gameState.phase = 'reward';
    persist();
    renderHud();
    showReward();
  }

  function showReward() {
    hideFlowPanels(elements.questCompletePanel);
    const reward = chapterReward();
    if (elements.rewardText) {
      elements.rewardText.textContent =
        `Chapter 1 complete. You earned 100 XP and the ${reward.name}.`;
    }
    if (elements.improvementSuggestion) {
      elements.improvementSuggestion.textContent = chapterWritingFeedback(gameState.combat);
    }
    if (elements.tryAgainBtn) elements.tryAgainBtn.textContent = 'Edit My Entry';
    if (elements.continueQuestingBtn) elements.continueQuestingBtn.textContent = 'Return to Village';
    setVisible(elements.questCompletePanel, true);
    elements.continueQuestingBtn?.focus();
  }

  function editCompletedEntry() {
    const entry = gameState.journalEntries.find(
      (candidate) => candidate.id === gameState.activeQuest?.journalEntryId
    );
    gameState.draft = chapterOpeningText(entry, gameState.combat);
    gameState.phase = 'writing';
    persist();
    showWriting();
  }

  function returnToVillage() {
    gameState.phase = 'exploring';
    gameState.activeQuest = null;
    persist();
    renderHud();
    hideFlowPanels();
    showMessage('Chapter 1 is saved in your journal. More of the realm can now be built on this foundation.');
  }

  function renderJournal() {
    if (elements.journalEntries) {
      elements.journalEntries.replaceChildren();
      if (gameState.journalEntries.length === 0) {
        elements.journalEntries.appendChild(
          createTextElement('p', 'Your story journal is empty. Complete a writing challenge to add an entry.')
        );
      } else {
        gameState.journalEntries.forEach((entry) => {
          const article = document.createElement('article');
          article.className = 'journal-entry';
          article.appendChild(createTextElement('h3', entry.title));
          article.appendChild(createTextElement('p', entry.stage, 'journal-stage'));
          article.appendChild(createTextElement('p', entry.text));
          elements.journalEntries.appendChild(article);
        });
      }
    }

    if (elements.achievementsList) {
      elements.achievementsList.replaceChildren();
      const completed = gameState.completedQuests.includes(CHAPTER_ONE_ID);
      const achievement = document.createElement('div');
      achievement.className = `achievement ${completed ? 'unlocked' : 'locked'}`;
      achievement.appendChild(
        createTextElement('h3', completed ? 'Beacon Writer' : 'Beacon Writer — Locked')
      );
      achievement.appendChild(
        createTextElement('p', 'Complete the opening scene of Chapter 1.')
      );
      elements.achievementsList.appendChild(achievement);
    }

    if (elements.inventoryList) {
      elements.inventoryList.replaceChildren();
      if (gameState.inventory.length === 0) {
        elements.inventoryList.appendChild(createTextElement('p', 'No items collected yet.'));
      } else {
        gameState.inventory.forEach((item) => {
          const row = createTextElement('div', `${item.name} — ${item.slot}`, 'loot-card');
          elements.inventoryList.appendChild(row);
        });
      }
    }
  }

  function openJournal() {
    hideFlowPanels(elements.journalPanel);
    renderJournal();
    setVisible(elements.journalEntries, true);
    setVisible(elements.achievementsList, false);
    elements.storyTab?.classList.add('active');
    elements.achievementsTab?.classList.remove('active');
    setVisible(elements.journalPanel, true);
  }

  async function copyJournal() {
    const story = gameState.journalEntries
      .map((entry) => `${entry.title}\n\n${entry.text}`)
      .join('\n\n');
    if (!story) {
      showMessage('There is no story to copy yet.');
      return;
    }

    try {
      await navigator.clipboard.writeText(story);
      showMessage('Story copied to the clipboard.');
    } catch (error) {
      console.warn('Clipboard unavailable', error);
      showMessage('Copying is unavailable in this browser. Your story remains saved in the journal.');
    }
  }

  function showInteractionHint(message) {
    if (!elements.interactPrompt) return;
    elements.interactPrompt.textContent = message;
    elements.interactPrompt.style.display = 'block';
    window.setTimeout(() => {
      elements.interactPrompt.style.display = 'none';
    }, 2500);
  }

  function resumePhase() {
    renderHud();
    switch (gameState.phase) {
      case 'prewrite':
        showPrewrite();
        break;
      case 'writing':
        showWriting();
        break;
      case 'loot':
        showLoot();
        break;
      case 'reward':
        showReward();
        break;
      default:
        hideFlowPanels();
        showInteractionHint(gameState.completedQuests.includes(CHAPTER_ONE_ID)
          ? 'Click the Elder’s Gate to explore Kokura.'
          : 'Click the village gate to revisit the Elder.');
        break;
    }
  }

  const gameApi = {
    openQuest(title) {
      if (gameState.phase === 'loot' || gameState.phase === 'reward') {
        resumePhase();
        return;
      }
      if (gameState.completedQuests.includes(CHAPTER_ONE_ID) && !gameState.activeQuest) {
        openVillageHub();
        return;
      }
      if (gameState.phase === 'writing' && gameState.activeQuest?.status === 'complete') {
        showWriting();
        return;
      }
      if (gameState.activeQuest?.status === 'writing') {
        gameState.phase = 'writing';
        showWriting();
        return;
      }
      if (gameState.activeQuest) {
        gameState.phase = 'prewrite';
        showPrewrite();
        return;
      }
      if (title) console.info('Opening quest:', title);
      presentElderDialogue();
    },

    grantLoot(itemName) {
      const item = {
        name: String(itemName || 'Village Keepsake'),
        slot: 'weapon',
      };
      ensureInventoryItem(item);
      persist();
      renderHud();
      showMessage(`${item.name} was added to your inventory.`);
    },

    setFlag(flag, value) {
      if (!flag) return;
      gameState.flags[flag] = value;
      persist();
    },

    refreshUI() {
      renderHud();
    },

    openShop() {
      showMessage('The market will open in a later upgrade.');
    },
  };

  bindOptionGroup(elements.guardianOptions);
  bindOptionGroup(elements.domainOptions);

  elements.customGuardianInput?.addEventListener('input', refreshCreatorButton);
  elements.newGameBtn?.addEventListener('click', openCreator);
  elements.continueGameBtn?.addEventListener('click', continueJourney);
  elements.startGameBtn?.addEventListener('click', beginNewJourney);
  elements.saveGameBtn?.addEventListener('click', () => {
    persist({ manual: true });
    showMessage('Your journey has been saved on this device.');
  });
  elements.messageButton?.addEventListener('click', closeMessage);
  elements.minimiseQuestLogBtn?.addEventListener('click', () => {
    elements.questLog?.classList.toggle('minimized');
    if (elements.minimiseQuestLogBtn) {
      elements.minimiseQuestLogBtn.textContent = elements.questLog?.classList.contains('minimized')
        ? '+'
        : '-';
    }
  });
  elements.prewriteShuffleBtn?.addEventListener('click', shufflePrewrite);
  elements.prewriteSubmitBtn?.addEventListener('click', submitPrewrite);
  elements.prewriteSentence?.addEventListener('input', () => {
    gameState.prewrite.sentence = elements.prewriteSentence.value;
  });
  elements.writingInput?.addEventListener('input', () => {
    gameState.draft = elements.writingInput.value;
    window.clearTimeout(draftSaveTimer);
    draftSaveTimer = window.setTimeout(() => persist(), 800);
  });
  elements.writingSubmit?.addEventListener('click', submitWriting);
  elements.lootEquipBtn?.addEventListener('click', () => resolveLoot(true));
  elements.lootCloseBtn?.addEventListener('click', () => resolveLoot(false));
  elements.tryAgainBtn?.addEventListener('click', editCompletedEntry);
  elements.continueQuestingBtn?.addEventListener('click', returnToVillage);
  elements.openJournalBtn?.addEventListener('click', () => {
    journalOpenedFromVillage = false;
    openJournal();
  });
  elements.closeJournalBtn?.addEventListener('click', () => {
    setVisible(elements.journalPanel, false);
    if (journalOpenedFromVillage) {
      journalOpenedFromVillage = false;
      openVillageHub({ resetSelection: false });
    }
  });
  for (const place of villagePlaces) {
    place.button?.addEventListener('click', () => selectVillagePlace(place));
  }
  elements.villageReadJournal?.addEventListener('click', () => {
    journalOpenedFromVillage = true;
    openJournal();
    elements.closeJournalBtn?.focus();
  });
  elements.villageClose?.addEventListener('click', closeVillageHub);
  elements.villageHub?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeVillageHub();
    }
  });
  elements.copyJournalBtn?.addEventListener('click', copyJournal);
  elements.storyTab?.addEventListener('click', () => {
    setVisible(elements.journalEntries, true);
    setVisible(elements.achievementsList, false);
    elements.storyTab.classList.add('active');
    elements.achievementsTab?.classList.remove('active');
  });
  elements.achievementsTab?.addEventListener('click', () => {
    setVisible(elements.journalEntries, false);
    setVisible(elements.achievementsList, true);
    elements.achievementsTab.classList.add('active');
    elements.storyTab?.classList.remove('active');
  });

  if (elements.continueGameBtn) {
    elements.continueGameBtn.disabled =
      typeof checkForSavedGame === 'function' ? !checkForSavedGame() : true;
  }
  if (elements.startGameBtn) elements.startGameBtn.disabled = true;
  renderHud();

  return {
    gameApi,
    refreshUI: renderHud,
    resumeCurrentPhase: resumePhase,
    startNewGame: openCreator,
    continueGame: continueJourney,
  };
}
