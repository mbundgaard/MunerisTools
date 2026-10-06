import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, cp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const site = fileURLToPath(new URL('..', import.meta.url));
test('full build renders npm and executable fixtures without executable assumptions in agent index', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'tools-build-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const file of ['build.js', 'distribution.js', 'template.html', 'package.json']) await cp(path.join(site, file), path.join(root, file));
  await cp(path.join(site, 'node_modules/marked'), path.join(root, 'node_modules/marked'), { recursive: true });
  for (const [slug, tool, release] of [
    ['sts-cli', { distribution: { type: 'npm', package: '@muneris/sts-cli' }, runtime: 'Node.js 22+' }, { version: '0.4.0', url: 'https://www.npmjs.com/package/@muneris/sts-cli' }],
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
  const npm = tools.find(tool => tool.id === 'sts-cli');
  assert.equal(npm.installation.command, 'npm install --global @muneris/sts-cli@0.4.0');
  assert.deepEqual(npm.downloads, []);
  assert.equal(npm.pages[0].title, 'Overview');
  assert.equal(tools.find(tool => tool.id === 'portable').downloads[0].url, 'https://example.invalid/portable.exe');
  assert.equal(await readFile(path.join(root, '_site/sts-cli/README.md'), 'utf8'), '---\ntitle: Overview\norder: 1\n---\n# Example\n');
  const index = await readFile(path.join(root, '_site/llms.txt'), 'utf8');
  assert.match(index, /distribution.type/);
  assert.match(index, /raw, unchanged bytes/);
  assert.doesNotMatch(index, /Each is a\s+single .exe|Results are a stable JSON envelope/);
});
