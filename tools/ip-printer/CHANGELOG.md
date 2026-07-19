# Muneris IP Printer — Changelog

Release history for Muneris IP Printer (the portable `MunerisIpPrinter.exe`). Versions are CalVer (`yyyy.M.d.build`); the 1.0.x releases predate the CalVer switch. Newest first.

## v2026.7.14.28: 2026-07-14
*Latest commit: `aa0a713`*

**Fixes**
- Double-height text (`GS !` / `ESC !`) now scales width and height independently — a double-height-only line is no longer drawn double-width, so a full 40-character line no longer wraps onto two rows. Command parsing was already correct; only the rendering was fixed.

## v2026.7.5.27: 2026-07-05
*Latest commit: `4a34f33`*

**Features**
- Local HTTP API on port 9101 for AI-driven receipt design: a self-describing `GET /` guide, `GET /latest?printer=N` (PNG), `GET /latest.txt` / `GET /latest.hex`, `POST /clear`, and `POST /printers/add|rename|remove`, plus a **Copy AI prompt** menu item that seeds an agent with the API URL.
- Per-receipt **copy as raw hex bytes** button — the exact received stream as space-separated hex.
- New **Default code page** setting, used when the print data carries no `ESC t` (an `ESC t` in the stream still overrides it). Expanded `ESC t` support including the SRP-S300 Cyrillic trio (866/1251/855) and the Windows Central-European/Greek/Turkish pages (1250/1253/1254), on an overlap-free table.

**Changes**
- Settings dialog redesigned with a left navigation (Printers / General) and a fixed size that no longer grows as printers are added; default window size tuned; dark-themed dropdown.

## v2026.7.3.22: 2026-07-03
*Latest commit: `a301a07`*

**Fixes**
- Full 40-character lines no longer wrap their last ~2 characters — the receipt width now compensates for the host RichTextBox's forced page padding so the text area equals a full 40-column line.

## v2026.7.1.21: 2026-07-01
*Latest commit: `23bf7b9`*

**Changes**
- Raster images (icons, separator rules, stored logos, QR codes) now render at 203 DPI (typical Epson thermal head) instead of 96 DPI, so a full-width raster settles at the same on-screen size as the 40-column text paper.

## v2026.7.1.20: 2026-07-01
*Latest commit: `94dca85`*

**Features**
- Full ESC/POS on-screen rendering — bold, alignment (left/centre/right), size (`GS !` magnification), underline, reverse (`GS B`), code-page switches (`ESC t`), and `ESC @` init all reflected in the output.
- Inline raster bitmaps — `GS v 0` payloads decode to bitmaps and embed at the paragraph's current alignment (fixes order-type icons and full-width separator rules).
- Stored logos (`GS *` upload + `GS /` reference) now render inline in the receipt.
- QR codes — a hand-rolled ISO/IEC 18004 encoder (Reed-Solomon, versions 1–40, byte mode, ECC L/M/Q/H) renders `GS ( k` command chains to a scannable bitmap in-line.
- `DLE SI/SO` transparent-print markers and `FS &`/`FS .` multi-byte toggles are walked cleanly so the parser never desyncs.

## v2026.6.17.19: 2026-06-17
*Latest commit: `8cccfc8`*

**Fixes**
- Receipt copy buttons are no longer unclickable — the hover-revealed copy strip previously vanished when moving the cursor from the paper toward the buttons (a WPF hit-test gap). The wrapper is now fully hit-testable so the hover stays stable.

## v2026.5.31.18: 2026-05-31
*Latest commit: `bbf867b`*

**Features**
- Hamburger menu gains a **Copy share link** entry that puts the repo URL on the clipboard.

## v2026.5.31.17: 2026-05-31
*Latest commit: `a861c3e`*

**Features**
- Receipt arrival animation — new receipts slide in from above with a quick fade.
- Per-printer heartbeat dot — a small accent-blue dot next to each printer name pulses on every accepted TCP connection, so you can see the POS talking to a printer even before receipts arrive.

## v2026.5.30.16: 2026-05-30
*Latest commit: `afa53f6`*

**Changes**
- **Clear all receipts** now also drops the sidebar selection, so the view comes up empty after a wipe instead of leaving the previously-active row highlighted.

## v2026.5.30.15: 2026-05-30
*Latest commit: `adeeeeb`*

**Changes**
- Quieter unviewed-receipt indicator — the printer name is no longer restyled (bold + brighter) when receipts arrive on a non-selected printer; the count badge is enough signal on its own.

