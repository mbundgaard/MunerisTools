# Muneris Tools

Public documentation, release binaries, and the generated catalog site for Muneris's small,
self-contained Windows utilities. Each tool's **source code is private** — only its docs and
releases live here.

**Live site:** https://mbundgaard.github.io/MunerisTools/

## What's in here

- **`site/tools/<slug>/`** — one self-describing folder per tool. This is the content you edit.
- **`site/`** — the static-site generator (`build.js`, a small Node build) and `template.html`.
  It reads the tool folders and writes `site/_site/`.
- **`.github/workflows/pages.yml`** — builds and deploys the site to GitHub Pages on pushes under
  `site/**` (the publish pipeline's `release.json` commit lands there, so releases deploy too).

The site is generated. Never hand-edit `site/_site/`.

---

## The tool-folder contract — read this to add or update a tool

A tool is a folder `site/tools/<slug>/` containing:

| File | Who writes it | Purpose |
|---|---|---|
| `tool.json` | you (human or agent) | The frame — name, icon, description, runtime, etc. |
| `release.json` | the release pipeline | Latest build's version / date / size / download url. |
| `*.md` | you | One documentation tab per file (`README.md`, `QUICK-START.md`, `CHANGELOG.md`, …). |
| `screenshots/` *(optional)* | you | Images here become an auto **Screenshots** gallery tab (always last). |

The generator discovers **every folder under `site/tools/` that contains a `tool.json`** — one
home-page card and one detail page per folder. There is no central registry: add a folder and it
appears; a folder without `release.json` renders as **Coming soon** (no download).

### `tool.json` — required, human-authored

```json
{
  "name": "IP Printer",
  "icon": "printer",
  "ai": true,
  "description": "One line — used on the card AND as the detail-page subtitle.",
  "order": 1,
  "runtime": ".NET Framework 4.6.2",
  "license": "MIT",
  "asset": "MunerisIpPrinter.exe"
}
```

- **`icon`** — one of: `printer` · `terminal` · `kds` · `sync` · `gauge` · `key`.
- **`ai`** — `true` adds the *"AI · agent-drivable"* label on the card and page.
- **`description`** — a single line, reused on the card and the page header (there is only one).
- **`order`** — card sort order, ascending; ties break alphabetically.
- **`asset`** — the release asset's filename, shown under the Download button.
- Do **not** put release info here — the latest release lives in `release.json`.

### `release.json` — pipeline-written, do not hand-author

```json
{
  "version": "28",
  "date": "2026-07-19",
  "size": "1010 KB",
  "url": "https://github.com/mbundgaard/MunerisTools/releases/download/ip-printer/v28/MunerisIpPrinter.exe"
}
```

Written (whole-file) by the tool's publish pipeline when it cuts a release. Omit it to list the
tool as **Coming soon**.

### Markdown pages — one tab per `.md`

Every `.md` in the folder becomes a tab. Filenames don't matter — the tab title and order come from
frontmatter — but keep the main doc as **`README.md`** so it also renders nicely on GitHub.

```markdown
---
title: Documentation
order: 2
---

## Overview
…content…
```

Conventional set: `QUICK-START.md` → *Quick start* (`order: 1`), `README.md` → *Documentation*
(`order: 2`), `CHANGELOG.md` → *Changelog* (`order: 100`).

**Changelog formatting** — for the version headers and change chips to render, use `## v<n> — <ISO date>`
headings and typed bullets:

```markdown
## v28 — 2026-07-14
- fix: Double-height text scales width and height independently.
- add: Local HTTP API on port 9101 for agent-driven receipt design.
- chg: Redesigned Settings dialog.
```

`add` / `fix` / `chg` become coloured chips; the `v28 — 2026-07-14` header renders as the version
over a small muted date.

### Screenshots (optional) — a `screenshots/` folder

Drop images (`.png`, `.jpg`, `.gif`, `.webp`, `.avif`) into a **`screenshots/`** subfolder and a
**Screenshots** tab appears automatically as the **last** tab — a responsive gallery, tap any image to
enlarge. Nothing to register.

- **Order + caption come from the filename**, same convention-over-config idea as the `.md` frontmatter.
  `01-settings-dialog.png` sorts first and captions as *"Settings dialog"* (a leading `NN-` is stripped,
  `-`/`_` become spaces).
- Images are **copied** into the site (`/<slug>/screenshots/…`) and lazy-loaded — they are not inlined,
  so the page stays light. Keep them reasonably sized (they display ~2-up).

---

## Adding a new tool

Pick a **slug** — lowercase-kebab (`ip-printer`, `sim-cli`). It must be identical everywhere: the
`site/tools/<slug>/` folder, the release tag prefix `<slug>/v<n>`, and the tool's auto-update config.
`<n>` is a monotonic build number (for the .NET tools it's the 4th component of the CalVer version).

Then choose how the folder is produced:

### A. Tool with its own private source repo (the normal path)

Keep the tool's public docs in a top-level **`tool/`** folder in that repo (`tool.json`, `README.md`,
`CHANGELOG.md`, optional `QUICK-START.md` and `screenshots/`). Copy the release wiring from
`MunerisIpPrinter` and change a few values:

- **`publish-release.ps1`** — builds the `<slug>/v<n>` release from the binary and writes
  `tool/release.json`. Change `$Slug`, the release title, and the asset name.
- **`publish-docs.ps1`** — mirrors `tool/` → `MunerisTools/site/tools/<slug>/`. Change `$Slug`.
- **`azure-pipelines.yml`** — bump-gate → build → `publish-release.ps1` → clone MunerisTools +
  `publish-docs.ps1` + push. Change the build step and the `<slug>` in the gate/commit, then add a
  **secret `GH_PAT`** variable (classic PAT, `repo` scope) in the ADO pipeline.

On every push to `main` the pipeline **mirrors `tool/` (docs, screenshots, `tool.json`) to the site** —
so doc and screenshot fixes ship without a version bump. If the build number is new it *also* builds the
binary, cuts the `<slug>/v<n>` release, and refreshes `release.json`. Either way the commit into this
repo triggers the Pages build. (`release.json` is owned by the site side; the mirror never overwrites it
except when a release is cut.)

### B. Small tool, no pipeline (author directly here)

Create `site/tools/<slug>/` with a `tool.json` and at least a `README.md`. To publish a build by hand:

1. Create the release + attach the binary
   `gh release create <slug>/v<n> <binary> --repo mbundgaard/MunerisTools --title "<Name> v<n>"`
2. Add `site/tools/<slug>/release.json` (`version`, `date`, `size`, `url` — see the schema above).
3. Commit + push — the Pages build regenerates the site.

Omit `release.json` to list the tool as **Coming soon**.

## Icons

`icon` must be one of the built-in set: `printer · terminal · kds · sync · gauge · key`. To add a new
one, add its SVG under a new key to the `ICONS` map in **`site/template.html`**.

## Releases & auto-update

- One GitHub release per build, tagged **`<slug>/v<n>`** (e.g. `ip-printer/v28`), with the binary
  attached under a **stable filename** so users' shortcuts survive updates.
- The generator also writes **`<slug>/version.json`** (latest build + download url) into the site, so
  each tool can poll `https://mbundgaard.github.io/MunerisTools/<slug>/version.json` to self-update.

## Local preview

```bash
cd site
npm ci
node build.js        # writes site/_site/  — open site/_site/index.html
```
