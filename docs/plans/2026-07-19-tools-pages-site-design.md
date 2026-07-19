# Design — MunerisTools distribution site (GitHub Pages)

_Date: 2026-07-19_

## Problem

The tools' public presence currently rides directly on the GitHub Releases UI, which
constrains us: one release per tag, GitHub's own naming/layout, and an awkward
version-in-the-release-body marker so the app can discover updates. We want full control of
presentation and a clean, standard update contract, while keeping GitHub as the binary host.

## Solution overview

Treat **GitHub Releases + Tags as the data store**, and build a **custom static site on GitHub
Pages** (in the `MunerisTools` repo) that is generated from that data. A GitHub Action regenerates
the site and a per-tool `version.json` manifest on each release. The desktop app's auto-update reads
the manifest instead of scraping the release body.

**Scale:** the catalog targets **5–8 tools**. Each tool page must offer documentation, a changelog,
and **archive download** — every past version downloadable, not just the latest. The `version.json`
already lists every release with its asset `url`, so the tool page renders a download link per
version. Binaries stay as GitHub release assets, so archives cost the repo nothing.

```
publish release  ip-printer/v29  (binary asset + notes)
        │
   GitHub Action  (on: release published / manual dispatch)
        │   fetch all releases via `gh api`, group by tool prefix
        ▼
   generate  per tool:  version.json (full history)  +  responsive static HTML
        │   deploy via actions/deploy-pages
        ├──►  humans:  https://mbundgaard.github.io/MunerisTools/ip-printer/
        └──►  app:     https://mbundgaard.github.io/MunerisTools/ip-printer/version.json
```

## Release & tag scheme

- **Per-version releases.** Every version is its own GitHub release (the data record + binary).
- **Tag:** `ip-printer/v<n>` where `<n>` is the global build counter — the 4th component of the
  assembly version (`2026.7.14.28` → `28`), which `build.ps1 -Bump` increments (`prev+1`). Next
  release is `ip-printer/v29`, then `v30`. Slash-namespaced by tool; the Action filters by the
  `ip-printer/` prefix. (A plain `ip-printer` tag is no longer needed — the Pages site is the
  landing page — so the slash causes no conflict.)
- **Release title:** `IP Printer v<n>` (cosmetic; the page renders its own display).
- **Asset:** `MunerisIpPrinter.exe` (stable filename within each release).
- **Version key everywhere:** the build number `<n>`. The app compares its own build number (the
  assembly version's 4th component) to the manifest's `latest`. Valid because the counter is
  globally monotonic and never resets.

## `version.json` contract (one file feeds page + app)

Served at `…/ip-printer/version.json`:

```json
{
  "tool": "ip-printer",
  "name": "IP Printer",
  "latest": 29,
  "releases": [
    { "build": 29, "date": "2026-07-20", "notes": "…markdown…",
      "url": "https://github.com/mbundgaard/MunerisTools/releases/download/ip-printer/v29/MunerisIpPrinter.exe",
      "sha256": "…" },
    { "build": 28, "date": "2026-07-14", "notes": "…", "url": "…/v28/MunerisIpPrinter.exe", "sha256": "…" }
  ]
}
```

- `releases` is newest-first. The app uses `releases[0]` (or `latest`); the page renders the full
  array as version history. Single source of truth — they cannot disagree.

## Components

- **Generator** — a small **Node script** (no framework) in `MunerisTools`. Inputs: the releases
  JSON (from `gh api`), and each tool's `docs/` content (README/CHANGELOG/images, already published
  from the tool's source repo). Outputs: the static site (catalog index + per-tool page) and each
  `version.json`. Lean and fully in our control, matching the app's zero-dependency ethos.
- **GitHub Action** — installs Node, runs the generator, deploys with `actions/deploy-pages`.
  Triggers: `release: published` and `workflow_dispatch`.
- **App updater** — `UpdateChecker` reads `version.json`, compares build numbers, downloads the
  asset URL from the manifest. The hidden-marker logic and the rolling-release approach are removed.

## Responsive / mobile (first-class requirement)

The generated pages must work well on phones as well as desktop:
- Mobile-first CSS, fluid layout, `max-width` content column, `viewport` meta tag.
- Single-column stacking on narrow widths; the download button is large and tap-friendly.
- Screenshots scale with `max-width: 100%`; version-history list reflows without horizontal scroll.
- No horizontal page scroll at any width; wide blocks (code, tables) scroll within their own box.
- Self-contained assets (inline or same-origin CSS); no external fonts/CDNs required.

## Hosting

- Start on `https://mbundgaard.github.io/MunerisTools/` via GitHub Pages (Actions deployment).
- Custom domain (e.g. `tools.muneris.dk`) can be added later with a `CNAME` — out of scope for v1.

## Migration

- Replace the current rolling `ip-printer` release with `ip-printer/v28` (rebuilt binary that reads
  the manifest).
- Update the app's `UpdateChecker` + `MainWindow` constants; update the README download badge to the
  Pages URL.
- **History backfill (optional):** start clean at v28; optionally backfill older builds as archive
  releases so the history page is fuller. Default: v28 only.

## Error handling

- App update check: silent no-op on offline / 404 / missing or malformed manifest (as today).
- Action failure: releases are untouched; the site simply isn't regenerated until a re-run. Manual
  `workflow_dispatch` allows a forced rebuild.

## Verification

- Run the generator locally against the real releases; validate `version.json` against the contract.
- Exercise the updater against a served `version.json` with the existing harness (old build → update
  offered; current/newer → none).
- Confirm the Pages deploy renders correctly on desktop and a narrow (mobile) viewport.

## Release automation (Azure DevOps → GitHub)

The source repo (Azure DevOps) is the sole orchestrator; the generator stays in MunerisTools but
every content input it consumes originates in the source repo and is pushed over.

On **push to `main`** in the source repo, `azure-pipelines.yml`:
1. **Bump-gate** — reads the csproj build number `<n>`; if `ip-printer/v<n>` already exists on GitHub,
   exits (no bump = no release).
2. Builds the `.exe` (`build.ps1`; hermetic via the `Microsoft.NETFramework.ReferenceAssemblies`
   build-only package).
3. **Pushes `docs\`** (README/CHANGELOG/images) into `MunerisTools/tools/ip-printer/` — *before* the
   release, so the rebuild sees fresh docs.
4. **Creates the `ip-printer/v<n>` release** (binary + notes from the newest changelog section).

The docs push and the release both trigger the Pages Action (`on: push [tools/**, site/**]` and
`on: release published`), which regenerates `version.json` + HTML and deploys. Auth is a single
GitHub PAT (`repo` scope covers both pushing commits and creating releases), stored as the pipeline
secret `GH_PAT`.

Manual fallback: the same scripts (`publish-docs.ps1`, `publish-release.ps1`) run locally.

## Out of scope (v1)

- Custom domain, download analytics, code signing, and any server-side component.
