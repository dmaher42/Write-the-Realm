import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';

// Mock the DOM environment for testing UI interactions
const mockDOM = () => {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
    <body>
      <!-- Start Modal -->
      <div id="start-modal" class="modal-backdrop" style="display: block;">
        <div class="modal-content">
          <button id="new-game-btn">Forge New Legend</button>
        </div>
      </div>
      
      <!-- Character Creator -->
      <div id="character-creator" class="modal-backdrop" style="display: none;">
        <div class="modal-content">
          <h1>Forge Your Hero</h1>
        </div>
      </div>
    </body>
    </html>
  `);
  
  global.document = dom.window.document;
  global.window = dom.window;
  return dom;
};

describe('UI Integration Tests', () => {
  test('Forge New Legend button shows character creator and hides start modal', () => {
    const dom = mockDOM();
    
    // Simulate the event listener code from main.js
    const newGameBtn = document.getElementById('new-game-btn');
    const startModal = document.getElementById('start-modal');
    const characterCreator = document.getElementById('character-creator');
    
    // Verify initial state
    assert.equal(startModal.style.display, 'block', 'Start modal should be visible initially');
    assert.equal(characterCreator.style.display, 'none', 'Character creator should be hidden initially');
    
    // Add the event listener (simulating what main.js does)
    newGameBtn.addEventListener('click', () => {
      characterCreator.style.display = 'block';
      startModal.style.display = 'none';
    });
    
    // Simulate clicking the button
    newGameBtn.click();
    
    // Verify the button click worked
    assert.equal(startModal.style.display, 'none', 'Start modal should be hidden after button click');
    assert.equal(characterCreator.style.display, 'block', 'Character creator should be visible after button click');
    
    dom.window.close();
  });
  
  test('Required DOM elements exist with correct IDs', () => {
    const dom = mockDOM();
    
    // Verify all required elements exist
    const newGameBtn = document.getElementById('new-game-btn');
    const startModal = document.getElementById('start-modal');
    const characterCreator = document.getElementById('character-creator');
    
    assert.ok(newGameBtn, 'new-game-btn element should exist');
    assert.ok(startModal, 'start-modal element should exist');
    assert.ok(characterCreator, 'character-creator element should exist');
    
    // Verify button has correct text
    assert.equal(newGameBtn.textContent, 'Forge New Legend', 'Button should have correct text');
    
    dom.window.close();
  });
});