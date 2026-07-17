# Muneris IP Printer

A small Windows utility that stands in for up to **fifteen ESC/POS receipt printers**
on loopback IP addresses. Point your POS at `127.0.0.1:9100`, `127.0.0.2:9100`, … and
every receipt that would have hit a kitchen or counter printer shows up **on screen**
instead — handy for verifying POS configurations (e.g. Oracle Simphony) without wiring
up real hardware.

- **Portable.** A single ~1 MB `.exe`. No installer, no admin rights.
- **No prerequisites.** Uses .NET Framework 4.6.2, in-box on every Windows 10 /
  Server 2016 and newer.
- **Self-updating.** Checks for new releases on startup and every few hours, then
  updates itself in place with one click.

## Download & install

⬇ **[Latest release](https://github.com/mbundgaard/muneris-tools/releases?q=ip-printer&expanded=true)** — download `MunerisIpPrinter.exe` from the newest `ip-printer/v…` release.

Drop the `.exe` anywhere (a toolkit folder, OneDrive, the desktop) and run it. Because
it's a single self-contained file it's happy being copied between test machines. The
filename stays `MunerisIpPrinter.exe` across versions, so shortcuts keep working through
auto-updates.

## Using it

1. **Configure printers.** Open the hamburger menu → **Settings**. Add up to 15 logical
   printers; each maps to a loopback address `127.0.0.1`, `127.0.0.2`, … Rename them to
   match your POS layout (Kitchen, Bar, Expo, …).
2. **Point your POS at them.** Set each POS printer's IP to the matching `127.0.0.X` on
   port **9100**. Each address has its own listener, so routing is automatic and Windows
   Firewall stays quiet (loopback-only listeners never trigger the "allow access" prompt).
3. **Watch receipts arrive.** Each printer shows a live stack of receipts, newest on top,
   rendered as they'd print — bold, alignment, sizing, barcodes/QR, logos, and code-page
   text. Hover a receipt for copy buttons: **copy as text**, **copy as image**, and
   **copy as raw hex bytes** (the exact received stream).

### Settings that matter

- **Default code page** — used when the print stream carries no `ESC t` selector. An
  `ESC t` in the data always overrides it. Broad `ESC t` support is built in (USA/Multilingual,
  Cyrillic 866/1251/855, Central-European/Greek/Turkish Windows pages, and more).
- Settings changes apply on a quick automatic restart.

## Local HTTP API (port 9101)

A loopback-only HTTP API for driving receipt-design iteration (including from an AI agent):

| Endpoint | Purpose |
|----------|---------|
| `GET /` | Self-describing plaintext guide (lists live printers + the send/fetch loop) |
| `GET /printers` | List configured printers |
| `GET /latest?printer=N` | PNG of printer N's newest receipt (paper only) |
| `GET /latest.txt?printer=N` | Decoded receipt text |
| `GET /latest.hex?printer=N` | Exact received bytes, space-separated hex |
| `GET /screenshot` | PNG of the whole window |
| `POST /clear` | Clear all receipts (or `?printer=N` for one) |
| `POST /printers/add\|rename\|remove` | Manage printers (saves + restarts) |

`printer=N` is the loopback last octet (1-based). The hamburger menu's **Copy AI prompt**
item copies a seed prompt pointing an agent at `http://127.0.0.1:9101/` to self-discover
the rest.

## Updating

The app checks this repo's Releases feed on startup and every 4 hours. When a newer
`ip-printer/v…` release exists it downloads in the background; the sidebar then shows
**Update ready!** — click to install and relaunch (or it applies automatically on the
next launch). No installer, no admin prompt.

## Versions

CalVer — `yyyy.M.d.build` (e.g. `2026.7.14.28`). See the full [Changelog](CHANGELOG.md).

## License

MIT.
