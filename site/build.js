import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, rmSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from 'marked';

const ROOT = dirname(fileURLToPath(import.meta.url));   // .../site
const TOOLS_DIR = join(ROOT, 'tools');
const OUT = join(ROOT, '_site');

// Parse `--- title: … / order: … ---` frontmatter (both required per convention; sensible fallbacks).
function parseDoc(raw) {
  let title = null, order = 999, body = raw;
  const m = raw.match(/^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (m) {
    body = raw.slice(m[0].length);
    for (const line of m[1].split(/\r?\n/)) {
      const kv = line.match(/^(\w+):\s*(.+?)\s*$/);
      if (kv && kv[1] === 'title') title = kv[2];
      if (kv && kv[1] === 'order') order = Number(kv[2]) || order;
    }
  }
  if (!title) { const h = body.match(/^#+\s+(.+)$/m); title = h ? h[1].trim() : 'Page'; }
  return { title, order, body };
}

// Light markdown decorations:
//  - "## v28 — 2026-07-14" changelog headers → version on top, small muted date below
//  - "- add:/fix:/chg: …" list items → coloured change chips
const decorate = html => html
  .replace(/<h2>(v\d+)\s*—\s*(\d{4}-\d{2}-\d{2})<\/h2>/gi,
    '<div class="cl-h"><span class="cl-v">$1</span><span class="cl-d">$2</span></div>')
  .replace(/<li>(add|fix|chg):\s*/gi,
    (_, t) => `<li><span class="chip ${t.toLowerCase()}">${t.toLowerCase()}</span> `);

// One sub-page (tab) per markdown file in the tool folder, sorted by order then title.
export function docPages(dir) {
  return readdirSync(dir).filter(f => f.endsWith('.md'))
    .map(f => parseDoc(readFileSync(join(dir, f), 'utf8')))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .map(d => ({ title: d.title, html: `<div class="md">${decorate(marked.parse(d.body))}</div>` }));
}

// Parse a JSON file, tolerating a leading UTF-8 BOM (PowerShell's Set-Content -Encoding UTF8 adds one).
const readJSON = p => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''));

const IMG_RE = /\.(png|jpe?g|gif|webp|avif)$/i;
const escHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// "01-settings-dialog.png" → "Settings dialog" (strip a leading NN- ordering prefix and the extension).
function shotCaption(file) {
  const base = file.replace(/\.[^.]+$/, '').replace(/^\d+[-_ ]*/, '').replace(/[-_]+/g, ' ').trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : file;
}

// If tools/<slug>/screenshots/ holds images, copy them into _site/<slug>/screenshots/ and return a
// Screenshots gallery tab (appended after the .md pages, so it is always the last tab). Images are
// copied — not inlined — so index.html stays small and they lazy-load. Order + caption come from the
// filename (sorted; `NN-caption.ext`), the same "convention over config" idea as the .md frontmatter.
function galleryTab(dir, slug) {
  const srcDir = join(dir, 'screenshots');
  if (!existsSync(srcDir)) return null;
  const files = readdirSync(srcDir).filter(f => IMG_RE.test(f)).sort();
  if (!files.length) return null;
  const outDir = join(OUT, slug, 'screenshots');
  mkdirSync(outDir, { recursive: true });
  const figs = files.map(f => {
    copyFileSync(join(srcDir, f), join(outDir, f));
    const cap = escHtml(shotCaption(f));
    return `<figure class="shot" onclick="openShot(this)"><img loading="lazy" src="${slug}/screenshots/${f}" alt="${cap}"><figcaption>${cap}</figcaption></figure>`;
  }).join('');
  return { title: 'Screenshots', html: `<div class="gallery">${figs}</div>` };
}

function main() {
  // Discover tools: every folder under tools/ that has a tool.json.
  const slugs = readdirSync(TOOLS_DIR).filter(s => existsSync(join(TOOLS_DIR, s, 'tool.json')));

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const tools = slugs.map(slug => {
    const dir = join(TOOLS_DIR, slug);
    const tj = readJSON(join(dir, 'tool.json'));                           // frame (human-authored)
    const relPath = join(dir, 'release.json');                             // latest release (pipeline-written)
    const rel = existsSync(relPath) ? readJSON(relPath) : null;
    const status = rel ? 'stable' : 'soon';                                // no release.json → Coming soon

    // App-facing manifest (auto-update reads latest + download url).
    if (rel) {
      const od = join(OUT, slug); mkdirSync(od, { recursive: true });
      writeFileSync(join(od, 'version.json'), JSON.stringify({
        tool: slug, name: tj.name, latest: Number(rel.version),
        releases: [{ build: Number(rel.version), date: rel.date, url: rel.url }]
      }, null, 2));
    }

    const pages = docPages(dir);
    const gallery = galleryTab(dir, slug);   // Screenshots tab, always last
    if (gallery) pages.push(gallery);

    return {
      id: slug, name: tj.name, icon: tj.icon, ai: !!tj.ai, description: tj.description,
      order: tj.order ?? 999, status,
      runtime: tj.runtime || '.NET', license: tj.license || 'Free',
      version: rel ? rel.version : '—',
      updated: rel ? rel.date : '—',
      size: rel ? (rel.size || '—') : '—',
      downloads: rel && rel.url ? [{ t: 'Windows — portable .exe', sub: tj.asset || 'download', url: rel.url }] : [],
      pages
    };
  }).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  const template = readFileSync(join(ROOT, 'template.html'), 'utf8');
  const data = JSON.stringify(tools).replace(/</g, '\\u003c');   // safe inside <script>
  writeFileSync(join(OUT, 'index.html'), template.replace('__TOOLS__', () => data));

  console.log(`Built ${tools.length} tool(s) — ${tools.filter(t => t.status === 'stable').length} published — to ${OUT}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
