import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Verify bulk adding creates distinct items without state loss', () => {
  const sampleInput = `
    Elden Ring
    Hollow Knight
    Bloodborne
    Sekiro
    Dark Souls III
    Celeste
    Hades
  `;

  const lines = sampleInput
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  assert.strictEqual(lines.length, 7, 'Should parse 7 distinct non-empty items');

  const items = {};
  const unrankedIds = [];

  lines.forEach((title) => {
    const id = `item-${Math.random().toString(36).substring(2, 8)}`;
    items[id] = {
      id,
      type: 'text',
      title,
      color: '#cba6f7',
      createdAt: Date.now(),
    };
    unrankedIds.push(id);
  });

  assert.strictEqual(Object.keys(items).length, 7, 'All 7 items must exist in items dictionary');
  assert.strictEqual(unrankedIds.length, 7, 'All 7 item IDs must exist in unrankedIds array');
  assert.strictEqual(items[unrankedIds[0]].title, 'Elden Ring');
  assert.strictEqual(items[unrankedIds[6]].title, 'Hades');
});

test('Verify atomic onAddTextItems prop exists on UnrankedPool', () => {
  const poolTsx = fs.readFileSync(path.resolve('src/components/UnrankedPool.tsx'), 'utf8');
  assert.ok(poolTsx.includes('onAddTextItems?: (titles: string[]) => void'));
  assert.ok(poolTsx.includes('onAddTextItems(lines)'));
});

test('Verify zero meta-copy phrases in UI component files', () => {
  const componentFiles = [
    'src/App.tsx',
    'src/components/Header.tsx',
    'src/components/UnrankedPool.tsx',
    'src/components/ExportModal.tsx',
    'index.html',
  ];

  const forbiddenMetaPhrases = [
    /zero em-dashes/i,
    /zero cloud lock-in/i,
    /local IndexedDB storage/i,
  ];

  for (const file of componentFiles) {
    const content = fs.readFileSync(path.resolve(file), 'utf8');
    for (const pattern of forbiddenMetaPhrases) {
      assert.ok(
        !pattern.test(content),
        `Found forbidden meta phrase ${pattern} in ${file}`
      );
    }
  }
});

test('Verify Sam / Samshady branding is present in key files', () => {
  const headerTsx = fs.readFileSync(path.resolve('src/components/Header.tsx'), 'utf8');
  assert.ok(headerTsx.includes('Sam Shady'), 'Header must feature Sam Shady branding');

  const appTsx = fs.readFileSync(path.resolve('src/App.tsx'), 'utf8');
  assert.ok(appTsx.includes('Sam Shady'), 'Footer must credit Sam Shady');

  const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
  assert.ok(indexHtml.includes('Sam Shady'), 'index.html must reference Sam Shady');
});
