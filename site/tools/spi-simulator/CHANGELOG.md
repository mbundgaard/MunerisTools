---
title: Changelog
order: 100
---

## v2 — 2026-08-29
- chg: Auto-update now follows the Muneris IP Printer flow: silent periodic release-feed polling, background download, then an "Update ready!" one-click swap and relaunch.

## v1 â€” 2026-08-29
- add: First usable SPI Simulator release.
- add: Local HTTP listener on port 8991.
- add: Single active transaction workflow with terminal-busy handling for concurrent requests.
- add: Details pane showing formatted request XML, then formatted response XML after send.
- add: Dropdown-based response composition for result, amount, card profile, cardholder flow, and offline flag.
- add: Startup update check against tools.muneris.cloud, plus one-click download/swap/relaunch once the pipeline publishes release.json.
- add: More realistic 32-column card receipt PrintData.
