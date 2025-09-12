/**
 * Basic UI helpers. In the original project these functions would manage the
 * large number of panels and in-game menus. Keeping them in a separate module
 * allows the rendering logic to remain focused on Three.js operations.
 */

export function showPanel(panel) {
  if (panel) panel.style.display = 'block';
}

export function hidePanel(panel) {
  if (panel) panel.style.display = 'none';
}

export function initUI() {
  // Placeholder for hooking up event listeners to UI elements.
}
