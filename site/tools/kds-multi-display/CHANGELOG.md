---
title: Changelog
order: 100
---

## v2 — 2026-07-22
- fix: auto-update now works — it reads the tool's published release feed. Earlier builds polled a file the site doesn't serve, so they never saw new versions; update from v1 by hand once, then v2 and later update themselves.
- chg: white app/taskbar icon (was transparent).

## v1 — 2026-07-20
- add: First release. Hosts N Muneris KDS display stations in one window, each on its own loopback endpoint (`127.0.0.{n}:5022`), driven by a KDS Controller or Simphony's virtual KDS.
- add: Sidebar with per-station connection dot, live order count, `Ctrl+1..9` switching, and inline rename.
- add: Click-to-bump chits; Settings to add/rename/remove stations; Open logs folder; About.
- add: Background auto-update from the MunerisTools site — checks on launch, downloads quietly, applies on click or next launch.
