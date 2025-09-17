// src/main.js
// Minimal bootstrap for the game UI.
// Expose a flag used by viewers/scene code if present.
window.USE_3D_MODELS = true;

const startBtn = document.getElementById('start-game-btn');
const newGameBtn = document.getElementById('new-game-btn');
const startModal = document.getElementById('start-modal');
const characterCreator = document.getElementById('character-creator');
const uiContainer = document.getElementById('ui-container');

function showUI() {
  if (startModal) startModal.style.display = 'none';
  if (characterCreator) characterCreator.style.display = 'none';
  if (uiContainer) uiContainer.style.visibility = 'visible';
}

function openCharacterCreator() {
  if (startModal) startModal.style.display = 'none';
  if (!characterCreator) return;

  characterCreator.style.display = 'flex';

  const focusTarget = characterCreator.querySelector('.creator-option')
    || characterCreator.querySelector('button');
  if (focusTarget) focusTarget.focus();
}

if (startBtn) {
  startBtn.addEventListener('click', showUI);
} else {
  // Fallback: if there’s no start button, show UI immediately
  showUI();
}

if (newGameBtn) {
  newGameBtn.addEventListener('click', openCharacterCreator);
}

// Optional: simple DOM ready guard for safety
document.addEventListener('DOMContentLoaded', () => {
  // no-op; keep for future init hooks
});
