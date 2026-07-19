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
