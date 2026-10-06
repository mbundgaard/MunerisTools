// Transport only. Registered providers own release discovery and bundle generation.
import { readFile, mkdtemp, rm, cp, readdir, lstat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const providers = JSON.parse(await readFile(path.join(root, 'providers.json'), 'utf8'));
const slugs = new Set();
async function validateBundle(dir, relative = '') {
  for (const name of await readdir(path.join(dir, relative))) {
    const file = path.posix.join(relative, name);
    const stat = await lstat(path.join(dir, file));
    if (stat.isSymbolicLink()) throw new Error('Provider bundle cannot contain symlinks');
    if (stat.isDirectory() && file === 'screenshots') await validateBundle(dir, file);
    else if (!stat.isFile() || !/^(?:tool\.json|release\.json|[A-Za-z0-9_-]+\.md|screenshots\/[A-Za-z0-9][A-Za-z0-9._-]*\.(?:png|jpe?g|gif|webp|avif))$/i.test(file)) throw new Error('Unexpected provider bundle file');
  }
  if (!relative) JSON.parse(await readFile(path.join(dir, 'tool.json'), 'utf8'));
}
for (const provider of providers) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(provider.slug) || slugs.has(provider.slug) ||
      !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(provider.repository) ||
      typeof provider.ref !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(provider.ref) ||
      typeof provider.entrypoint !== 'string' || !/^(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.mjs$/.test(provider.entrypoint)) throw new Error('Invalid provider registration');
  slugs.add(provider.slug);
  const temp = await mkdtemp(path.join(tmpdir(), 'catalog-provider-'));
  try {
    const source = path.join(temp, 'source'), output = path.join(temp, 'bundle');
    const target = path.join(root, 'site/tools', provider.slug);
    execFileSync('git', ['clone', '--depth', '1', '--branch', provider.ref, `https://github.com/${provider.repository}.git`, source], { stdio: 'pipe', timeout: 120000 });
    // Provider code is trusted maintainer-reviewed code. Do not pass Actions tokens.
    const env = Object.fromEntries(['PATH', 'Path', 'SystemRoot', 'TEMP', 'TMP', 'HOME'].filter(key => process.env[key]).map(key => [key, process.env[key]]));
    execFileSync(process.execPath, [path.join(source, provider.entrypoint), output, target], { env, stdio: 'inherit', timeout: 180000 });
    try { await lstat(output); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    await validateBundle(output);
    await rm(target, { recursive: true, force: true });
    await cp(output, target, { recursive: true });
    console.log(`Updated provider bundle: ${provider.slug}`);
  } finally { await rm(temp, { recursive: true, force: true }); }
}
