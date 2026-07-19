import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderToolPage, renderIndex } from '../lib/render.js';

const tool = { slug: 'ip-printer', name: 'IP Printer', tagline: 'tag', asset: 'MunerisIpPrinter.exe' };
const manifest = { tool: 'ip-printer', name: 'IP Printer', latest: 28,
  releases: [{ build: 28, date: '2026-07-14', notes: '## Fix\n- a', url: 'https://x/v28/MunerisIpPrinter.exe', sha256: 'abc' }] };

test('tool page: responsive meta, download link, version, history', () => {
  const html = renderToolPage(tool, manifest, { readmeHtml: '<p>docs</p>', images: ['images/Main.PNG'] });
  assert.match(html, /name="viewport"[^>]*width=device-width/);
  assert.match(html, /https:\/\/x\/v28\/MunerisIpPrinter\.exe/);
  assert.match(html, /v28/);
  assert.match(html, /2026-07-14/);
  assert.ok(!/\s(width|height)="\d+"/.test(html) || /max-width:\s*100%/.test(html)); // images must be fluid
});

test('each version in history has its own archive download link', () => {
  const m2 = { tool: 'ip-printer', name: 'IP Printer', latest: 28, releases: [
    { build: 28, date: '2026-07-14', notes: 'x', url: 'https://x/v28/MunerisIpPrinter.exe', sha256: 'a' },
    { build: 27, date: '2026-07-05', notes: 'y', url: 'https://x/v27/MunerisIpPrinter.exe', sha256: 'b' } ] };
  const html = renderToolPage(tool, m2, {});
  // an archive link for the OLDER build must be present
  assert.match(html, /class="dl"[^>]*href="https:\/\/x\/v27\/MunerisIpPrinter\.exe"/);
});

test('index lists each tool with a link to its page', () => {
  const html = renderIndex([tool], { 'ip-printer': manifest });
  assert.match(html, /href="ip-printer\/"/);
  assert.match(html, /IP Printer/);
});
