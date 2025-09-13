/**
 * Basic UI helpers. In the original project these functions would manage the
 * large number of panels and in-game menus. Keeping them in a separate module
 * allows the rendering logic to remain focused on Three.js operations.
 */

import { gameState, saveGame, loadGame, checkForSavedGame } from './state.js';

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

  let selectedGuardianType = '';
  let selectedDomain = '';

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

  if (saveGameBtn) {
    saveGameBtn.addEventListener('click', () => saveGame());
  }

  if (uiContainer) uiContainer.style.visibility = 'visible';

  window.addEventListener('beforeunload', () => saveGame());
}
