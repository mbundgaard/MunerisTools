---
title: Changelog
order: 100
---

## v29 — 2026-07-19
- chg: Maintenance build — no functional changes; validates the automated release pipeline.

## v28 — 2026-07-14
- fix: Double-height text now scales width and height independently — a double-height-only line is no longer drawn double-width, so a full 40-character line no longer wraps onto two rows.

## v27 — 2026-07-05
- add: Local HTTP API (port 9101) for AI-driven receipt design — self-describing `GET /`, `GET /latest[.txt|.hex]`, `POST /clear`, and a "Copy AI prompt" menu item.
- add: Copy-as-raw-hex-bytes button per receipt.
- add: Default code page setting, plus expanded `ESC t` support (Cyrillic 866/1251/855, Windows Central-European/Greek/Turkish).
- chg: Redesigned Settings dialog with left navigation and a fixed size.
- fix: Full 40-character lines no longer wrap their last characters.

## v21 — 2026-07-01
- chg: Raster images render at 203 DPI (thermal-head), so a full-width raster matches the 40-column text width.

## v20 — 2026-07-01
- add: Full ESC/POS on-screen rendering — bold, alignment, size, underline, reverse, and code-page switches.
- add: Inline raster bitmaps and stored logos.
- add: QR codes via a hand-rolled ISO/IEC 18004 encoder.

## v19 — 2026-06-17
- fix: Receipt copy buttons no longer become unclickable (a hover hit-test gap).

## v18 — 2026-05-31
- add: "Copy share link" menu item.

## v17 — 2026-05-31
- add: Receipt arrival animation.
- add: Per-printer heartbeat dot that pulses on each accepted connection.

## v16 — 2026-05-30
- chg: Clear-all now also deselects the sidebar.

## v15 — 2026-05-30
- chg: Quieter unviewed-receipt indicator — the count badge is enough.

## v14 — 2026-05-30
- fix: Clear-all now resets the unviewed-count badges too.

## v13 — 2026-05-30
- chg: Dropped the redundant Close button from the About dialog.

## v12 — 2026-05-30
- chg: Replaced the remaining native message boxes with the dark-themed dialog.

## v11 — 2026-05-30
- add: Support email shown in the About dialog.
- chg: Sidebar update label simplified to "Update ready!".

## v9 — 2026-05-30
- add: Startup-time auto-apply — a staged update is swapped in on next launch, before the port is bound.

## v8 — 2026-05-30
- chg: Release asset always named `MunerisIpPrinter.exe` (stable filename) so shortcuts survive updates.

## v6 — 2026-05-30
- add: "Check for updates" menu item.
- chg: Settings moved to `%LOCALAPPDATA%` (auto-migrates on first run).

## v5 — 2026-05-30
- chg: Switched to CalVer versioning (`yyyy.M.d.build`).

## v4 — 2026-05-30
- add: Periodic update poll every 4 hours.

## v3 — 2026-05-30
- chg: One-click update apply (removed the redundant confirm).

## v2 — 2026-05-30
- fix: No more Windows Firewall prompt — binds one socket per `127.0.0.X` instead of `0.0.0.0`.
- fix: "Port already in use" on restart, via a bind retry.

## v1 — 2026-05-30
- add: In-app auto-update — background download plus one-click apply.

## v0 — 2026-05-30
- add: First release — up to 15 loopback printers, live receipt stack, copy as text/image.
