# MunerisTools Pages Site Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Generate a responsive GitHub Pages site and per-tool `version.json` manifests from GitHub Releases, and switch the IP Printer app's auto-update to read the manifest.

**Architecture:** GitHub Releases + Tags are the data store (per-version releases tagged `ip-printer/v<n>`). A small Node generator in the `MunerisTools` repo turns the releases (fetched via `gh api`) plus each tool's `docs/` content into a static, mobile-first site and a `version.json` per tool. A GitHub Action runs the generator and deploys to Pages on each release. The desktop app reads `…/ip-printer/version.json` and compares build numbers.

**Tech Stack:** Node.js (generator, `node:test`, one dep: `marked`), GitHub Actions + Pages, PowerShell (publish scripts), C#/.NET Framework 4.6.2 (app updater).

**Repos:**
- `MunerisTools` (GitHub, public): site generator, Action, templates, published tool docs.
- `MunerisIpPrinter` (Azure DevOps `origin`): the app; updater + publish scripts + docs.

**Cross-cutting conventions:**
- Commit author: `mbundgaard <mb@muneris.dk>`.
- Version key everywhere is the **build number** `<n>` = the assembly version's 4th component.
- Manifest URL: `https://mbundgaard.github.io/MunerisTools/ip-printer/version.json`.

---

## Phase 1 — Node generator (MunerisTools/site)

Work in `D:\Source\MunerisTools`. The generator core (manifest + render) takes plain data so it is unit-testable without network; `gh api` is a thin wrapper in the entry script.

### Task 1: Scaffold the Node project

**Files:**
- Create: `site/package.json`
- Create: `site/tools.json`
- Create: `site/.gitignore`

**Step 1:** Create `site/package.json`:
```json
{
  "name": "muneris-tools-site",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "build": "node build.js"
  },
  "dependencies": { "marked": "^12.0.0" }
}
```

**Step 2:** Create `site/tools.json` (the catalog the generator iterates):
```json
[
  { "slug": "ip-printer", "name": "IP Printer", "asset": "MunerisIpPrinter.exe",
    "tagline": "Stand in for up to 15 ESC/POS receipt printers on loopback IPs — print to screen, not paper." }
]
```

**Step 3:** Create `site/.gitignore`:
```
node_modules/
_site/
```

**Step 4:** Install and confirm:
Run: `cd D:\Source\MunerisTools\site && npm install`
Expected: `node_modules/` created, `marked` present.

**Step 5:** Commit:
```bash
git add site/package.json site/package-lock.json site/tools.json site/.gitignore
git commit -m "site: scaffold Node generator project"
```

### Task 2: `buildManifest` — releases JSON → version.json object (TDD)

**Files:**
- Create: `site/lib/manifest.js`
- Test: `site/test/manifest.test.js`

**Step 1: Write the failing test** (`site/test/manifest.test.js`):
```js
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
```

**Step 2: Run to verify it fails**
Run: `cd D:\Source\MunerisTools\site && node --test`
Expected: FAIL (`buildManifest` not found).

**Step 3: Implement** (`site/lib/manifest.js`):
```js
// Turn the GitHub releases array into a per-tool manifest object.
export function buildManifest(releases, tool) {
  const prefix = `${tool.slug}/v`;
  const items = [];
  for (const r of releases || []) {
    const tag = r.tag_name || '';
    if (!tag.startsWith(prefix)) continue;
    const build = Number.parseInt(tag.slice(prefix.length), 10);
    if (!Number.isInteger(build)) continue;
    const asset = (r.assets || []).find(a => a.name === tool.asset);
    items.push({
      build,
      date: (r.published_at || '').slice(0, 10),
      notes: r.body || '',
      url: asset ? asset.browser_download_url : null,
      sha256: asset && asset.digest ? asset.digest.replace(/^sha256:/, '') : null
    });
  }
  items.sort((a, b) => b.build - a.build);
  return { tool: tool.slug, name: tool.name, latest: items.length ? items[0].build : null, releases: items };
}
```

