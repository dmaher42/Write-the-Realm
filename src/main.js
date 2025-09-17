// src/main.js
// Minimal bootstrap for the game UI.
// Expose a flag used by viewers/scene code if present.
window.USE_3D_MODELS = true;

const startBtn = document.getElementById('start-game-btn');
const startModal = document.getElementById('start-modal');
const uiContainer = document.getElementById('ui-container');

function showUI() {
  if (startModal) startModal.style.display = 'none';
  if (uiContainer) uiContainer.style.visibility = 'visible';
}

if (startBtn) {
  startBtn.addEventListener('click', showUI);
} else {
  // Fallback: if there’s no start button, show UI immediately
  showUI();
}

// Optional: simple DOM ready guard for safety
document.addEventListener('DOMContentLoaded', () => {
  // no-op; keep for future init hooks
});
