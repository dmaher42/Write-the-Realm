const CHAPTER_ONE_ID = 'chapter-one-broken-beacon';
const COMBAT_TURN_DAMAGE = [30, 30, 40];

export const COMBAT_ROUNDS = [
  {
    title: 'Turn 1 of 3 — Strike',
    prompt: 'Describe your hero’s first move using a vivid action verb.',
    requirement: 'action',
    minimumWords: 8,
  },
  {
    title: 'Turn 2 of 3 — Endure',
    prompt: 'Describe what your hero sees, hears or feels as the creature retaliates.',
    requirement: 'sensory',
    minimumWords: 10,
  },
  {
    title: 'Turn 3 of 3 — Finish',
    prompt: 'Use a simile with “like” or “as … as” to deliver the final move.',
    requirement: 'simile',
    minimumWords: 10,
  },
];

const ACTION_VERBS = [
  'charge', 'charges', 'charged', 'charging',
  'climb', 'climbs', 'climbed', 'climbing',
  'crash', 'crashes', 'crashed', 'crashing',
  'dodge', 'dodges', 'dodged', 'dodging',
  'drive', 'drives', 'drove', 'driving',
  'duck', 'ducks', 'ducked', 'ducking',
  'hurl', 'hurls', 'hurled', 'hurling',
  'leap', 'leaps', 'leapt', 'leaped', 'leaping',
  'lunge', 'lunges', 'lunged', 'lunging',
  'race', 'races', 'raced', 'racing',
  'rip', 'rips', 'ripped', 'ripping',
  'shield', 'shields', 'shielded', 'shielding',
  'slash', 'slashes', 'slashed', 'slashing',
  'smash', 'smashes', 'smashed', 'smashing',
  'sprint', 'sprints', 'sprinted', 'sprinting',
  'strike', 'strikes', 'struck', 'striking',
  'swing', 'swings', 'swung', 'swinging',
  'thrust', 'thrusts', 'thrusting',
];

const SENSORY_TERMS = [
  'bright', 'burning', 'cold', 'crack', 'crash', 'dark', 'deafening',
  'echo', 'feel', 'felt', 'glow', 'hear', 'heard', 'hot', 'icy', 'light',
  'loud', 'rough', 'roar', 'roared', 'salt', 'see', 'saw', 'sharp',
  'shiver', 'smell', 'smelled', 'sound', 'taste', 'tasted', 'thunder',
  'warm', 'wet', 'whisper', 'wind',
];

const DOMAIN_CREATURES = {
  'Coral Reef': [
    { noun: 'Coral Colossus', detail: 'armoured in jagged reef-stone' },
    { noun: 'Tide Serpent', detail: 'coiled in white water and broken shell' },
    { noun: 'Reef Wyrm', detail: 'with fins that cut the air like blades' },
  ],
  'Deep Trench': [
    { noun: 'Abyss Stalker', detail: 'lit by a single cold lantern-eye' },
    { noun: 'Trench Warden', detail: 'dragging chains from the lightless deep' },
    { noun: 'Lantern Leviathan', detail: 'casting long shadows across the stones' },
  ],
  'Kelp Forest': [
    { noun: 'Kelp Wraith', detail: 'wrapped in living vines and green mist' },
    { noun: 'Vineback Beast', detail: 'with roots gripping the ruined path' },
    { noun: 'Mossclaw Guardian', detail: 'covered in bark, moss and ancient runes' },
  ],
  default: [
    { noun: 'Beacon Wyrm', detail: 'circling the dark tower' },
    { noun: 'Fog Sentinel', detail: 'formed from mist and shattered stone' },
    { noun: 'Storm Drake', detail: 'crackling with trapped lightning' },
  ],
};

