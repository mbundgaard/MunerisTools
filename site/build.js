import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
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

// One sub-page (tab) per markdown file in the tool folder, sorted by order then title.
export function docPages(dir) {
  return readdirSync(dir).filter(f => f.endsWith('.md'))
    .map(f => parseDoc(readFileSync(join(dir, f), 'utf8')))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))
    .map(d => ({ title: d.title, html: `<div class="md">${marked.parse(d.body)}</div>` }));
}

function main() {
  // Discover tools: every folder under tools/ that has a tool.json.
  const slugs = readdirSync(TOOLS_DIR).filter(s => existsSync(join(TOOLS_DIR, s, 'tool.json')));

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const tools = slugs.map(slug => {
    const dir = join(TOOLS_DIR, slug);
    const tj = JSON.parse(readFileSync(join(dir, 'tool.json'), 'utf8'));
    const rel = tj.release;                 // latest release only; absent → Coming soon
    const status = rel ? 'stable' : 'soon';

    // App-facing manifest (auto-update reads latest + download url).
    if (rel) {
      const od = join(OUT, slug); mkdirSync(od, { recursive: true });
      writeFileSync(join(od, 'version.json'), JSON.stringify({
        tool: slug, name: tj.name, latest: Number(rel.version),
        releases: [{ build: Number(rel.version), date: rel.date, url: rel.url }]
      }, null, 2));
    }

    return {
      id: slug, name: tj.name, icon: tj.icon, ai: !!tj.ai, description: tj.description,
      order: tj.order ?? 999, status,
      runtime: tj.runtime || '.NET', license: tj.license || 'Free',
      version: rel ? rel.version : '—',
      updated: rel ? rel.date : '—',
      size: rel ? (rel.size || '—') : '—',
      downloads: rel && rel.url ? [{ t: 'Windows — portable .exe', sub: tj.asset || 'download', url: rel.url }] : [],
      pages: docPages(dir)
    };
  }).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  const template = readFileSync(join(ROOT, 'template.html'), 'utf8');
  const data = JSON.stringify(tools).replace(/</g, '\\u003c');   // safe inside <script>
  writeFileSync(join(OUT, 'index.html'), template.replace('__TOOLS__', () => data));

  console.log(`Built ${tools.length} tool(s) — ${tools.filter(t => t.status === 'stable').length} published — to ${OUT}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
