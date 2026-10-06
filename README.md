# Muneris Tools

Public documentation and the generated catalog site for Muneris utilities, including
portable Windows executables and cross-platform npm packages. Some tools have private
source repositories; STS CLI is public at https://github.com/mbundgaard/sts-cli.
STS is installed from npm, not from an executable hosted here.

**Live site:** https://tools.muneris.cloud/

## What's in here

- **`site/tools/<slug>/`** — one self-describing folder per tool. This is the content you edit.
- **`site/`** — the static-site generator (`build.js`, a small Node build) and `template.html`.
  It reads the tool folders and writes `site/_site/`.
- **`.github/workflows/pages.yml`** — builds and deploys the site to GitHub Pages on pushes under
  `site/**` (the publish pipeline commits there too, so releases deploy without a separate trigger).

The site is generated. Never hand-edit `site/_site/`.

---

## The tool-folder contract — read this to add or update a tool

A tool is a folder `site/tools/<slug>/`. **Three files are required** — they are the published
contract, served verbatim at `https://tools.muneris.cloud/<slug>/…` and described in
[`llms.txt`](https://tools.muneris.cloud/llms.txt) so an AI agent can find and use the tool
without scraping the site:

| File | Purpose |
|---|---|
| `tool.json` | The frame — name, icon, features, description, runtime, etc. |
| `README.md` | What the tool does and how it is used. |
| `CHANGELOG.md` | Version history, newest first. Its newest `## v<n>` section becomes the release notes. |

**Beyond those three, add as many `.md` files as you like** — `QUICK-START.md`, notes, a FAQ.
Each becomes a documentation tab on the tool's page, ordered by its frontmatter. They are
rendered online and published alongside the rest, they are simply not part of the three-file
contract that `llms.txt` advertises.

| Also optional | |
|---|---|
| `screenshots/` | Images here become an auto **Screenshots** gallery tab (always last). |

The generator discovers **every folder under `site/tools/` that contains a `tool.json`** — one
home-page card and one detail page per folder. There is no central registry: add a folder and it
appears. Until the tool's first release it renders as **Coming soon**, with no download button;
the release pipeline flips that over automatically when it publishes a build.

### `tool.json` — required, human-authored

```json
{
  "name": "IP Printer",
  "icon": "printer",
  "features": ["AI-enabled", "Auto-update"],
  "description": "One line — used on the card AND as the detail-page subtitle.",
  "order": 1,
  "runtime": ".NET Framework 4.6.2",
  "license": "MIT",
  "asset": "MunerisIpPrinter.exe"
}
```

- **`icon`** — one of: `printer` · `terminal` · `kds` · `sync` · `gauge` · `key`.
- **`features`** *(optional)* — a short list of notable-feature chips shown at the bottom of the card
  (e.g. `["AI-enabled", "Auto-update"]`); keep it to 2–3 short items. (A boolean `ai` field was
  retired on 2026-07-21 — say `"AI-enabled"` as a feature instead.)
- **`description`** — a single line, reused on the card and the page header (there is only one).
- **`order`** — card sort order, ascending; ties break alphabetically.
- **`asset`** — the release asset's filename, shown under the Download button.
- **`distribution`** (optional) - `{ "type": "npm", "package": "@muneris/sts-cli" }`
  selects npm installation instead of an executable download. Omit for existing
  portable Windows tools. npm entries need a stable SemVer release, e.g. `0.4.0`.
- Do **not** put version, date or download info here - the release pipeline supplies those.

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

### STS CLI: public npm source and reviewed release synchronization

STS is the exception to the legacy `tool/` mirroring below. Its source repository owns
`catalog/tool.json`, existing README/guides/changelog and explicitly listed screenshots.
The exporter generates the normal tool-folder contract; do not hand-maintain a second
copy of STS documentation here.

`.github/workflows/sync-sts.yml` runs hourly or manually. It reads npm stable `latest`,
requires a matching published GitHub release, checks out `v<version>` (never main),
and exports into a staging directory. It checks npm `gitHead` when available, records
the resolved source commit, and refuses downgrades or moved previously recorded tags.
It replaces only `site/tools/sts-cli/` and opens/updates `automation/sts-catalog` as a
reviewed PR. Review and merge to trigger the existing Pages deployment.

Enable **Settings > Actions > General > Workflow permissions > Allow GitHub Actions
to create and approve pull requests**. No PAT/new secret is required; this workflow
uses this repository's `GITHUB_TOKEN`. The checkbox permits creation; this workflow
does not approve or merge its own PR. Scheduled workflows can be delayed or disabled
by GitHub after inactivity; use **Sync published STS catalog > Run workflow** as needed.

Version `0.3.0` predates export support and is skipped without changing the catalog.
The catalog was bootstrapped from its verified release commit
`1d8a9abfbdadcc9b8df1e6aaab93871b7fcc9ee8`, using the allowlisted exporter and
catalog frame introduced in STS commit `7c4817ac8e6061219fdd3e193ddf114e79c076d2`.
Its documentation comes from the published tag, not unreleased main. The old .NET
STS catalog content has been replaced; historical executable releases remain available
on GitHub. The next release containing the exporter resumes normal synchronization.

For npm entries `release.json.url` is the npm page, `install` is a pinned install
command, and `sourceCommit`/`source` identify the release source. The UI shows
**Install with npm** and **View on npm**, not a download anchor. No `.exe` asset or
size is required. Catalog versions can lag pending review; STS checks npm for updates.
Existing executable tools retain their download behavior and legacy release feeds.

Only allowlisted Markdown/metadata and explicitly listed reviewed image files are
exported. Unlisted images, private references, token state, logs, and old STS site
files/screenshots are not carried forward. Changes to the export list require review
in the STS repository; review image pixels and metadata before making anything public.

### A. Tool with its own private source repo (legacy executable path)

Keep the tool's public docs in a top-level **`tool/`** folder in that repo (`tool.json`, `README.md`,
`CHANGELOG.md`, optional `QUICK-START.md` and `screenshots/`). Copy the release wiring from
`MunerisIpPrinter` and change a few values:

