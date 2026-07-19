import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
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

function fmtSize(bytes) {
  if (!bytes) return '—';
  return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

// Read a tool's page doc (markdown) and render to HTML.
export function docHtml(slug) {
  const p = join(ROOT, 'docs', `${slug}.md`);
  return existsSync(p) ? marked.parse(readFileSync(p, 'utf8')) : '';
}

function main() {
  const tools = JSON.parse(readFileSync(join(ROOT, 'tools.json'), 'utf8'));
  const releases = fetchReleases();

  // One manifest per published tool — reused for the site data AND the app-facing version.json.
  const manifests = {};
  for (const t of tools) if (!t.comingSoon) manifests[t.slug] = buildManifest(releases, t);

  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  const TOOLS = tools.map(t => {
    const base = { id: t.slug, name: t.name, icon: t.icon, ai: !!t.ai, short: t.short, lede: t.lede,
                   runtime: t.runtime || '.NET', license: t.license || 'Free', docsHtml: docHtml(t.slug) };

    if (t.comingSoon) {
      return { ...base, status: 'soon', version: '—', updated: '—', size: '—', downloads: [],
        changelog: [{ v: '—', d: 'Coming soon', latest: true, notesHtml: '<p>Not yet published here.</p>' }] };
    }

    const rels = manifests[t.slug].releases;
    const latest = rels[0];
    return { ...base, status: 'stable',
      version: latest ? String(latest.build) : '—',
      updated: latest ? latest.date : '—',
      size: latest ? fmtSize(latest.size) : '—',
      downloads: latest && latest.url ? [{ t: 'Windows — portable .exe', sub: t.asset, url: latest.url }] : [],
      changelog: rels.map(r => ({ v: String(r.build), d: r.date, latest: r === latest, notesHtml: marked.parse(r.notes || '') })) };
  });

  // App-facing manifest per published tool.
  for (const t of tools) {
    if (t.comingSoon) continue;
    const dir = join(OUT, t.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'version.json'), JSON.stringify(manifests[t.slug], null, 2));
  }

  // Inject the tool data into the SPA template. Function replacement avoids $-token interpretation;
  // escaping '<' keeps the JSON safe inside <script> (no accidental </script>, no HTML injection).
  const template = readFileSync(join(ROOT, 'template.html'), 'utf8');
  const data = JSON.stringify(TOOLS).replace(/</g, '\\u003c');
  const html = template.replace('__TOOLS__', () => data);
  writeFileSync(join(OUT, 'index.html'), html);

  console.log(`Built ${TOOLS.length} tool(s) — ${Object.keys(manifests).length} published — to ${OUT}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