const MOTIFS = [
  {
    adjective: 'Tempest',
    keywords: ['storm', 'lightning', 'thunder', 'wind', 'rain'],
    power: 'storm-light gathers around it with every breath',
  },
  {
    adjective: 'Venom',
    keywords: ['poison', 'poisonous', 'toxic', 'venom', 'acid'],
    power: 'a poisonous haze rolls from its armour',
  },
  {
    adjective: 'Gloom',
    keywords: ['dark', 'night', 'shadow', 'black', 'gloom'],
    power: 'the light bends and disappears around its body',
  },
  {
    adjective: 'Veil',
    keywords: ['fog', 'mist', 'smoke', 'cloud'],
    power: 'it vanishes whenever the fog thickens',
  },
  {
    adjective: 'Stone',
    keywords: ['stone', 'tower', 'ruin', 'cliff', 'rock'],
    power: 'each step shakes loose stones from the beacon',
  },
  {
    adjective: 'Tide',
    keywords: ['water', 'wave', 'sea', 'ocean', 'flood'],
    power: 'surging water follows the sweep of its claws',
  },
  {
    adjective: 'Ember',
    keywords: ['fire', 'flame', 'burn', 'ember', 'heat'],
    power: 'embers glow between the cracks in its armour',
  },
  {
    adjective: 'Echo',
    keywords: [],
    power: 'it repeats the hero’s own words in a distorted roar',
  },
];

const REWARDS = {
  'Coral Reef': { name: 'Tidal Blade', slot: 'weapon' },
  'Deep Trench': { name: 'Abyssal Helm', slot: 'head' },
  'Kelp Forest': { name: 'Verdant Mail', slot: 'chest' },
  default: { name: 'Beacon Keeper’s Charm', slot: 'head' },
};

function countWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function containsWord(text, words) {
  if (!words.length) return false;
  const pattern = words.map(escapeRegExp).join('|');
  return new RegExp(`\\b(?:${pattern})\\b`, 'i').test(text);
}

function containsSimile(text) {
  return /\blike\s+(?:a|an|the|my|your|his|her|its|[a-z])/i.test(text)
    || /\bas\b[^.!?]{1,70}\bas\b/i.test(text);
}

