---
title: Changelog
order: 100
---

## v33 — 2026-07-30
- add: **Receipts are drawn as real printer dots.** The preview is now composited on a dot canvas at the printer's own resolution, the way the thermal head builds a line — so magnification, bold, underline, reverse, logos, QR codes and raster graphics all land exactly where the printer would put them, and a line wraps where the printer wraps it.
- add: **Print to a real printer.** Put a printer's IP address under Settings ▸ General and every receipt gets a Print button that sends the exact bytes it received on to that printer. Handy for getting a captured receipt onto real paper without going back through the POS.
- add: `POST /print?printer=<#>` does the same over the local API, so an agent can print a receipt it just designed.
- chg: **Settings apply immediately.** Only adding or removing a printer still asks for a restart — each printer address binds its own socket. Code page, receipt history, logging and the physical printer address all take effect the moment you save. Renaming a printer over the API is live too.
- fix: **Bold text was far too heavy at double and quadruple width.** Emphasis was being magnified along with the character, so a 4×-wide bold line came out four times bolder than the printer prints it — letters merged and the holes in a, e and g filled in.
- chg: Text is a little lighter and less cramped, closer to what the printer lays down.
- chg: Copy-as-image now copies the receipt at half size, matching what you see on screen, instead of an image four times larger.

## v32 — 2026-07-22
- fix: **Automatic update checking was broken** and had been silently failing — the app looked for a release that no longer exists, so it never noticed new versions. It now reads the published release feed at tools.muneris.cloud. Copies older than this one cannot fix themselves; replace them once by hand and they will keep up from then on.
- chg: The update link and the About dialog now open the tool's page at tools.muneris.cloud, which carries the download and the changelog. "Copy share link" copies that page too, instead of a source-code link.

## v31 — 2026-07-22
- fix: Text with em-dashes, arrows and other non-ASCII characters displayed as mojibake (`â€"`). The compiler was reading our BOM-less UTF-8 sources as Windows-1252, so the corruption was baked into the app at build time — 21 strings were affected.
- fix: Published release notes had the same corruption, for the same reason in the publish step.

## v30 — 2026-07-20
- add: Collapsible printer sidebar — a chevron in the header folds the list down to a thin rail (hamburger menu still reachable); the fold state is remembered across restarts.
- chg: Sidebar shows the short release number (e.g. `v30`) instead of the full CalVer version.

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
