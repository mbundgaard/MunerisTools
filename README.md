# Muneris Tools

Public documentation, release binaries, and the generated catalog site for Muneris's small,
self-contained Windows utilities. Each tool's **source code is private** — only its docs and
releases live here.

**Live site:** https://mbundgaard.github.io/MunerisTools/

## What's in here

- **`site/tools/<slug>/`** — one self-describing folder per tool. This is the content you edit.
- **`site/`** — the static-site generator (`build.js`, a small Node build) and `template.html`.
  It reads the tool folders and writes `site/_site/`.
- **`.github/workflows/pages.yml`** — builds and deploys the site to GitHub Pages on every
  release and on pushes under `site/**`.

The site is generated. Never hand-edit `site/_site/`.

---

## The tool-folder contract — read this to add or update a tool

A tool is a folder `site/tools/<slug>/` containing:

| File | Who writes it | Purpose |
|---|---|---|
| `tool.json` | you (human or agent) | The frame — name, icon, description, runtime, etc. |
| `release.json` | the release pipeline | Latest build's version / date / size / download url. |
| `*.md` | you | One documentation tab per file (`README.md`, `QUICK-START.md`, `CHANGELOG.md`, …). |

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

---

## Adding a new tool

Choose where the folder is authored:

- **The tool has its own private source repo** (the normal case, e.g. `MunerisIpPrinter`) — keep its
  public docs in a top-level **`tool/`** folder there (`tool.json`, `README.md`, `CHANGELOG.md`, …).
  Its release pipeline then:
  1. creates the `<slug>/v<n>` GitHub release with the binary attached,
  2. writes `tool/release.json`,
  3. mirrors `tool/` → this repo's `site/tools/<slug>/`.

  See `MunerisIpPrinter` (`publish-release.ps1`, `publish-docs.ps1`, `azure-pipelines.yml`) for the
  reference wiring.

- **A small tool authored directly here** — create `site/tools/<slug>/` with a `tool.json` and at
  least a `README.md`. Leave `release.json` to the pipeline, or omit it to list as Coming soon.

The **slug** must match everywhere: the `site/tools/<slug>/` folder name, the release tag prefix
`<slug>/v<n>`, and the tool's own auto-update configuration.

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
