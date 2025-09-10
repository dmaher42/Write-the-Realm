const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('index.html exists and has proper structure', () => {
  const htmlPath = path.join(__dirname, '..', 'index.html');
  assert.ok(fs.existsSync(htmlPath), 'index.html should exist');
  
  const content = fs.readFileSync(htmlPath, 'utf8');
  
  // Check basic HTML structure
  assert.ok(content.includes('<!DOCTYPE html>'), 'Should have DOCTYPE declaration');
  assert.ok(content.includes('<html'), 'Should have html tag');
  assert.ok(content.includes('</html>'), 'Should close html tag');
  
  // Check for key game elements
  assert.ok(content.includes('3D Narrative Quest'), 'Should have game title');
  assert.ok(content.includes('Village Elder'), 'Should have Village Elder NPC');
  assert.ok(content.includes('quest-log'), 'Should have quest log element');
  assert.ok(content.includes('writing-challenge'), 'Should have writing challenge element');
  
  // Check for essential functions
  assert.ok(content.includes('function showWritingChallenge'), 'Should have showWritingChallenge function');
  assert.ok(content.includes('function submitWriting'), 'Should have submitWriting function');
  assert.ok(content.includes('function completeQuest'), 'Should have completeQuest function');
});

test('no duplicate HTML files in root', () => {
  const rootDir = path.join(__dirname, '..');
  const files = fs.readdirSync(rootDir);
  const htmlFiles = files.filter(file => file.endsWith('.html'));
  
  assert.strictEqual(htmlFiles.length, 1, 'Should have exactly one HTML file in root');
  assert.strictEqual(htmlFiles[0], 'index.html', 'The HTML file should be named index.html');
});