function hashText(text) {
  let hash = 2166136261;
  for (const character of String(text || '')) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function compactExcerpt(text, maximum = 120) {
  const compact = String(text || '').replace(/\s+/g, ' ').trim();
  if (compact.length <= maximum) return compact;
  return `${compact.slice(0, maximum - 1).trimEnd()}…`;
}

function cloneCombat(combat) {
  return {
    ...combat,
    monster: combat?.monster ? { ...combat.monster } : null,
    responses: Array.isArray(combat?.responses)
      ? combat.responses.map((response) => ({ ...response }))
      : [],
  };
}

export function createMonsterFromWriting({
  text = '',
  domain = '',
  obstacle = '',
  guardian = 'the hero',
} = {}) {
  const source = `${text} ${obstacle}`.toLowerCase();
  const motif = MOTIFS.find(
    (candidate) => candidate.keywords.length > 0
      && candidate.keywords.some((keyword) => source.includes(keyword))
  ) || MOTIFS[MOTIFS.length - 1];
  const pool = DOMAIN_CREATURES[domain] || DOMAIN_CREATURES.default;
  const creature = pool[hashText(`${text}|${domain}|${obstacle}`) % pool.length];
  const excerpt = compactExcerpt(text) || `${guardian} approaches the broken beacon.`;

  return {
    id: `chapter-one-monster-${hashText(`${domain}|${text}`)}`,
    name: `${motif.adjective} ${creature.noun}`,
    description:
      `The words “${excerpt}” twist into a creature ${creature.detail}. `
      + `${motif.power}. It can only be defeated by three precise pieces of writing.`,
    weakness: 'vivid verbs, sensory detail and figurative language',
    maxHealth: 100,
  };
}

export function createCombatState({ monster, openingText = '', now = new Date() } = {}) {
  if (!monster?.name) throw new TypeError('A generated monster is required.');

  return {
    monster: { ...monster },
    turn: 0,
    maxTurns: COMBAT_ROUNDS.length,
    playerHealth: 100,
    enemyHealth: monster.maxHealth || 100,
    responses: [],
    currentDraft: '',
    feedback: '',
    specialMoveReady: true,
    specialMoveArmed: false,
    openingText,
    status: 'active',
    startedAt: now.toISOString(),
    completedAt: null,
  };
}

export function assessCombatResponse(text, roundIndex, { specialArmed = false } = {}) {
  const round = COMBAT_ROUNDS[roundIndex];
  const response = String(text || '').trim();
  if (!round) {
    return { valid: false, message: 'This battle has already been completed.', quality: 0 };
  }

  const wordCount = countWords(response);
  const hasAction = containsWord(response, ACTION_VERBS)
    || /\b[a-z]{4,}(?:ed|ing)\b/i.test(response);
  const hasSensory = containsWord(response, SENSORY_TERMS);
  const hasSimile = containsSimile(response);

  if (wordCount < round.minimumWords) {
    return {
      valid: false,
      message: `Add more detail. This turn needs at least ${round.minimumWords} words.`,
      quality: 0,
      wordCount,
      hasAction,
      hasSensory,
      hasSimile,
    };
  }

  if (round.requirement === 'action' && !hasAction) {
    return {
      valid: false,
      message: 'Use a vivid action verb such as charged, lunged, dodged or struck.',
      quality: 0,
      wordCount,
      hasAction,
      hasSensory,
      hasSimile,
    };
  }

  if (round.requirement === 'sensory' && !hasSensory) {
    return {
      valid: false,
      message: 'Include something the hero sees, hears, smells, tastes or physically feels.',
      quality: 0,
      wordCount,
      hasAction,
      hasSensory,
      hasSimile,
    };
  }

  if ((round.requirement === 'simile' || specialArmed) && !hasSimile) {
    return {
      valid: false,
      message: 'Complete the move with a simile using “like” or “as … as”.',
      quality: 0,
      wordCount,
      hasAction,
      hasSensory,
      hasSimile,
    };
  }

  const quality = [
    wordCount >= round.minimumWords + 5,
    hasAction,
    hasSensory,
    hasSimile,
  ].filter(Boolean).length;

  const strengths = [];
  if (hasAction) strengths.push('strong action');
  if (hasSensory) strengths.push('sensory detail');
  if (hasSimile) strengths.push('figurative language');

  return {
    valid: true,
    message: strengths.length
      ? `Successful turn: ${strengths.join(', ')}.`
      : 'Successful turn: the action is clear.',
    quality,
    wordCount,
    hasAction,
    hasSensory,
    hasSimile,
    usedSpecial: Boolean(specialArmed && hasSimile),
  };
}

export function resolveCombatTurn(combat, text, { specialArmed = false } = {}) {
  const current = cloneCombat(combat);
  if (!current || current.status !== 'active') {
    return {
      combat: current,
      assessment: { valid: false, message: 'The battle is not active.', quality: 0 },
      completed: current?.status === 'victory',
    };
  }

  const roundIndex = current.turn;
  const assessment = assessCombatResponse(text, roundIndex, { specialArmed });
  if (!assessment.valid) {
    return { combat: current, assessment, completed: false };
  }

  const damage = COMBAT_TURN_DAMAGE[roundIndex] || 0;
  const retaliation = roundIndex < COMBAT_ROUNDS.length - 1
    ? Math.max(4, 14 - (assessment.quality * 2) - (assessment.usedSpecial ? 4 : 0))
    : 0;

  current.enemyHealth = Math.max(0, current.enemyHealth - damage);
  current.playerHealth = Math.max(1, current.playerHealth - retaliation);
  current.responses.push({
    turn: roundIndex + 1,
    title: COMBAT_ROUNDS[roundIndex].title,
    text: String(text || '').trim(),
    feedback: assessment.message,
    damage,
    retaliation,
    usedSpecial: assessment.usedSpecial,
  });
  current.turn += 1;
  current.currentDraft = '';
  current.feedback = assessment.message;
  current.specialMoveArmed = false;
  if (assessment.usedSpecial) current.specialMoveReady = false;

  const completed = current.turn >= COMBAT_ROUNDS.length;
  if (completed) {
    current.enemyHealth = 0;
    current.status = 'victory';
    current.completedAt = new Date().toISOString();
  }

  return { combat: current, assessment, completed };
}

function rewardForDomain(domain) {
  return { ...(REWARDS[domain] || REWARDS.default) };
}

function awardXp(player, amount) {
  player.xp += amount;
  while (player.xp >= player.level * 100) {
    player.xp -= player.level * 100;
    player.level += 1;
    player.attack += 2;
    player.health += 10;
  }
}

function setVisible(element, visible, display = 'block') {
  if (!element) return;
  element.style.display = visible ? display : 'none';
}

function createLogEntry(text, className = '') {
  const entry = document.createElement('p');
  entry.textContent = text;
  if (className) entry.className = className;
  return entry;
}

export function initChapterOneCombat({
  gameState,
  saveGame,
  controller,
} = {}) {
  if (!gameState || typeof saveGame !== 'function' || !controller) {
    throw new TypeError('Chapter 1 combat requires state, saveGame and the game controller.');
  }

  const elements = {
    writingPanel: document.getElementById('writing-challenge'),
    writingInput: document.getElementById('writing-input'),
    writingSubmit: document.getElementById('writing-submit'),
    monsterPanel: document.getElementById('monster-created-panel'),
    monsterName: document.getElementById('monster-name'),
    monsterDescription: document.getElementById('monster-description'),
    startCombatBtn: document.getElementById('start-combat-btn'),
    combatPanel: document.getElementById('combat-panel'),
    combatTitle: document.getElementById('combat-title'),
    playerHealthBar: document.getElementById('player-health-bar'),
    enemyHealthBar: document.getElementById('enemy-health-bar'),
    combatLog: document.getElementById('combat-log'),
    combatPrompt: document.getElementById('combat-prompt'),
    combatInput: document.getElementById('combat-writing-input'),
    combatSubmitBtn: document.getElementById('combat-submit-btn'),
    specialMoveBtn: document.getElementById('special-move-btn'),
    continueGameBtn: document.getElementById('continue-game-btn'),
    newGameBtn: document.getElementById('new-game-btn'),
    startGameBtn: document.getElementById('start-game-btn'),
    autosaveNotification: document.getElementById('autosave-notification'),
  };

  const baseFlowPanelIds = [
    'dialogue-box',
    'prewrite-battle',
    'writing-challenge',
    'dynamic-quest-creator',
    'quest-complete',
    'journal-panel',
    'loot-panel',
  ];

  let draftSaveTimer = null;

  function refreshHud() {
    controller.refreshUI?.();
    controller.gameApi?.refreshUI?.();
  }

  function persist({ showNotice = false } = {}) {
    gameState.lastSavedAt = new Date().toISOString();
    saveGame(gameState);
    if (showNotice && elements.autosaveNotification) {
      elements.autosaveNotification.textContent = 'Battle saved.';
      elements.autosaveNotification.style.opacity = '1';
      window.setTimeout(() => {
        elements.autosaveNotification.style.opacity = '0';
      }, 1200);
    }
  }

  function hideBaseFlowPanels() {
    baseFlowPanelIds.forEach((id) => setVisible(document.getElementById(id), false));
  }

  function hideCombatPanels() {
    setVisible(elements.monsterPanel, false);
    setVisible(elements.combatPanel, false);
  }

  function isInitialChapterWriting() {
    return gameState.phase === 'writing'
      && gameState.activeQuest?.id === CHAPTER_ONE_ID
      && !gameState.activeQuest?.rewardClaimed
      && !gameState.completedQuests?.includes(CHAPTER_ONE_ID);
  }

  function saveOpeningEntry(text) {
    const existingId = gameState.activeQuest?.journalEntryId;
    let entry = gameState.journalEntries.find((candidate) => candidate.id === existingId);

    if (!entry) {
      entry = {
        id: `entry-${Date.now()}`,
        questId: CHAPTER_ONE_ID,
        title: 'Chapter 1: The Broken Beacon',
        stage: 'Opening',
        text,
        createdAt: new Date().toISOString(),
      };
      gameState.journalEntries.push(entry);
      gameState.activeQuest.journalEntryId = entry.id;
    } else {
      entry.stage = 'Opening';
      entry.text = text;
      entry.updatedAt = new Date().toISOString();
    }

    return entry;
  }

  function beginMonsterReveal(event) {
    if (!isInitialChapterWriting()) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    const text = elements.writingInput?.value.trim() || '';
    const wordCount = countWords(text);
    if (text.length < 80 || wordCount < 15) {
      controller.gameApi?.refreshUI?.();
      const messageButton = document.getElementById('message-button');
      const messageText = document.getElementById('message-text');
      const messageBox = document.getElementById('message-box');
      if (messageText && messageBox) {
        messageText.textContent = 'Build the scene further: write at least 15 words and 80 characters.';
        setVisible(messageBox, true);
        messageButton?.focus();
      }
      return;
    }

    saveOpeningEntry(text);
    const monster = createMonsterFromWriting({
      text,
      domain: gameState.selectedDomain,
      obstacle: gameState.prewrite?.focus?.obstacle || '',
      guardian: gameState.selectedGuardian || 'the hero',
    });
    gameState.combat = createCombatState({ monster, openingText: text });
    gameState.draft = '';
    gameState.phase = 'monster-reveal';
    gameState.activeQuest.status = 'monster-reveal';
    gameState.activeQuest.objective = 'Face the creature summoned from your opening scene.';
    persist({ showNotice: true });
    refreshHud();
    showMonsterReveal();
  }

  function showMonsterReveal() {
    const combat = gameState.combat;
    if (!combat?.monster) return;
    hideBaseFlowPanels();
    setVisible(elements.combatPanel, false);
    if (elements.monsterName) elements.monsterName.textContent = combat.monster.name;
    if (elements.monsterDescription) {
      elements.monsterDescription.textContent = combat.monster.description;
    }
    if (elements.startCombatBtn) elements.startCombatBtn.textContent = 'Begin the Writing Battle';
    setVisible(elements.monsterPanel, true, 'flex');
    elements.startCombatBtn?.focus();
  }

  function startCombat() {
    if (!gameState.combat?.monster) return;
    gameState.phase = 'combat';
    gameState.combat.status = gameState.combat.status === 'victory' ? 'victory' : 'active';
    gameState.activeQuest.status = gameState.combat.status === 'victory'
      ? 'combat-victory'
      : 'combat';
    gameState.activeQuest.objective = gameState.combat.status === 'victory'
      ? 'Claim victory over the creature.'
      : `Defeat ${gameState.combat.monster.name} with three pieces of writing.`;
    persist();
    refreshHud();
    showCombat();
  }

  function updateHealthBar(bar, value) {
    if (!bar) return;
    const bounded = Math.max(0, Math.min(100, value));
    bar.style.width = `${bounded}%`;
    const container = bar.parentElement;
    if (container) container.setAttribute('aria-valuenow', String(Math.round(bounded)));
  }

  function renderCombatLog(combat) {
    if (!elements.combatLog) return;
    elements.combatLog.replaceChildren();
    elements.combatLog.appendChild(
      createLogEntry(`${combat.monster.name} emerges. Three strong responses will defeat it.`)
    );

    combat.responses.forEach((response) => {
      elements.combatLog.appendChild(
        createLogEntry(`Turn ${response.turn}: ${response.text}`, 'mt-2')
      );
      const result = response.retaliation > 0
        ? `${response.feedback} You dealt ${response.damage} damage; the creature dealt ${response.retaliation}.`
        : `${response.feedback} Final strike: ${response.damage} damage.`;
      elements.combatLog.appendChild(createLogEntry(result, 'text-sm'));
      if (response.usedSpecial) {
        elements.combatLog.appendChild(
          createLogEntry('Simile Power activated: the retaliation was weakened.', 'feedback-success')
        );
      }
    });

    if (combat.feedback && combat.status === 'active') {
      elements.combatLog.appendChild(
        createLogEntry(combat.feedback, combat.feedback.startsWith('Successful') ? 'feedback-success' : 'feedback-error')
      );
    }
    elements.combatLog.scrollTop = elements.combatLog.scrollHeight;
  }

  function showCombat() {
    const combat = gameState.combat;
    if (!combat?.monster) return;
    hideBaseFlowPanels();
    setVisible(elements.monsterPanel, false);
    setVisible(elements.combatPanel, true);
    updateHealthBar(elements.playerHealthBar, combat.playerHealth);
    updateHealthBar(elements.enemyHealthBar, combat.enemyHealth);
    renderCombatLog(combat);

    const victory = combat.status === 'victory';
    if (elements.combatTitle) {
      elements.combatTitle.textContent = victory
        ? `Victory over ${combat.monster.name}`
        : `Battle: ${combat.monster.name}`;
    }

    if (victory) {
      gameState.phase = 'combat-victory';
      if (elements.combatPrompt) {
        elements.combatPrompt.textContent =
          'Your three battle lines have defeated the creature. Claim the restored beacon’s reward.';
      }
      if (elements.combatInput) {
        elements.combatInput.value = '';
        elements.combatInput.disabled = true;
        elements.combatInput.style.display = 'none';
      }
      if (elements.combatSubmitBtn) elements.combatSubmitBtn.textContent = 'Claim Victory Reward';
      if (elements.specialMoveBtn) {
        elements.specialMoveBtn.disabled = true;
        elements.specialMoveBtn.textContent = 'Writing Battle Complete';
      }
      elements.combatSubmitBtn?.focus();
      return;
    }

    const round = COMBAT_ROUNDS[combat.turn];
    if (elements.combatPrompt) {
      elements.combatPrompt.textContent = `${round.title}: ${round.prompt}`;
    }
    if (elements.combatInput) {
      elements.combatInput.style.display = 'block';
      elements.combatInput.disabled = false;
      elements.combatInput.value = combat.currentDraft || '';
      elements.combatInput.placeholder =
        combat.specialMoveArmed
          ? 'Include a simile using “like” or “as … as”…'
          : 'Describe your action…';
    }
    if (elements.combatSubmitBtn) {
      elements.combatSubmitBtn.textContent = `Resolve Turn ${combat.turn + 1}`;
    }
    if (elements.specialMoveBtn) {
      elements.specialMoveBtn.disabled = !combat.specialMoveReady;
      elements.specialMoveBtn.textContent = combat.specialMoveReady
        ? combat.specialMoveArmed
          ? 'Simile Power Armed — click to cancel'
          : 'Arm Simile Power — one use'
        : 'Simile Power Used';
    }
    elements.combatInput?.focus();
  }

  function submitCombatTurn() {
    const combat = gameState.combat;
    if (!combat) return;
    if (combat.status === 'victory') {
      claimVictoryReward();
      return;
    }

    const text = elements.combatInput?.value.trim() || '';
    const result = resolveCombatTurn(combat, text, {
      specialArmed: Boolean(combat.specialMoveArmed),
    });

    if (!result.assessment.valid) {
      gameState.combat.feedback = result.assessment.message;
      persist();
      showCombat();
      return;
    }

    gameState.combat = result.combat;
    gameState.phase = result.completed ? 'combat-victory' : 'combat';
    gameState.activeQuest.status = result.completed ? 'combat-victory' : 'combat';
    gameState.activeQuest.objective = result.completed
      ? 'Claim victory over the creature.'
      : `Complete turn ${gameState.combat.turn + 1} of the writing battle.`;
    persist({ showNotice: true });
    refreshHud();
    showCombat();
  }

  function toggleSpecialMove() {
    const combat = gameState.combat;
    if (!combat?.specialMoveReady || combat.status !== 'active') return;
    combat.specialMoveArmed = !combat.specialMoveArmed;
    combat.feedback = combat.specialMoveArmed
      ? 'Simile Power armed. Include “like” or “as … as” in this response.'
      : 'Simile Power returned to reserve.';
    persist();
    showCombat();
  }

  function updateJournalWithBattle() {
    const combat = gameState.combat;
    const entryId = gameState.activeQuest?.journalEntryId;
    const entry = gameState.journalEntries.find((candidate) => candidate.id === entryId);
    if (!entry || !combat) return;

    const battleLines = combat.responses
      .map((response) => `Turn ${response.turn}: ${response.text}`)
      .join('\n');
    entry.stage = 'Opening and Battle';
    entry.text = `${combat.openingText}\n\nBattle at the Beacon\n${battleLines}`;
    entry.updatedAt = new Date().toISOString();
  }

  function claimVictoryReward() {
    const combat = gameState.combat;
    if (!combat || combat.status !== 'victory' || !gameState.activeQuest) return;

    updateJournalWithBattle();
    gameState.activeQuest.status = 'complete';
    gameState.activeQuest.objective = 'Collect the Elder’s reward.';

    if (!gameState.activeQuest.rewardClaimed) {
      gameState.activeQuest.rewardClaimed = true;
      awardXp(gameState.player, 100);
      if (!gameState.completedQuests.includes(CHAPTER_ONE_ID)) {
        gameState.completedQuests.push(CHAPTER_ONE_ID);
      }
      gameState.pendingReward = rewardForDomain(gameState.selectedDomain);
    }

    gameState.phase = 'loot';
    persist({ showNotice: true });
    refreshHud();
    hideCombatPanels();

    // Show the controller's loot panel from the live state. A storage write
    // failure must not discard a victory or hide its reward.
    controller.resumeCurrentPhase();
  }

  function resumeCombatPhase() {
    if (gameState.phase === 'monster-reveal') {
      showMonsterReveal();
      return true;
    }
    if (gameState.phase === 'combat' || gameState.phase === 'combat-victory') {
      showCombat();
      return true;
    }
    hideCombatPanels();
    return false;
  }

  const originalOpenQuest = controller.gameApi?.openQuest?.bind(controller.gameApi);
  if (controller.gameApi && originalOpenQuest) {
    controller.gameApi.openQuest = (...args) => {
      if (resumeCombatPhase()) return;
      originalOpenQuest(...args);
    };
  }

  elements.writingSubmit?.addEventListener('click', beginMonsterReveal, { capture: true });
  elements.startCombatBtn?.addEventListener('click', startCombat);
  elements.combatSubmitBtn?.addEventListener('click', submitCombatTurn);
  elements.specialMoveBtn?.addEventListener('click', toggleSpecialMove);
  elements.combatInput?.addEventListener('input', () => {
    if (!gameState.combat || gameState.combat.status !== 'active') return;
    gameState.combat.currentDraft = elements.combatInput.value;
    gameState.combat.feedback = '';
    window.clearTimeout(draftSaveTimer);
    draftSaveTimer = window.setTimeout(() => persist(), 700);
  });
  elements.continueGameBtn?.addEventListener('click', () => {
    window.queueMicrotask(resumeCombatPhase);
  });
  elements.newGameBtn?.addEventListener('click', hideCombatPanels);
  elements.startGameBtn?.addEventListener('click', hideCombatPanels);

  resumeCombatPhase();

  return {
    resume: resumeCombatPhase,
    showMonsterReveal,
    showCombat,
    claimVictoryReward,
  };
}
