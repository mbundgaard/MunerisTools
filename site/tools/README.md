# Tools — folder convention

Each tool is a self-describing folder: **`tools/<slug>/`**. The generator discovers every folder
that contains a `tool.json` — one card on the home page and one detail page per folder. There is no
central registry; add a folder and it appears.

## `tool.json` — the frame

```json
{
  "name": "IP Printer",
  "icon": "printer",                       // printer | terminal | kds | sync | gauge | key
  "ai": true,
  "description": "One line — shown on the card AND as the detail-page subtitle.",
  "order": 1,                              // card sort order (ascending); ties break alphabetically
  "runtime": ".NET Framework 4.6.2",
  "license": "MIT",
  "asset": "MunerisIpPrinter.exe",
  "release": {                             // written by the publish pipeline
    "version": "28",
    "date": "2026-07-19",
    "size": "1010 KB",
    "url": "https://github.com/mbundgaard/MunerisTools/releases/download/ip-printer/v28/MunerisIpPrinter.exe"
  }
}
```

- **One `description`** — the same line on the card and the page header.
- **`release`** is the *latest* only, written by the pipeline. No `release` → the tool renders as **Coming soon** (no download).

## Sub-pages — one `.md` per tab

Every markdown file in the folder becomes a tab, ordered by frontmatter (both keys expected):

```markdown
---
title: Quick start
order: 1
---
…content…
```

The **changelog** is just `changelog.md` (a normal page); the pipeline prepends each new version to it.
Old download links inside it may eventually break — that's fine.

## Add a tool

Create `tools/<slug>/` with a `tool.json` and at least one `.md`. Done — the generator does the rest.
