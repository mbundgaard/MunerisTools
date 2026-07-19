import { marked } from 'marked';
import { page } from './layout.js';

// NOTE: tool fields, release metadata, and marked-rendered notes are injected into HTML
// unescaped. This is intentional and safe: every input is maintainer-controlled (tools.json
// and our own GitHub release notes). Do NOT wire third-party content in here without sanitizing.
export function renderToolPage(tool, manifest, docs = {}) {
  const latest = manifest.releases[0];
  const dl = latest && latest.url
    ? `<a class="btn" href="${latest.url}">Download ${tool.asset} &nbsp;v${manifest.latest}</a>`
    : `<p>No download available yet.</p>`;
  const shots = (docs.images || [])
    .map(src => `<img class="shot" src="${src}" alt="${tool.name} screenshot">`).join('\n');
  const history = manifest.releases.map(r => `
    <section class="rel">
      <h3>v${r.build} <small>${r.date}</small></h3>
      ${marked.parse(r.notes || '')}
      ${r.url ? `<a class="dl" href="${r.url}">Download v${r.build}</a>` : ''}
    </section>`).join('\n');
  const body = `
<a class="back" href="/MunerisTools/">← All tools</a>
<h1>${tool.name}</h1>
<p class="tagline">${tool.tagline || ''}</p>
${dl}
<div class="shots">${shots}</div>
${docs.readmeHtml || ''}
<h2>Version history</h2>
${history}`;
  return page({ title: `${tool.name} — Muneris Tools`, body });
}

export function renderIndex(tools, manifests) {
  const cards = tools.map(t => {
    const m = manifests[t.slug];
    const ver = m && m.latest ? `v${m.latest}` : '';
    return `<a class="card" href="${t.slug}/"><h2>${t.name} <small>${ver}</small></h2><p>${t.tagline || ''}</p></a>`;
  }).join('\n');
  return page({ title: 'Muneris Tools', body: `<h1>Muneris Tools</h1>\n<div class="cards">${cards}</div>` });
}