**Step 4: Run to verify it passes**
Run: `node --test`
Expected: PASS (both tests).

**Step 5: Commit**
```bash
git add site/lib/manifest.js site/test/manifest.test.js
git commit -m "site: buildManifest transforms releases into version.json"
```

### Task 3: `renderToolPage` / `renderIndex` — HTML from manifest + docs (TDD)

**Files:**
- Create: `site/lib/render.js`
- Create: `site/lib/layout.js` (shared HTML shell + `<head>` incl. responsive meta)
- Test: `site/test/render.test.js`

**Step 1: Write the failing test** (`site/test/render.test.js`):
```js
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
```

**Step 2: Run to verify it fails**
Run: `node --test`
Expected: FAIL (`render.js` not found).

**Step 3: Implement** `site/lib/layout.js`:
```js
export function page({ title, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="/MunerisTools/assets/style.css">
</head>
<body>
<main class="wrap">
${body}
</main>
</body>
</html>`;
}
```

**Step 3b: Implement** `site/lib/render.js`:
```js
import { marked } from 'marked';
import { page } from './layout.js';

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
```

**Step 4: Run to verify it passes**
Run: `node --test`
Expected: PASS.

**Step 5: Commit**
```bash
git add site/lib/render.js site/lib/layout.js site/test/render.test.js
git commit -m "site: render index + tool pages from manifest and docs"
```

### Task 4: Responsive stylesheet

**Files:**
- Create: `site/assets/style.css`

**Step 1: Implement** `site/assets/style.css` (mobile-first; no external fonts):
```css
:root { --fg:#1a1a1a; --bg:#fff; --accent:#3a6fb8; --muted:#666; --line:#e3e3e3; }
@media (prefers-color-scheme: dark) { :root { --fg:#e8e8e8; --bg:#141414; --muted:#9a9a9a; --line:#2a2a2a; } }
* { box-sizing: border-box; }
body { margin:0; color:var(--fg); background:var(--bg);
  font: 16px/1.6 system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
.wrap { max-width: 820px; margin: 0 auto; padding: 24px 16px 64px; }
h1 { font-size: clamp(1.6rem, 5vw, 2.4rem); margin: .2em 0; }
.tagline { color: var(--muted); font-size: 1.1rem; }
.btn { display:inline-block; background:var(--accent); color:#fff; text-decoration:none;
  padding: 14px 22px; border-radius: 10px; font-weight:600; margin: 8px 0 4px;
  min-height: 44px; }               /* tap target */
.btn:active { filter: brightness(.9); }
.shots { display:grid; gap:12px; grid-template-columns:1fr; margin:20px 0; }
.shot, img { max-width:100%; height:auto; border:1px solid var(--line); border-radius:8px; }
.cards { display:grid; gap:14px; grid-template-columns:1fr; }
.card { display:block; text-decoration:none; color:inherit; border:1px solid var(--line);
  border-radius:12px; padding:16px; }
.rel { border-top:1px solid var(--line); padding-top:12px; }
.dl { display:inline-block; margin-top:8px; color:var(--accent); text-decoration:none; font-weight:600; min-height:44px; }
.dl::before { content:"⬇ "; }
small { color:var(--muted); font-weight:400; }
pre { overflow-x:auto; background:rgba(127,127,127,.12); padding:12px; border-radius:8px; }
.back, .card:hover h2 { color:var(--accent); }
@media (min-width: 620px) { .cards { grid-template-columns:1fr 1fr; } }
```

**Step 2: Verify no horizontal overflow** by eye after Task 5 build (checked in Task 6).

**Step 3: Commit**
```bash
git add site/assets/style.css
git commit -m "site: mobile-first responsive stylesheet"
```

### Task 5: Build entry — fetch releases, read docs, write `_site/`

**Files:**
- Create: `site/build.js`
- Test: `site/test/build-io.test.js` (only the pure docs-reading helper)

**Step 1: Write the failing test** for the docs helper (`site/test/build-io.test.js`):
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { listImages } from '../build.js';
// listImages returns web paths for a tool's images dir; missing dir → [].
test('missing images dir yields empty list', () => {
  assert.deepEqual(listImages('does-not-exist'), []);
});
```

**Step 2: Run to verify it fails**
Run: `node --test`
Expected: FAIL (`listImages` not exported).

**Step 3: Implement** `site/build.js`:
```js
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
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
  return readdirSync(dir).filter(f => /\.(png|jpe?g|webp|svg)$/i.test(f)).map(f => `images/${f}`);
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

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
```

**Step 4: Run to verify test passes**
Run: `node --test`
Expected: PASS.

**Step 5: Commit**
```bash
git add site/build.js site/test/build-io.test.js
git commit -m "site: build entry fetches releases and writes _site"
```

> NOTE: `build.js` can't fully run until per-version releases exist (Phase 3). It is exercised end-to-end in Task 11.

---

## Phase 2 — GitHub Action + Pages

### Task 6: Pages deploy workflow

**Files:**
- Create: `.github/workflows/pages.yml`

**Step 1: Implement** `.github/workflows/pages.yml`:
```yaml
name: Build & deploy Pages
on:
  release: { types: [published] }
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    env: { GH_TOKEN: ${{ github.token }} }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
        working-directory: site
      - run: npm run build
        working-directory: site
      - uses: actions/upload-pages-artifact@v3
        with: { path: site/_site }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: ${{ steps.deploy.outputs.page_url }} }
    steps:
      - id: deploy
        uses: actions/deploy-pages@v4
```

**Step 2:** Enable Pages (one-time, manual): repo Settings → Pages → Source = **GitHub Actions**. (Or: `gh api -X POST repos/mbundgaard/MunerisTools/pages -f build_type=workflow`.)

**Step 3: Commit**
```bash
git add .github/workflows/pages.yml
git commit -m "ci: build and deploy the Pages site on release"
```

---

## Phase 3 — Migrate releases to per-version

Work in `D:\Source\MunerisIpPrinter` for the build, and use `gh` against `MunerisTools`.

### Task 7: Rewrite `publish-release.ps1` for per-version releases

**Files:**
- Modify: `D:\Source\MunerisIpPrinter\publish-release.ps1` (full rewrite)

**Step 1: Implement** — publishes `ip-printer/v<build>` (create-or-update), title `IP Printer v<build>`, notes = newest `docs\CHANGELOG.md` section, asset `MunerisIpPrinter.exe`. No version marker (the manifest replaces it):
```powershell
param(
  [string]$Repo = 'mbundgaard/MunerisTools',
  [string]$Slug = 'ip-printer',
  [string]$Exe  = (Join-Path $PSScriptRoot 'bin\Release\publish\MunerisIpPrinter.exe')
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path $Exe)) { throw "Build first: '$Exe' not found." }
$ver   = [System.Diagnostics.FileVersionInfo]::GetVersionInfo($Exe).FileVersion
$build = ($ver -split '\.')[-1]
$tag   = "$Slug/v$build"
$title = "IP Printer v$build"
$changelog = Get-Content (Join-Path $PSScriptRoot 'docs\CHANGELOG.md') -Raw
$section = [regex]::Match($changelog, '(?ms)^## v.*?(?=^## v|\z)').Value.TrimEnd()
if (-not $section) { $section = "Release $ver" }
$notesFile = Join-Path $env:TEMP 'ip-printer-notes.md'
Set-Content $notesFile -Value $section -Encoding UTF8
& gh release view $tag --repo $Repo *> $null
if ($LASTEXITCODE -eq 0) {
  & gh release edit   $tag --repo $Repo --title $title --notes-file $notesFile | Out-Null
  & gh release upload $tag $Exe --repo $Repo --clobber | Out-Null
} else {
  & gh release create $tag $Exe --repo $Repo --title $title --notes-file $notesFile | Out-Null
}
Write-Host "Published $title  ($tag)"
```

**Step 2: Delete the old rolling release** (replaced by per-version):
Run: `gh release delete ip-printer --repo mbundgaard/MunerisTools --yes --cleanup-tag`
Expected: succeeds (no error).

**Step 3: Build + publish v28:**
Run: `cd D:\Source\MunerisIpPrinter && .\build.ps1 && .\publish-release.ps1`
Expected: prints `Published IP Printer v28  (ip-printer/v28)`.

**Step 4: Verify the release + tag:**
Run: `gh release view ip-printer/v28 --repo mbundgaard/MunerisTools --json tagName,name,assets --jq '.tagName + " " + .name + " " + (.assets[0].name)'`
Expected: `ip-printer/v28 IP Printer v28 MunerisIpPrinter.exe`

**Step 5: Commit** (source repo):
```bash
git add publish-release.ps1
git commit -m "publish-release: per-version ip-printer/v<n> releases"
```

### Task 8 (optional): Backfill older builds as archive releases

Skip by default. If wanted: for builds 27,22,21,20,19 download each old asset from `mbundgaard/MunerisIpPrinter` and `gh release create ip-printer/v<n>` with that asset + the matching `docs\CHANGELOG.md` section. Decide with the user before running.

---

## Phase 4 — App reads the manifest

Work in `D:\Source\MunerisIpPrinter`.

### Task 9: Rewrite `UpdateChecker.CheckAsync` to read `version.json`

**Files:**
- Modify: `Services/UpdateChecker.cs`
- Modify: `UI/MainWindow.xaml.cs` (constants + call sites)

**Step 1: Implement** the new `CheckAsync` (reads the manifest URL, compares build numbers). Replace the current tag/marker method body with:
```csharp
/// <param name="manifestUrl">e.g. "https://mbundgaard.github.io/MunerisTools/ip-printer/version.json".</param>
public static async Task<UpdateInfo?> CheckAsync(string manifestUrl, Version current, CancellationToken ct = default)
{
    try
    {
        var json = await Http.GetStringAsync(manifestUrl).ConfigureAwait(false);
        // Newest-first "releases":[{ "build":N, "url":"...", ... }]; take the first entry.
        var latestBuild = ExtractFirstIntField(json, "latest");
        if (latestBuild == null) return null;
        var currentBuild = Math.Max(0, current.Revision);
        if (latestBuild.Value <= currentBuild) return null;

        var assetUrl = ExtractFirstStringField(json, "url");       // first release's asset
        // ReleaseUrl: the tool page. LatestVersion carries the build in Revision for the temp-file name.
        var releasePage = manifestUrl.Replace("version.json", "");
        return new UpdateInfo(new Version(0, 0, 0, latestBuild.Value), releasePage, assetUrl);
    }
    catch { return null; }
}

/// <summary>First <c>"field": &lt;int&gt;</c> value, or null.</summary>
private static int? ExtractFirstIntField(string json, string field)
{
    var needle = "\"" + field + "\"";
    int idx = json.IndexOf(needle, StringComparison.Ordinal);
    if (idx < 0) return null;
    int i = idx + needle.Length;
    while (i < json.Length && (json[i] == ' ' || json[i] == ':')) i++;
    int start = i;
    while (i < json.Length && char.IsDigit(json[i])) i++;
    return int.TryParse(json.Substring(start, i - start), out var v) ? v : (int?)null;
}
```
Remove `ExtractVersionMarker` and the `<remarks>` about the rolling tag; keep `Normalize`, `FindAssetDownloadUrl` (unused now — remove it and `ExtractFirstStringField` stays), `ExtractFirstStringField`. Update the class summary to describe the manifest.

> Note: `LatestVersion` now only carries the build number in `.Revision`; the sidebar label reads `v{Revision}` (see Step 2) and the temp file becomes `MunerisIpPrinter-update-0.0.0.<n>.exe`, which `App.OnStartup`'s `Version.TryParse` + build compare still orders correctly.

**Step 2: Update** `UI/MainWindow.xaml.cs`:
- Replace the two constants:
```csharp
// Update manifest generated by the MunerisTools Pages site.
private const string ManifestUrl = "https://mbundgaard.github.io/MunerisTools/ip-printer/version.json";
```
- Update both call sites: `UpdateChecker.CheckAsync(ManifestUrl, current)` and `…(ManifestUrl, CurrentVersion)`.
- In `ApplyUpdateInfoAsync`, change the label to the build number: `UpdateLink.Text = $"v{info.LatestVersion.Revision} ↗";` and the ready tooltip similarly.

**Step 3: Build:**
Run: `cd D:\Source\MunerisIpPrinter && dotnet build -c Debug -v quiet`
Expected: `Build succeeded. 0 Error(s)`.

**Step 4: Commit:**
```bash
git add Services/UpdateChecker.cs UI/MainWindow.xaml.cs
git commit -m "updater: read version.json manifest, compare build numbers"
```

### Task 10: Verify the updater against the live manifest (harness)

**Files:**
- Modify: scratchpad `uc-test/Program.cs` (point at the manifest URL)

**Step 1:** Update the harness to call `CheckAsync(manifestUrl, version)` for builds `1.0.0.1`, `2026.7.14.28`, `9999.0.0.99`.

**Step 2: Run:**
Run: `cd <scratchpad>/uc-test && dotnet run -c Release`
Expected: build `…1` → UPDATE 0.0.0.28 with asset `…/ip-printer/v28/MunerisIpPrinter.exe`; build `…28` → null; build `…99` → null.

(Requires the Pages site deployed — do after Task 11. If Pages isn't up yet, temporarily point the harness at a local `_site/ip-printer/version.json` via a `file://` URL or a local static server to validate parsing.)

---

## Phase 5 — End-to-end + docs

### Task 11: First deploy and end-to-end check

**Step 1:** Trigger the site build:
Run: `gh workflow run pages.yml --repo mbundgaard/MunerisTools` then watch: `gh run watch --repo mbundgaard/MunerisTools`
Expected: build + deploy succeed.

**Step 2:** Verify manifest is served:
Run: `curl -s https://mbundgaard.github.io/MunerisTools/ip-printer/version.json`
Expected: JSON with `"latest": 28` and a `v28` asset URL.

**Step 3:** Verify pages render on desktop **and** a mobile viewport (open the tool page; use browser devtools device toolbar or the chrome-devtools skill; confirm no horizontal scroll, download button is large/tappable, screenshots fluid).

**Step 4:** Run the Task 10 harness against the live manifest — confirm the three expected results.

### Task 12: Update docs + README badge

**Files:**
- Modify: `D:\Source\MunerisIpPrinter\docs\README.md` (badge → Pages tool URL; auto-update section → "reads version.json")
- Modify: `D:\Source\MunerisIpPrinter\CLAUDE.md` (release flow: `.\publish-release.ps1` makes `ip-printer/v<n>`; the Action rebuilds the site; the app reads the manifest)
- Modify: `D:\Source\MunerisTools\README.md` (landing: link to the Pages site; note the site is generated by `site/` + the Action)

**Step 1:** Make the edits (download badge → `https://mbundgaard.github.io/MunerisTools/ip-printer/`).

**Step 2:** Publish docs + push both repos:
```
cd D:\Source\MunerisIpPrinter; .\publish-docs.ps1
git add -A && git commit -m "docs: point to Pages site + manifest updater" && git push origin main
cd D:\Source\MunerisTools; git add -A && git commit -m "docs: link to Pages distribution site" && git push origin main
```

**Step 3:** Mark the plan complete.

---

## Definition of done

- `ip-printer/v28` exists as a per-version release; the old rolling `ip-printer` release/tag is gone.
- `https://mbundgaard.github.io/MunerisTools/` shows the catalog; `…/ip-printer/` is a responsive tool page with download + version history; `…/ip-printer/version.json` matches the contract.
- The app (build 28) reads the manifest, reports up-to-date; an older build is offered v28 with the correct asset URL (harness-verified).
- The Action rebuilds and redeploys the site on every new release.
- Docs in both repos reflect the new flow.
