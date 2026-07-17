# Changelog - Muneris IP Printer

All notable changes to Muneris IP Printer, newest first. Versions are CalVer (`yyyy.M.d.build`).

## 2026.7.14.28
_Released 2026-07-14_

### Fix: double-height text no longer renders double-width

`GS !` and `ESC !` magnify **width and height independently**, but the renderer collapsed both axes into a single font scale. A double-height-only line (e.g. `GS ! 0x01`) was drawn 2× wide as well, so a full 40-character line wrapped onto two rows.

Now each axis scales on its own:

- `GS ! 0x01` (w×1, h×2) — 40 chars on **one** row, full width, 2× tall
- `GS ! 0x10` (w×2, h×1) — 2× wide glyphs, normal height
- `GS ! 0x11` (w×2, h×2) — 2× both
- `ESC ! 0x10` (double height) — same fix applies

The command *parsing* was already correct (`GS !`: high nibble = width, low nibble = height; `ESC !`: bit `0x10` = double height, bit `0x20` = double width) — only the rendering was wrong.

---

## 2026.7.5.27
_Released 2026-07-05_

Cumulative since v2026.7.3.22.

### Local HTTP API (port 9101) for AI-driven receipt design
- `GET /` — self-describing guide (endpoints, printer instances, the send/fetch loop).
- `GET /latest?printer=N` — PNG of an instance's newest receipt (paper only).
- `GET /latest.txt?printer=N` — decoded text; `GET /latest.hex?printer=N` — exact received bytes as space-separated hex.
- `POST /clear` (live) and `POST /printers/add|rename|remove` (save + restart).
- **Copy AI prompt** menu item seeds an agent with the API URL.

### Receipts
- New **copy as raw hex bytes** button (`{ }`) per receipt — exact received stream, space-separated hex.
- Fix: full 40-character lines no longer wrap their last couple of characters.

### Code pages
- New **Default code page** setting (used when print data carries no `ESC t`; an `ESC t` overrides it).
- Expanded `ESC t` support incl. the SRP-S300 Cyrillic trio (866/1251/855) and the Windows Central-European/Greek/Turkish pages (1250/1253/1254).
- Overlap-free table; the two ambiguous numbers (33/34, where Epson and BIXOLON disagree) are intentionally unmapped. Table documented in CLAUDE.md.

### Settings dialog
- Redesigned with a left navigation (Printers / General) and a fixed-size window that no longer grows when printers are added.

### Other
- Default window size tuned; dark-themed dropdown.

---

## 2026.7.3.22
_Released 2026-07-03_

Fix: full 40-character lines no longer wrap their last ~2 characters.

A hosted RichTextBox forcibly rewrites its FlowDocument's PagePadding to
{5,0,5,0} on measure, insetting the text region by 10px. The receipt width now
adds that host padding back so the text area itself equals a full 40-char line.

---

## 2026.7.1.21 — bitmaps at thermal-head DPI
_Released 2026-07-01_

Raster images (icons, separator rules, stored logos, QR codes) now render at 203 DPI (typical Epson thermal head) instead of 96 DPI. A full-width raster settles at the same on-screen size as the 40-column text paper, instead of about 2x wider.

---

## 2026.7.1.20 — full ESC/POS render + QR
_Released 2026-07-01_

Reworked the renderer to honour everything a real POS print stream emits, so a Popeyes assembly ticket (or anything using the same command vocabulary) looks like the paper output rather than a flat text dump.

**Text formatting** — bold, alignment (left/centre/right), size (`GS !` magnification), underline, reverse (`GS B`), codepage switches (`ESC t`), and `ESC @` init all reflected in the on-screen output.

**Inline raster bitmaps** — `GS v 0` payloads decode to Gray8 bitmaps and embed at the paragraph's current alignment. Fixes order-type icons and full-width separator rules.

**Stored logos** — `GS *` upload + `GS /` reference still resolve against the per-printer logo slot; they just live inline in the receipt now instead of on a separate row.

