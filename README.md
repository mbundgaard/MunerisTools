# Muneris Tools

Documentation and downloads for the small utilities we build at Muneris. Each tool
is a self-contained portable executable — no installer, no dependencies.

> This repository holds **documentation and release binaries only**. The source code
> for each tool is maintained privately.

## Tools

| Tool | What it does | Docs | Download |
|------|--------------|------|----------|
| **IP Printer** | Stands in for up to 15 ESC/POS receipt printers on loopback IPs, so a POS can print to screen instead of hardware. | [Documentation](tools/ip-printer/) · [Changelog](tools/ip-printer/CHANGELOG.md) | [Releases](https://github.com/mbundgaard/MunerisTools/releases?q=ip-printer&expanded=true) |

_More tools will be added here over time._

## Releases

Every tool version is published as a [GitHub Release](https://github.com/mbundgaard/MunerisTools/releases).
Because several tools share this repo, each release tag is **namespaced by tool**:

```
<tool-slug>/vYYYY.M.D.B      e.g.  ip-printer/v2026.7.14.28
```

The built binary is attached to the release as an asset. To find a specific tool's
releases, filter by its slug — e.g. [`?q=ip-printer`](https://github.com/mbundgaard/MunerisTools/releases?q=ip-printer&expanded=true).

Tools that support auto-update check this repo's Releases feed on their own, match
their tool slug, and offer the newest version — so after the first download you
normally never need to come back here manually.

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
- **A tool's slug must be the same in three places:** its folder name here
  (`tools/<slug>/`), its release tag prefix (`<slug>/vYYYY.M.D.B`), and the auto-update
  constant inside the tool. Keep them in sync when adding a tool.
- **Only `docs/` is published.** Anything a source repo keeps outside `docs/` (build files,
  internal notes) never reaches this repo.

### Adding a new tool

1. In the tool's source repo, create a `docs/` folder (`README.md`, `CHANGELOG.md`, optional
   `images/`) and a `publish-docs.ps1` that targets `tools/<slug>/` here.
2. Run it to create `tools/<slug>/`, then add a row to the [Tools](#tools) table above.
3. Publish releases as `<slug>/vYYYY.M.D.B` with the built binary attached.
