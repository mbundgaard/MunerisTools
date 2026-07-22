---
title: Changelog
order: 100
---

## v1 — 2026-07-22
- Initial release.
- Orientation: `describe` reports the client version, workstation number, processes, display scaling, and classifies the current screen (PIN login / direct login / signed in / modal); `status` lists the ServiceHost processes and names the drivable client.
- Reads: `tree` dumps the UI element tree as JSON with bounding rectangles, `read` reports one element (value, supported actions, enabled, position), `find` lists every match with its `--nth`, `wait` blocks until an element appears or disappears.
- Actions: `click` (with `--dry-run`) and `set`, both of which refuse an ambiguous selector rather than acting on an arbitrary match.
- `screenshot` captures the window or a single element to a PNG, bringing the client to the front first so nothing bleeds into the image.
- Lifecycle: `start` / `stop` / `restart`, targeting the client UI and never the background service. `restart` waits for the UI to actually come back rather than sleeping.
- `sim version` reports this build as JSON (`v1`, the full assembly version, and the commit), read from the exe — no network, so it works offline and on a locked-down POS network. `sim version --check` compares against the latest published build and returns `latest`, `upToDate` and the download URL; it is the only call SimCLI makes to Muneris, it is opt-in, and if the feed is unreachable it still reports your local version instead of failing. `sim --version` returns the same JSON, so nothing on stdout is ever unparseable.
- One selector grammar shared by every element command — `--id` / `--name` / `--type` / `--class`, `--match contains`, `--nth`, `--include-offscreen` — because Simphony's automation ids are semantic but not unique.
- One JSON envelope on stdout for every command, and an exit-code taxonomy you can branch on (`2` target-not-found, `3` element-not-found, `4` ambiguous-selector, `5` timeout, `6` bad-usage, `7` attach-failed).
- Per-monitor DPI aware, so coordinates and screenshots are correct on scaled displays.
- Opt-in invocation logging via `sim config --debug-log on`; off by default, and nothing is sent anywhere.
