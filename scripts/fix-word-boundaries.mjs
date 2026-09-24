import fs from 'node:fs';

const fixes = [
  {
    path: 'src/gameController.js',
    before: "new RegExp(`\\b${escapeRegExp(actionWord)}\\b`, 'i')",
    after: "new RegExp(`\\\\b${escapeRegExp(actionWord)}\\\\b`, 'i')",
  },
  {
    path: 'src/chapterOneCombat.js',
    before: "new RegExp(`\\b(?:${pattern})\\b`, 'i').test(text)",
    after: "new RegExp(`\\\\b(?:${pattern})\\\\b`, 'i').test(text)",
  },
];

for (const fix of fixes) {
  const source = fs.readFileSync(fix.path, 'utf8');
  if (!source.includes(fix.before)) {
    throw new Error(`Expected word-boundary expression was not found in ${fix.path}`);
  }

  const updated = source.replace(fix.before, fix.after);
  fs.writeFileSync(fix.path, updated);
  console.log(`Patched ${fix.path}`);
}
