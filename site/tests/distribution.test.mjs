import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { distribution } from '../distribution.js';
const npm = { distribution: { type: 'npm', package: '@muneris/sts-cli' } };
test('npm installation is pinned and never offers an executable download', () => {
  const result = distribution(npm, { version: '0.4.0', url: 'https://example.invalid/obsolete.exe' });
  assert.deepEqual(result.downloads, []);
  assert.equal(result.download, null);
  assert.equal(result.installation.command, 'npm install --global @muneris/sts-cli@0.4.0');
  assert.equal(result.installation.url, 'https://www.npmjs.com/package/@muneris/sts-cli');
});
test('existing executable tools retain their download URL and asset label', () => {
  const result = distribution({ asset: 'example.exe' }, { version: '28', url: 'https://example.invalid/example.exe' });
  assert.equal(result.installation, null);
  assert.equal(result.downloads[0].sub, 'example.exe');
  assert.equal(result.downloads[0].url, 'https://example.invalid/example.exe');
});
test('unreleased tools have no installation/download; malformed npm metadata fails closed', () => {
  assert.equal(distribution(npm, null).installation, null);
  assert.deepEqual(distribution({}, null).downloads, []);
  assert.throws(() => distribution(npm, { version: '9; execute' }));
  assert.throws(() => distribution({ distribution: { type: 'npm', package: 'bad;command' } }, null));
});
test('npm UI uses text nodes and a normal npm link, not a download anchor', () => {
  const template = readFileSync(new URL('../template.html', import.meta.url), 'utf8');
  const npmBranch = template.split("if(t.installation?.type==='npm'){")[1].split('} else if')[0];
  assert.match(npmBranch, /command.textContent=t.installation.command/);
  assert.match(npmBranch, /View on npm/);
  assert.doesNotMatch(npmBranch, /innerHTML|\bdownload\b/);
});
