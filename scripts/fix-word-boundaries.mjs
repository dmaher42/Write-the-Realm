import fs from 'node:fs';

const fixes = [
  {
    path: 'src/gameController.js',
    matches: (line) => line.includes('new RegExp')
      && line.includes('escapeRegExp(actionWord)')
      && line.includes('.test(sentence)'),
    replacement:
      "    } else if (!new RegExp(`\\\\b${escapeRegExp(actionWord)}\\\\b`, 'i').test(sentence)) {",
  },
  {
    path: 'src/chapterOneCombat.js',
    matches: (line) => line.includes('new RegExp')
      && line.includes('${pattern}')
      && line.includes('.test(text)'),
    replacement:
      "  return new RegExp(`\\\\b(?:${pattern})\\\\b`, 'i').test(text);",
  },
];

for (const fix of fixes) {
  const source = fs.readFileSync(fix.path, 'utf8');
  const lines = source.split('\n');
  const index = lines.findIndex(fix.matches);

  if (index < 0) {
    throw new Error(`Expected word-boundary expression was not found in ${fix.path}`);
  }

  lines[index] = fix.replacement;
  fs.writeFileSync(fix.path, lines.join('\n'));
  console.log(`Patched ${fix.path}`);
}
