---
title: Quick start
order: 1
---

1. **Download** `sim.exe` onto the workstation running the Simphony client (it needs the .NET 10 Desktop Runtime) and put it on your PATH. It drives the client that is already running on that desktop, so it has to live on the same machine.
2. **Orient** — one call tells you what you are attached to and where you are in the flow:
   ```
   sim describe
   ```
   It reports the client version, workstation number, display scaling, and whether the screen is a PIN login, a direct sign-in, a signed-in Ops screen, or a modal.
3. **See what's on screen:**
   ```
   sim tree --visible --depth 4          # the UI element tree as JSON
   sim find --name Cash --match contains # every match, each with its --nth
   ```
4. **Press something:**
   ```
   sim click --name "Cash" --type Button --dry-run   # preview the target
   sim click --name "Cash" --type Button             # actually press it
   ```
5. **Confirm it worked** — read an element back, or capture the window:
   ```
   sim screenshot --out check.png
   ```
6. **Recycle the client** (e.g. to reload an Extension App) — this waits for the UI to come back, it doesn't just sleep:
   ```
   sim restart
   ```

**Check your build:** `sim version` (offline) or `sim version --check` to see whether a newer one has been published.

Run `sim --help` for the full command surface and `sim <command> --help` for any one of them: every command documents its inputs, the shared selector grammar, and its blast radius (`[read-only]` vs `[DESTRUCTIVE]`).

**Careful:** `click`, `set`, `start`, `stop` and `restart` act on a **live POS client**. `click` and `set` refuse an ambiguous selector rather than pressing an arbitrary match, and `--dry-run` shows you the target first.

**Feedback:** SimCLI comes from Muneris — [tools.muneris.cloud](https://tools.muneris.cloud/#sim-cli). Send suggestions or problems to **support@muneris.dk** with the command, the JSON envelope, and the exit code.
