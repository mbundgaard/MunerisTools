import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from 'marked';
import { buildManifest } from './lib/manifest.js';

const ROOT = dirname(fileURLToPath(import.meta.url));   // .../site
const OUT = join(ROOT, '_site');
const REPO = process.env.SITE_REPO || 'mbundgaard/MunerisTools';

function fetchReleases() {
  const out = execFileSync('gh', ['api', '--paginate', `repos/${REPO}/releases`, '--jq', '.[]'], { encoding: 'utf8' });
  return out.trim().split('\n').filter(Boolean).map(l => JSON.parse(l));
}

function fmtSize(b) { if (!b) return '—'; return b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`; }

// Parse `--- title: … / order: … ---` frontmatter. Falls back to the first heading for the
// title and a large order (so un-numbered pages sort last, then alphabetically).
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
  if (!title) { const h = body.match(/^#+\s+(.+)$/m); title = h ? h[1].trim() : 'Documentation'; }
  return { title, order, body };
}

// One sub-page (tab) per markdown file in docs/<slug>/, sorted by order then title.
export function docPages(slug) {
  const dir = join(ROOT, 'docs', slug);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => f.endsWith('.md'))
    .map(f => parseDoc(readFileSync(join(dir, f), 'utf8')))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .map(d => ({ title: d.title, html: `<div class="md">${marked.parse(d.body)}</div>` }));
}

// The Changelog tab is generated from the releases (published tools only), newest first.
function changelogPage(rels) {
  const latest = rels[0];
  const html = rels.map(r => `
    <div class="cl-entry">
      <div class="cl-ver"><span class="v">v${r.build}</span><span class="d">${r.date}</span>${r === latest ? '<span class="cl-latest">latest</span>' : ''}</div>
      <div class="md">${marked.parse(r.notes || '')}</div>
    </div>`).join('');
  return { title: 'Changelog', badge: rels.length, html };
}

function main() {
  const tools = JSON.parse(readFileSync(join(ROOT, 'tools.json'), 'utf8'));
  const releases = fetchReleases();
  const manifests = {};
  for (const t of tools) if (!t.comingSoon) manifests[t.slug] = buildManifest(releases, t);

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const TOOLS = tools.map(t => {
    const pages = docPages(t.slug);
    const base = { id: t.slug, name: t.name, icon: t.icon, ai: !!t.ai, short: t.short, lede: t.lede,
                   runtime: t.runtime || '.NET', license: t.license || 'Free' };
    if (t.comingSoon) {
      return { ...base, status: 'soon', version: '—', updated: '—', size: '—', downloads: [], pages };
    }
    const rels = manifests[t.slug].releases;
    const latest = rels[0];
    if (rels.length) pages.push(changelogPage(rels));
    return { ...base, status: 'stable',
      version: latest ? String(latest.build) : '—',
      updated: latest ? latest.date : '—',
      size: latest ? fmtSize(latest.size) : '—',
      downloads: latest && latest.url ? [{ t: 'Windows — portable .exe', sub: t.asset, url: latest.url }] : [],
      pages };
  });

  // App-facing manifest per published tool.
  for (const t of tools) {
    if (t.comingSoon) continue;
    const dir = join(OUT, t.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'version.json'), JSON.stringify(manifests[t.slug], null, 2));
  }

  const template = readFileSync(join(ROOT, 'template.html'), 'utf8');
  const data = JSON.stringify(TOOLS).replace(/</g, '\\u003c');   // safe inside <script>
  writeFileSync(join(OUT, 'index.html'), template.replace('__TOOLS__', () => data));

  console.log(`Built ${TOOLS.length} tool(s) — ${Object.keys(manifests).length} published — to ${OUT}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
