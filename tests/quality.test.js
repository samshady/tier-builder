import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

function scanFiles(dir, extensions = ['.ts', '.tsx', '.html', '.css', '.md']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === 'dist' || file === '.git') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(scanFiles(fullPath, extensions));
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

test('Enforce zero em-dashes across all source and template files', () => {
  const rootDir = path.resolve('.');
  const files = scanFiles(rootDir);
  const emDashRegex = /\u2014|—/;

  const violations = [];

  for (const filePath of files) {
    // Skip this test file itself
    if (filePath.endsWith('quality.test.js')) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      if (emDashRegex.test(line)) {
        violations.push({
          file: path.relative(rootDir, filePath),
          line: index + 1,
          text: line.trim(),
        });
      }
    });
  }

  assert.strictEqual(
    violations.length,
    0,
    `Found em-dashes in source files:\n${violations.map(v => `  ${v.file}:${v.line} -> ${v.text}`).join('\n')}`
  );
});

test('Verify required font links exist in index.html', () => {
  const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
  assert.ok(indexHtml.includes('Bricolage+Grotesque'), 'Missing Bricolage Grotesque font link');
  assert.ok(indexHtml.includes('Inter'), 'Missing Inter font link');
  assert.ok(indexHtml.includes('JetBrains+Mono'), 'Missing JetBrains Mono font link');
});

test('Verify relative base path configured in vite.config.ts for GitHub Pages', () => {
  const viteConfig = fs.readFileSync(path.resolve('vite.config.ts'), 'utf8');
  assert.ok(viteConfig.includes("base: './'"), 'Vite config must have relative base for GitHub Pages');
});
