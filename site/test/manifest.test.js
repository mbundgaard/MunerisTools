import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildManifest } from '../lib/manifest.js';

const tool = { slug: 'ip-printer', name: 'IP Printer', asset: 'MunerisIpPrinter.exe' };
const releases = [
  { tag_name: 'ip-printer/v28', published_at: '2026-07-14T20:35:08Z', body: 'fix things',
    assets: [{ name: 'MunerisIpPrinter.exe', browser_download_url: 'https://x/v28/MunerisIpPrinter.exe', digest: 'sha256:abc' }] },
  { tag_name: 'ip-printer/v27', published_at: '2026-07-05T17:50:05Z', body: 'features',
    assets: [{ name: 'MunerisIpPrinter.exe', browser_download_url: 'https://x/v27/MunerisIpPrinter.exe', digest: 'sha256:def' }] },
  { tag_name: 'kds/v3', published_at: '2026-07-16T00:00:00Z', body: 'other tool', assets: [] }
];

test('filters by tool prefix, newest first, extracts fields', () => {
  const m = buildManifest(releases, tool);
  assert.equal(m.tool, 'ip-printer');
  assert.equal(m.latest, 28);
  assert.equal(m.releases.length, 2);
  assert.equal(m.releases[0].build, 28);
  assert.equal(m.releases[0].date, '2026-07-14');
  assert.equal(m.releases[0].url, 'https://x/v28/MunerisIpPrinter.exe');
  assert.equal(m.releases[0].sha256, 'abc');
  assert.equal(m.releases[1].build, 27);
});

test('unparseable or unmatched tags are ignored; empty is valid', () => {
  const m = buildManifest([{ tag_name: 'ip-printer/vX', assets: [] }], tool);
  assert.equal(m.latest, null);
  assert.equal(m.releases.length, 0);
});
