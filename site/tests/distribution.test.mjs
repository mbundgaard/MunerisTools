import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { distribution } from '../distribution.js';
test('provider commands and link labels pass through without package-manager knowledge', () => {
  const actions = [{ type: 'command', label: 'Get the tool', text: 'custom-manager fetch example@7' }, { type: 'link', label: 'Project page', url: 'https://example.invalid/project' }];
  const result = distribution({}, { version: 'vendor-release-seven', actions });
  assert.deepEqual(result.actions[0], actions[0]);
  assert.equal(result.actions[1].label, actions[1].label);
  assert.equal(result.actions[1].download, false);
  assert.equal(result.download, null);
});
test('legacy download feeds retain download behavior', () => {
  const result = distribution({ asset: 'example.zip' }, { url: 'https://example.invalid/example.zip' });
  assert.equal(result.actions[0].download, true);
  assert.equal(result.actions[0].description, 'example.zip');
});
test('unreleased/explicitly empty actions stay empty; invalid provider data fails closed', () => {
  assert.deepEqual(distribution({}, null).actions, []);
  assert.deepEqual(distribution({}, { url: 'https://example.invalid', actions: [] }).actions, []);
  for (const action of [
    { type: 'link', label: 'Unsafe', url: 'javascript:alert(1)' },
    { type: 'link', label: 'Unsafe', url: 'https://secret@example.invalid/' },
    { type: 'execute', label: 'Forbidden' },
    { type: 'command', label: 'Empty', text: '' },
  ]) assert.throws(() => distribution({}, { actions: [action] }));
});
test('renderer displays provider text safely rather than executing or interpreting commands', () => {
  const template = readFileSync(new URL('../template.html', import.meta.url), 'utf8');
  assert.match(template, /command.textContent=action.text/);
  assert.match(template, /link.textContent=action.label/);
  assert.doesNotMatch(template, /Install with npm|View on npm|sts-cli|STS API/);
});
