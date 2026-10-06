import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, cp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const site = fileURLToPath(new URL('..', import.meta.url));
test('full build renders provider actions and legacy fixtures without tool-specific rules', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'tools-build-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const file of ['build.js', 'distribution.js', 'template.html', 'package.json']) await cp(path.join(site, file), path.join(root, file));
  await cp(path.join(site, 'node_modules/marked'), path.join(root, 'node_modules/marked'), { recursive: true });
  for (const [slug, tool, release] of [
    ['example', { runtime: 'Provider runtime', agentGuidance: 'Provider-specific output contract.' }, { version: 'release-four', actions: [{ type: 'command', label: 'Setup', text: 'custom-manager fetch example@four' }] }],
    ['portable', { asset: 'portable.exe' }, { version: '28', url: 'https://example.invalid/portable.exe' }],
  ]) {
    const dir = path.join(root, 'tools', slug); await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'tool.json'), JSON.stringify({ name: slug, icon: 'terminal', description: 'Synthetic public tool', ...tool }));
    await writeFile(path.join(dir, 'release.json'), JSON.stringify({ date: '2026-01-01', ...release }));
    await writeFile(path.join(dir, 'README.md'), '---\ntitle: Overview\norder: 1\n---\n# Example\n');
  }
  execFileSync(process.execPath, [path.join(root, 'build.js')], { encoding: 'utf8' });
  const html = await readFile(path.join(root, '_site/index.html'), 'utf8');
  const tools = JSON.parse(html.match(/const TOOLS = (.+);/)[1]);
  const example = tools.find(tool => tool.id === 'example');
  assert.equal(example.actions[0].text, 'custom-manager fetch example@four');
  assert.equal(example.pages[0].title, 'Overview');
  assert.equal(tools.find(tool => tool.id === 'portable').actions[0].url, 'https://example.invalid/portable.exe');
  assert.equal(await readFile(path.join(root, '_site/example/README.md'), 'utf8'), '---\ntitle: Overview\norder: 1\n---\n# Example\n');
  const index = await readFile(path.join(root, '_site/llms.txt'), 'utf8');
  assert.match(index, /actions/);
  assert.match(index, /Provider-specific output contract/);
  assert.doesNotMatch(index, /sts-cli|STS API/);
  assert.doesNotMatch(index, /Each is a\s+single .exe|Results are a stable JSON envelope/);
});