**QR codes** — hand-rolled ISO/IEC 18004 encoder (Reed-Solomon, all versions 1-40, byte mode, ECC L/M/Q/H). `GS ( k` command chains render to a scannable QR bitmap in-line.

**Wrappers** — `DLE SI/SO` transparent-print markers and `FS &/.` multi-byte toggles walked cleanly so the parser never desyncs.

Copy-as-text still uses the flat extractor so pasted receipts are pure ASCII regardless of on-screen formatting.

---

## 2026.6.17.19
_Released 2026-06-17_

Fix receipt copy buttons being unclickable: the hover-revealed copy strip vanished when moving the cursor from the paper toward the buttons (WPF hit-test gap on the transparent wrapper). The wrapper is now fully hit-testable so the hover stays stable.

---

## 2026.5.31.18 — Copy share link menu item
_Released 2026-05-31_

Hamburger menu gains a **Copy share link** entry that puts the repo URL on the clipboard. Quick demo flow: open menu, click Copy share link, paste into Teams/Meet/Slack chat.

---

## 2026.5.31.17 — arrival animation + heartbeat dot
_Released 2026-05-31_

Two small bits of UI life:

- **Receipt arrival animation** — new receipts slide in from above with a quick fade, instead of just appearing.
- **Heartbeat dot per printer** — small accent-blue dot next to each printer name pulses on every accepted TCP connection. Lets you see `the POS is talking to printer 2 but no receipts yet` at a glance, instead of staring at an apparently-idle sidebar.

---

## 2026.5.30.9 — startup-time auto-apply
_Released 2026-05-30_

If a previous session downloaded a new version, the next launch detects the staged file in `%TEMP%` and swaps it in **before binding the TCP port** — no click needed. The existing `Update ready · restart` link still works for immediate mid-session upgrades.

---

## 2026.5.30.8 — stable asset filename
_Released 2026-05-30_

Release asset is now always `MunerisIpPrinter.exe` (no version in the filename). Shortcuts pointing at the file keep working across upgrades — auto-update preserves whatever name you have it under locally. The version stays embedded in the assembly and is visible in About / sidebar.

---

## 2026.5.30.6 — check-for-updates, themed dialog, AppData store
_Released 2026-05-30_