- **`publish-release.ps1`** — builds the `<slug>/v<n>` release from the binary and writes
  `tool/release.json`. Change `$Slug`, the release title, and the asset name.
- **`publish-docs.ps1`** — mirrors `tool/` → `MunerisTools/site/tools/<slug>/`. Change `$Slug`.
- **`azure-pipelines.yml`** — bump-gate → build → `publish-release.ps1` → clone MunerisTools +
  `publish-docs.ps1` + push. Change the build step and the `<slug>` in the gate/commit, then add a
  `GH_PAT` variable (a GitHub token with `repo` scope) in the pipeline YAML.

On every push to `main` the pipeline **mirrors `tool/` (docs, screenshots, `tool.json`) to the site** —
so doc and screenshot fixes ship without a version bump. If the build number is new it *also* builds the
binary, cuts the `<slug>/v<n>` release, and refreshes `release.json`. Either way the commit into this
repo triggers the Pages build. (`release.json` is owned by the site side; the mirror never overwrites it
except when a release is cut.)

### B. Small tool, no pipeline (author directly here)

Create `site/tools/<slug>/` with a `tool.json` and at least a `README.md`. To publish a build by hand:

1. Create the release + attach the binary
   `gh release create <slug>/v<n> <binary> --repo mbundgaard/MunerisTools --title "<Name> v<n>"`
2. Add the release feed by hand — `site/tools/<slug>/release.json`, shape below.
3. Commit + push — the Pages build regenerates the site.

Skip steps 1–2 and the tool simply lists as **Coming soon**.

## Icons

`icon` must be one of the built-in set: `printer · terminal · kds · sync · gauge · key`. To add a new
one, add its SVG under a new key to the `ICONS` map in **`site/template.html`**.

## Releases & auto-update

*The following describes legacy executable tools. For STS npm distribution, use the
reviewed synchronization described above instead.*

- One GitHub release per build, tagged **`<slug>/v<n>`** (e.g. `ip-printer/v28`), with the binary
  attached under a **stable filename** so users' shortcuts survive updates.
- Cutting a release writes **`release.json`** into the tool's folder — whole-file, by the pipeline.
  It is the one file in there nobody hand-authors, and its presence is what turns **Coming soon**
  into a download.

  ```json
  {
    "version": "28",
    "date": "2026-07-19",
    "size": "1010 KB",
    "url": "https://github.com/mbundgaard/MunerisTools/releases/download/ip-printer/v28/MunerisIpPrinter.exe"
  }
  ```

- It is published at `https://tools.muneris.cloud/<slug>/release.json`, so a tool polls that to
  self-update: compare its `version` with the running build, then download its `url`. (There is no
  generated `version.json` — the pipeline-written `release.json` IS the update feed, so there is no
  second shape to keep in sync.)

## Local preview

```bash
cd site
npm ci
npm test
node build.js        # writes site/_site/  — open site/_site/index.html
```
