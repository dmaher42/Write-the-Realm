/**
 * Basic UI helpers. In the original project these functions would manage the
 * large number of panels and in-game menus. Keeping them in a separate module
 * allows the rendering logic to remain focused on Three.js operations.
 */

import {
  gameState,
  saveGame,
  loadGame,
  checkForSavedGame,
  updateQuestProgress,
  updateCombatStatus,
  updateInteractableTarget,
} from './state.js';

export function showPanel(panel) {
  if (panel) panel.style.display = 'block';
}

export function hidePanel(panel) {
  if (panel) panel.style.display = 'none';
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
  const questTitle = document.getElementById('quest-title');
  const questObjective = document.getElementById('quest-objective');
  const dialogueText = document.getElementById('dialogue-text');
  const dialogueButton = document.getElementById('dialogue-button');
  const openJournalBtn = document.getElementById('open-journal-btn');
  const closeJournalBtn = document.getElementById('close-journal-btn');
  const journalPanel = document.getElementById('journal-panel');
  const journalEntries = document.getElementById('journal-entries');
  const openGearBtn = document.getElementById('open-gear-btn');
  const closeGearBtn = document.getElementById('close-gear-btn');
  const gearPanel = document.getElementById('gear-panel');
  const inventoryList = document.getElementById('inventory-list');

  let selectedGuardianType = '';
  let selectedDomain = '';
  let activeTrigger = null;

  function refreshQuestUI() {
    const quest = gameState.quests[gameState.currentQuestIndex];
    if (questTitle) questTitle.textContent = quest ? quest.title : '';
    if (questObjective) questObjective.textContent = quest ? quest.objective : '';
    if (dialogueButton) dialogueButton.disabled = !gameState.canInteractWith;
    if (dialogueText && !gameState.canInteractWith && quest) {
      dialogueText.textContent =
        'Thank you, hero! Return once the river runs clear.';
    }
  }

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
      refreshQuestUI();
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

  if (openJournalBtn && journalPanel) {
    openJournalBtn.addEventListener('click', () => {
      activeTrigger = openJournalBtn;
      if (journalEntries) {
        const entries =
          gameState.journalEntries && gameState.journalEntries.length
            ? gameState.journalEntries
                .map((e) => `<div class="journal-entry">${e}</div>`)
                .join('')
            : '<p class="text-sm">Your journal is empty.</p>';
        journalEntries.innerHTML = entries;
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

  if (openGearBtn && gearPanel) {
    openGearBtn.addEventListener('click', () => {
      activeTrigger = openGearBtn;
      if (inventoryList) {
        const items =
          gameState.inventory && gameState.inventory.length
            ? gameState.inventory
                .map((i) => `<div class="gear-item">${i}</div>`)
                .join('')
            : '<p class="text-sm">You have no gear.</p>';
        inventoryList.innerHTML = items;
      }
      showPanel(gearPanel);
      closeGearBtn && closeGearBtn.focus();
    });
  }

  if (closeGearBtn && gearPanel) {
    closeGearBtn.addEventListener('click', () => {
      hidePanel(gearPanel);
      activeTrigger && activeTrigger.focus();
      activeTrigger = null;
    });
  }

  if (saveGameBtn) {
    saveGameBtn.addEventListener('click', () => saveGame());
  }

  if (dialogueButton) {
    // Player can initially interact with the Village Elder.
    updateInteractableTarget('Village Elder');
    refreshQuestUI();
    dialogueButton.addEventListener('click', () => {
      const quest = {
        title: 'Cleanse the River',
        objective: 'Drive out the corruption poisoning the waters.',
      };
      updateQuestProgress(quest);
      updateInteractableTarget(null);
      updateCombatStatus(false);
      if (dialogueText) {
        dialogueText.textContent =
          'Thank you, hero! Return once the river runs clear.';
      }
      refreshQuestUI();
    });
  }

  if (uiContainer) uiContainer.style.visibility = 'visible';

  window.addEventListener('beforeunload', () => saveGame());
}
