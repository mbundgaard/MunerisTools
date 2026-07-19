# Muneris Tools

Documentation and downloads for the small utilities we build at Muneris. Each tool
is a self-contained portable executable — no installer, no dependencies.

> This repository holds **documentation and release binaries only**. The source code
> for each tool is maintained privately.

## Tools

| Tool | What it does | Docs | Download |
|------|--------------|------|----------|
| **IP Printer** | Stands in for up to 15 ESC/POS receipt printers on loopback IPs, so a POS can print to screen instead of hardware. | [Documentation](tools/ip-printer/) · [Changelog](tools/ip-printer/CHANGELOG.md) | [Download](https://github.com/mbundgaard/MunerisTools/releases/download/ip-printer/MunerisIpPrinter.exe) |

_More tools will be added here over time._

## Releases

Each tool has **one rolling GitHub Release**, tagged with the tool's slug (e.g. `ip-printer`).
Publishing a new version re-points that same release — it isn't a new tag per version — so each
tool gets **permanent URLs**:

```
Landing:   https://github.com/mbundgaard/MunerisTools/releases/tag/<slug>
Download:  https://github.com/mbundgaard/MunerisTools/releases/download/<slug>/<asset>
```

The current build's binary is attached as the release asset, always under a stable filename.
Per-version history is **not** a stack of releases — it lives in each tool's `CHANGELOG.md`.

Tools that auto-update read their own release (`/releases/tags/<slug>`) and compare its version to
the running build — so after the first download you normally never come back here manually.

## Maintaining this repo (convention)

**Each tool folder here is a *generated copy*, not the source of truth.** A tool's docs
live in its private source repo, in a top-level `docs/` folder, which is published 1:1 onto
this repo:

```
<tool source repo>/docs/*   →   MunerisTools/tools/<tool-slug>/
```

For example, IP Printer's source repo copies `docs/README.md`, `docs/CHANGELOG.md`, and
`docs/images/` into `tools/ip-printer/` via a `publish-docs.ps1` script in that repo.

Consequences of this rule:

- **Do not hand-edit files under `tools/<slug>/`** — they are overwritten on the next
  publish. Change the tool's `docs/` in its source repo and re-publish instead.
- **A tool's slug must be the same in three places:** its folder name here (`tools/<slug>/`),
  its rolling release tag (`<slug>`), and the auto-update constant inside the tool. Keep them
  in sync when adding a tool.
- **Only `docs/` is published.** Anything a source repo keeps outside `docs/` (build files,
  internal notes) never reaches this repo.
- **The release tag is version-less**, so a tool that auto-updates carries its full version in a
  hidden marker in the release body (`<!-- muneris-version: … -->`), written by its publish script.

### Adding a new tool

1. In the tool's source repo, create a `docs/` folder (`README.md`, `CHANGELOG.md`, optional
   `images/`) and a `publish-docs.ps1` that targets `tools/<slug>/` here.
2. Run it to create `tools/<slug>/`, then add a row to the [Tools](#tools) table above.
3. Publish the build as a single rolling release tagged `<slug>` (see IP Printer's
   `publish-release.ps1`), with the binary attached and, if it auto-updates, the version marker
   in the body.
