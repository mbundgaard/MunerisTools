# Tools — folder convention

Each tool is a self-describing folder: **`site/tools/<slug>/`**. The generator discovers every folder
that contains a `tool.json` — one home-page card and one detail page per folder. No central registry:
add a folder and it appears.

> Full guide (schema, changelog formatting, how releases wire up): see the repo root `README.md`.

**Four files are required** — they are the published contract, served verbatim at
`https://tools.muneris.cloud/<slug>/…` and described in
[`llms.txt`](https://tools.muneris.cloud/llms.txt) so an AI agent can find and use the tool:

- **`tool.json`** — the frame (human-authored).
- **`release.json`** — latest build, written by the publish pipeline. **The file an updater reads.**
  Absent → **Coming soon** (no download), and the URL 404s.
- **`README.md`** — what the tool does and how it is used.
- **`CHANGELOG.md`** — version history, newest first; the newest section becomes the release notes.

**Any number of further `.md` files may be added** (`QUICK-START.md`, notes, …). Each becomes a
documentation tab and is published — they are just not part of the four-file contract.

## `tool.json`

```json
{
  "name": "IP Printer",
  "icon": "printer",                       // printer | terminal | kds | sync | gauge | key
  "features": ["AI-enabled", "Auto-update"],  // optional: notable-feature chips on the card
  "description": "One line — shown on the card AND as the detail-page subtitle.",
  "order": 1,                              // card sort order (ascending); ties break alphabetically
  "runtime": ".NET Framework 4.6.2",
  "license": "MIT",
  "asset": "MunerisIpPrinter.exe"          // release asset filename, shown under Download
}
```

## `release.json` (pipeline-written — don't hand-author)

```json
{
  "version": "28",
  "date": "2026-07-19",
  "size": "1010 KB",
  "url": "https://github.com/mbundgaard/MunerisTools/releases/download/ip-printer/v28/MunerisIpPrinter.exe"
}
```

## Sub-pages — one `.md` per tab

Every markdown file becomes a tab, ordered by frontmatter (both keys expected). Filenames are free —
keep the main doc as `README.md` so it renders on GitHub too.

```markdown
---
title: Quick start
order: 1
---
…content…
```

Keep the changelog as `CHANGELOG.md` (`order: 100`). Use `## v28 — 2026-07-14` version headings and
`- add:` / `- fix:` / `- chg:` typed bullets so the version headers and change chips render.

## Screenshots (optional)

Add a `screenshots/` subfolder of images and a **Screenshots** gallery tab appears automatically as the
last tab (tap to enlarge). Order + captions come from the filename: `01-settings-dialog.png` → sorts
first, captioned "Settings dialog". Images are copied into the site and lazy-loaded, not inlined.

## Add a tool

Create `site/tools/<slug>/` with a `tool.json` and at least one `.md`. Done — the generator does the rest.
