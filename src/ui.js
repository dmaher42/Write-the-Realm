/**
 * Basic UI helpers. In the original project these functions would manage the
 * large number of panels and in-game menus. Keeping them in a separate module
 * allows the rendering logic to remain focused on Three.js operations.
 */

import { gameState, saveGame, loadGame, checkForSavedGame } from './state.js';

export function updateQuestLog() {
  const head = document.getElementById('slot-head');
  const chest = document.getElementById('slot-chest');
  const weapon = document.getElementById('slot-weapon');
  if (head) head.textContent = gameState.equipment.head || 'Empty';
  if (chest) chest.textContent = gameState.equipment.chest || 'Empty';
  if (weapon) weapon.textContent = gameState.equipment.weapon || 'Empty';

  const title = document.getElementById('quest-title');
  const objective = document.getElementById('quest-objective');
  if (title && gameState.activeQuest) title.textContent = gameState.activeQuest.title;
  if (objective && gameState.activeQuest)
    objective.textContent = gameState.activeQuest.objective;
}

export function showPanel(panel) {
  if (panel) panel.style.display = 'block';
}

export function hidePanel(panel) {
  if (panel) panel.style.display = 'none';
}

export function showDialogue(npc) {
  const box = document.getElementById('dialogue-box');
  const title = document.getElementById('dialogue-title');
  const text = document.getElementById('dialogue-text');
  const button = document.getElementById('dialogue-button');
  if (!npc || !box || !title || !text || !button) return;
  const prompt = document.getElementById('interact-prompt');
  if (prompt) prompt.style.display = 'none';
  title.textContent = npc.name;
  text.textContent = npc.dialogue;
  showPanel(box);
  button.onclick = () => {
    gameState.activeQuest = npc.quest;
    updateQuestLog();
    hidePanel(box);
  };
}

export function initUI() {
  const startModal = document.getElementById('start-modal');
  const characterCreator = document.getElementById('character-creator');
  const newGameBtn = document.getElementById('new-game-btn');
  const continueGameBtn = document.getElementById('continue-game-btn');
  const startGameBtn = document.getElementById('start-game-btn');
  const saveGameBtn = document.getElementById('save-game-btn');
  const uiContainer = document.getElementById('ui-container');
  const guardianTypeOptions = document.querySelectorAll('#guardian-type-options .creator-option');
  const guardianDomainOptions = document.querySelectorAll('#guardian-domain-options .creator-option');
  const customGuardianInput = document.getElementById('custom-guardian-input');
  const openJournalInventoryBtn = document.getElementById('open-journal-inventory-btn');
  const closeJournalBtn = document.getElementById('close-journal-btn');
  const journalPanel = document.getElementById('journal-panel');
  const journalEntries = document.getElementById('journal-entries');
  const inventoryList = document.getElementById('inventory-list');
  const minimizeQuestLogBtn = document.getElementById('minimize-quest-log');
  const questLogContent = document.getElementById('quest-log-content');

  let selectedGuardianType = '';
  let selectedDomain = '';
  let activeTrigger = null;

  if (newGameBtn) {
    newGameBtn.addEventListener('click', () => {
      hidePanel(startModal);
      showPanel(characterCreator);
    });
  }

  if (continueGameBtn) {
    if (checkForSavedGame()) continueGameBtn.disabled = false;
    continueGameBtn.addEventListener('click', () => {
      const loaded = loadGame();
      if (loaded) Object.assign(gameState, loaded);
      hidePanel(startModal);
      if (uiContainer) uiContainer.style.visibility = 'visible';
    });
  }

  guardianTypeOptions.forEach((option) => {
    option.addEventListener('click', () => {
      guardianTypeOptions.forEach((o) => o.classList.remove('selected'));
      option.classList.add('selected');
      selectedGuardianType = option.dataset.type;
    });
  });

  guardianDomainOptions.forEach((option) => {
    option.addEventListener('click', () => {
      guardianDomainOptions.forEach((o) => o.classList.remove('selected'));
      option.classList.add('selected');
      selectedDomain = option.dataset.domain;
    });
  });

  if (startGameBtn) {
    startGameBtn.addEventListener('click', () => {
      if (selectedGuardianType === 'custom' && customGuardianInput) {
        const customValue = customGuardianInput.value.trim();
        if (customValue) selectedGuardianType = customValue;
      }
      gameState.selectedGuardian = selectedGuardianType;
      gameState.selectedDomain = selectedDomain;
      saveGame();
      hidePanel(characterCreator);
      if (uiContainer) uiContainer.style.visibility = 'visible';
    });
  }

  if (openJournalInventoryBtn && journalPanel) {
    openJournalInventoryBtn.addEventListener('click', () => {
      activeTrigger = openJournalInventoryBtn;
      if (journalEntries) {
        const entries =
          gameState.journalEntries && gameState.journalEntries.length
            ? gameState.journalEntries
                .map((e) => `<div class="journal-entry">${e}</div>`)
                .join('')
            : '<p class="text-sm">Your journal is empty.</p>';
        journalEntries.innerHTML = entries;
      }
      if (inventoryList) {
        const items =
          gameState.inventory && gameState.inventory.length
            ? gameState.inventory
                .map((i) => `<div class="gear-item">${i}</div>`)
                .join('')
            : '<p class="text-sm">You have no gear.</p>';
        inventoryList.innerHTML = items;
      }
      showPanel(journalPanel);
      closeJournalBtn && closeJournalBtn.focus();
    });
  }

  if (closeJournalBtn && journalPanel) {
    closeJournalBtn.addEventListener('click', () => {
      hidePanel(journalPanel);
      activeTrigger && activeTrigger.focus();
      activeTrigger = null;
    });
  }

  if (saveGameBtn) {
    saveGameBtn.addEventListener('click', () => saveGame());
  }

  if (minimizeQuestLogBtn && questLogContent) {
    minimizeQuestLogBtn.addEventListener('click', () => {
      const hidden = questLogContent.style.display === 'none';
      questLogContent.style.display = hidden ? 'block' : 'none';
      minimizeQuestLogBtn.textContent = hidden ? '-' : '+';
    });
  }

  updateQuestLog();

  if (uiContainer) uiContainer.style.visibility = 'visible';

  window.addEventListener('beforeunload', () => saveGame());
}
