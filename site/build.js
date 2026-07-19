import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from 'marked';
import { buildManifest } from './lib/manifest.js';
import { renderToolPage, renderIndex } from './lib/render.js';

const ROOT = dirname(fileURLToPath(import.meta.url));       // .../site
const REPO_ROOT = join(ROOT, '..');                          // .../MunerisTools
const OUT = join(ROOT, '_site');
const REPO = process.env.SITE_REPO || 'mbundgaard/MunerisTools';

export function listImages(slug) {
  const dir = join(REPO_ROOT, 'tools', slug, 'images');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => /\.(png|jpe?g|webp|svg)$/i.test(f)).sort().map(f => `images/${f}`);
}

function fetchReleases() {
  const out = execFileSync('gh', ['api', '--paginate',
    `repos/${REPO}/releases`, '--jq', '.[]'], { encoding: 'utf8' });
  return out.trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
}

function main() {
  const tools = JSON.parse(readFileSync(join(ROOT, 'tools.json'), 'utf8'));
  const releases = fetchReleases();
  const manifests = {};
  rmSync(OUT, { recursive: true, force: true });   // deterministic: no stale files carry over
  mkdirSync(OUT, { recursive: true });
  for (const tool of tools) {
    const manifest = buildManifest(releases, tool);
    manifests[tool.slug] = manifest;
    const toolOut = join(OUT, tool.slug);
    mkdirSync(toolOut, { recursive: true });
    writeFileSync(join(toolOut, 'version.json'), JSON.stringify(manifest, null, 2));

    const readmePath = join(REPO_ROOT, 'tools', tool.slug, 'README.md');
    const readmeHtml = existsSync(readmePath) ? marked.parse(readFileSync(readmePath, 'utf8')) : '';
    const images = listImages(tool.slug);
    writeFileSync(join(toolOut, 'index.html'), renderToolPage(tool, manifest, { readmeHtml, images }));

    const imgSrc = join(REPO_ROOT, 'tools', tool.slug, 'images');
    if (existsSync(imgSrc)) cpSync(imgSrc, join(toolOut, 'images'), { recursive: true });
  }
  writeFileSync(join(OUT, 'index.html'), renderIndex(tools, manifests));
  cpSync(join(ROOT, 'assets'), join(OUT, 'assets'), { recursive: true });
  console.log(`Built ${tools.length} tool page(s) to ${OUT}`);
}

// Separator/drive-case-safe entry check (Windows-robust) instead of raw path string equality.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
