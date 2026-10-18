import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Verify mobile touch target standards in index.css', () => {
  const css = fs.readFileSync(path.resolve('src/index.css'), 'utf8');
  assert.ok(
    css.includes('min-height: 44px;'),
    'Touch targets must define minimum height of 44px for Fitts Law compliance'
  );
  assert.ok(
    css.includes('transform: scale(0.97)'),
    'Must include tactile scale(0.97) active press effect'
  );
  assert.ok(
    css.includes('transform: translateY(-2px)'),
    'Must include tactile translateY(-2px) hover lift effect'
  );
});

test('Verify overflow prevention in index.css', () => {
  const css = fs.readFileSync(path.resolve('src/index.css'), 'utf8');
  assert.ok(
    css.includes('overflow-x: hidden;'),
    'Must prevent horizontal page scrolling on narrow mobile screens'
  );
});

test('Verify responsive typography clamps and fonts', () => {
  const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8');
  assert.ok(indexHtml.includes('name="viewport" content="width=device-width, initial-scale=1.0"'));
  assert.ok(indexHtml.includes('Bricolage+Grotesque'));
  assert.ok(indexHtml.includes('Inter'));
  assert.ok(indexHtml.includes('JetBrains+Mono'));
});

test('Verify text cards specify safe minimum width to prevent word clipping', () => {
  const itemCardTsx = fs.readFileSync(path.resolve('src/components/ItemCard.tsx'), 'utf8');
  assert.ok(
    itemCardTsx.includes('min-w-[116px]'),
    'Text cards must have min-width of at least 116px to prevent truncating long words like TypeScript'
  );
  assert.ok(
    itemCardTsx.includes('isTextExpanded'),
    'Text cards must support expansion state for long text'
  );
  assert.ok(
    itemCardTsx.includes('group-hover:opacity-100'),
    'Must include hover tooltip preview for truncated text'
  );
});

test('Verify ItemDetailModal exists and provides full text inspection and editing', () => {
  const modalTsx = fs.readFileSync(path.resolve('src/components/ItemDetailModal.tsx'), 'utf8');
  assert.ok(modalTsx.includes('Full Title / Content'), 'Modal must display full unabridged title');
  assert.ok(modalTsx.includes('handleCopyText'), 'Modal must support copying text');
  assert.ok(modalTsx.includes('onMoveToTier'), 'Modal must support quick moving across tiers');
});