- Hamburger menu adds **Check for updates** that triggers the same flow as the periodic poll and reports the no-update case.
- Restart prompt after saving settings is now a dark-themed dialog instead of the native Windows MessageBox.
- `MunerisIpPrinter.bin` (settings + logos + history) moved to `%LOCALAPPDATA%\MunerisIpPrinter\` so the .exe folder is a single portable file. Existing installs migrate automatically on first run.

---

## 2026.5.30.5 — CalVer transition
_Released 2026-05-30_

Switched the versioning scheme from semver to date-based (`yyyy.M.d.build`). Tags, asset filenames, and the in-app version label all use the new format. Existing 1.x installs will pick this up automatically since 1.0.4 < 2026.5.30.5.

---

## 2026.5.30.16 — clear-all deselects too
_Released 2026-05-30_

``Clear all receipts`` now also drops the sidebar selection so the side comes up empty after a wipe instead of leaving the previously-active row highlighted.

---

## 2026.5.30.15 — quieter unviewed-receipt indicator
_Released 2026-05-30_

Stopped re-styling the printer name (bold + brighter) when receipts arrive on a non-selected printer. The count badge is enough signal on its own.

---

## 2026.5.30.14 — Clear-all also resets badge counts
_Released 2026-05-30_

Fix: ``Clear all receipts`` left the unviewed-count badges on the sidebar pinned to their old values. Now resets them along with the receipts themselves.

---

## 2026.5.30.13 — drop About Close button
_Released 2026-05-30_

Removed the redundant Close button from the About dialog. Title-bar X and Esc both close it.

---

## 2026.5.30.12 — themed dialogs everywhere
_Released 2026-05-30_

Replaced the remaining native Windows MessageBox calls with the dark-themed ConfirmDialog: Clear-all confirm, Settings validation, save-failure error, and port-in-use error.

---

## 2026.5.30.11 — support email in About
_Released 2026-05-30_

Two small touches:
- Sidebar update label is now just **Update ready!** (the '· restart' was redundant once startup-time auto-apply landed).
- About dialog shows a contact line — *Comments and suggestions: support@muneris.dk*.

---

## 1.0.4 — periodic update poll
_Released 2026-05-30_

Re-checks GitHub for new releases every 4 hours while the app is running. Previously you had to restart the app to discover a new version; now a long-running session picks them up too.

---

## 1.0.3 — one-click update apply
_Released 2026-05-30_

Removed the redundant `Restart now?` confirm dialog when applying an update. The sidebar link already reads `Update ready · restart`; clicking it now installs and restarts immediately.

---

## 1.0.2 — loopback listeners, bind retry
_Released 2026-05-30_

## Muneris IP Printer v1.0.2

### What's fixed

- **No more Windows Firewall prompt.** Previously the app bound to
  `0.0.0.0:9100` which Windows treats as a network server even though
  every connection actually comes from the loopback adapter. v1.0.2
  binds one socket per configured `127.0.0.X:9100` address instead,
  so the firewall never sees us.
- **"Port already in use" on restart.** The settings-save restart and
  the auto-update restart now retry the listener bind for ~4 seconds
  if the prior instance is still releasing the socket. Race window
  closed.

### Install

Existing v1.0.1 (or v1.0.0) installations will pick this up
automatically — wait for the sidebar to flip to **Update ready · restart**
and click. Manual download below if you'd rather.

---

## 1.0.1 — auto-update lands
_Released 2026-05-30_

## Muneris IP Printer v1.0.1

Adds the in-app auto-update flow.

### What's new

- **Background download.** When v1.0.0 (or later) finds a newer release,
  it streams the matching `.exe` asset to `%TEMP%` while you keep working.
- **Sidebar nudge.** The accent-blue version link in the sidebar bottom
  flips to "Update ready · restart" once the download lands.
- **One-click apply.** Click the link, confirm, the app shuts down,
  a small helper swaps in the new `.exe`, and the new build relaunches —
  no installer, no admin prompt.

### Install

Download **`MunerisIpPrinter-1.0.1.exe`** below. Drop it next to your
existing copy (or anywhere) and run it. Or, if you're already on v1.0.0,
just wait for the sidebar link to flip and click it.

### License

MIT — see [LICENSE](https://github.com/mbundgaard/MunerisIpPrinter/blob/main/LICENSE).

---

## 1.0.0
_Released 2026-05-30_

## Muneris IP Printer v1.0.0

First public release.

A small Windows utility that stands in for up to fifteen ESC/POS receipt
printers on loopback IPs. Point your POS at `127.0.0.1:9100`,
`127.0.0.2:9100`, … and every receipt that would have hit a kitchen
printer shows up on screen instead — handy for verifying Simphony
configurations without wiring up real hardware.

### Install

Download **`MunerisIpPrinter-1.0.0.exe`** below and run it. No installer.
No prerequisites — uses the .NET Framework 4.6.2 runtime that's already
on every Windows 10 / Server 2016 (and newer) box.

The .exe is ~960 KB and self-contained, so it's happy living in a
Dropbox / OneDrive / toolkit folder and being copied into test
environments on the fly.

### Highlights

- Up to 15 logical printers on loopback IPs, all configured from
  the in-app Settings dialog
- Live stack of receipts per printer, newest on top, with hover-revealed
  copy-as-text / copy-as-image buttons
- Per-printer rename inline; persisted across restarts
- New-receipt badge on the sidebar shows printer activity at a glance
- Resizable sidebar; window position and sidebar width are remembered
- `GET http://localhost:9101/screenshot` returns a PNG of the current
  window — useful for embedding in dashboards or automation

### License

MIT — see [LICENSE](https://github.com/mbundgaard/MunerisIpPrinter/blob/main/LICENSE).

---