## v2026.5.30.14: 2026-05-30
*Latest commit: `a820788`*

**Fixes**
- **Clear all receipts** now also resets the sidebar unviewed-count badges, which previously stayed pinned to their old values.

## v2026.5.30.13: 2026-05-30
*Latest commit: `b199372`*

**Changes**
- Removed the redundant Close button from the About dialog — the title-bar X and Esc both close it.

## v2026.5.30.12: 2026-05-30
*Latest commit: `d4c9270`*

**Changes**
- Replaced the remaining native Windows MessageBox calls with the dark-themed ConfirmDialog (clear-all confirm, Settings validation, save-failure error, and port-in-use error).

## v2026.5.30.11: 2026-05-30
*Latest commit: `904540c`*

**Changes**
- Sidebar update label simplified to **Update ready!** (the "· restart" was redundant once startup-time auto-apply landed).
- About dialog now shows a contact line — *Comments and suggestions: support@muneris.dk*.

## v2026.5.30.9: 2026-05-30
*Latest commit: `73cc1b3`*

**Features**
- Startup-time auto-apply — if a previous session downloaded a new version, the next launch detects the staged file in `%TEMP%` and swaps it in **before binding the TCP port**, no click needed. The mid-session **Update ready!** link still works for immediate upgrades.

## v2026.5.30.8: 2026-05-30
*Latest commit: `659193f`*

**Changes**
- The release asset is now always named `MunerisIpPrinter.exe` (no version in the filename), so shortcuts keep working across upgrades. The version stays embedded in the assembly and is shown in About / the sidebar.

## v2026.5.30.6: 2026-05-30
*Latest commit: `e55a5a9`*

**Features**
- Hamburger menu adds **Check for updates**, which runs the same flow as the periodic poll and reports the no-update case.

**Changes**
- The restart prompt after saving settings is now a dark-themed dialog instead of the native Windows MessageBox.
- `MunerisIpPrinter.bin` (settings + logos + history) moved to `%LOCALAPPDATA%\MunerisIpPrinter\` so the .exe folder is a single portable file. Existing installs migrate automatically on first run.

## v2026.5.30.5: 2026-05-30
*Latest commit: `5e4c449`*

**Changes**
- Switched the versioning scheme from semver to date-based CalVer (`yyyy.M.d.build`). Tags, asset filenames, and the in-app version label all use the new format; existing 1.x installs pick this up automatically since `1.0.4 < 2026.5.30.5`.

## v1.0.4: 2026-05-30
*Latest commit: `410825c`*

**Features**
- Periodic update poll — the app re-checks for new releases every 4 hours while running, so a long-running session discovers a new version without a restart.

## v1.0.3: 2026-05-30
*Latest commit: `2cee2d6`*

**Changes**
- Removed the redundant "Restart now?" confirm when applying an update — clicking the sidebar link now installs and restarts immediately.

## v1.0.2: 2026-05-30
*Latest commit: `4ad06f0`*

**Fixes**
- No more Windows Firewall prompt — the app now binds one socket per configured `127.0.0.X:9100` address instead of `0.0.0.0:9100`, so the firewall never sees it as a network server.
- Fixed "port already in use" on restart — the settings-save and auto-update restarts now retry the listener bind for ~4 seconds while the prior instance releases the socket.

## v1.0.1: 2026-05-30
*Latest commit: `fb48415`*

**Features**
- In-app auto-update flow — a newer release is streamed to `%TEMP%` in the background, the sidebar version link flips to a restart nudge when the download lands, and one click swaps in the new `.exe` and relaunches (no installer, no admin prompt).

## v1.0.0: 2026-05-30
*Latest commit: `243b954`*

**Features**
- First public release — a Windows utility that stands in for up to fifteen ESC/POS receipt printers on loopback IPs (`127.0.0.1:9100`, `127.0.0.2:9100`, …), rendering each receipt on screen.
- Live per-printer stack of receipts (newest on top) with hover-revealed copy-as-text / copy-as-image buttons; inline per-printer rename persisted across restarts; a new-receipt badge on the sidebar; a resizable sidebar with remembered window position and width.
- `GET http://localhost:9101/screenshot` returns a PNG of the current window.

**Packaging**
- A single self-contained ~960 KB `.exe` on .NET Framework 4.6.2 (in-box on Windows 10 / Server 2016+) — no installer, no prerequisites.
