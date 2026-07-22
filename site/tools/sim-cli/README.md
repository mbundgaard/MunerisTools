---
title: Documentation
order: 2
---

## Overview
**SimCLI** (`sim`) drives the **Oracle Simphony client** (`ServiceHost.exe`) from a terminal. It works against the client's live **UI element tree** over Windows UI Automation — not screenshots and not screen coordinates — so it addresses controls by what they *are*, and automation keeps working when the layout, the language, or the button captions change.

With it you can log in, ring up items, press any key on any screen, read values back, capture screenshots, and stop/start/restart the client. A single `sim.exe`, modelled on `gh`/`az`: grouped commands, machine-readable JSON on stdout, and a complete `--help` everywhere.

`sim` runs **on the workstation** and attaches to the client already running on that desktop. It is built 64-bit and drives the 32-bit Simphony client across the bitness boundary — no matching build, no elevation.

## Commands

| Command | Blast radius | What it does |
|---|---|---|
| `sim describe` | read-only | One-shot orientation: client version, workstation number, processes, display scaling, and what screen you're on |
| `sim status` | read-only | The ServiceHost processes and which one is the drivable client |
| `sim tree` | read-only | The UI element tree as nested JSON, with bounding rectangles |
| `sim read` | read-only | ONE element: its value, what actions it supports, whether it's enabled, where it is |
| `sim find` | read-only | ALL elements matching a selector, each with its `--nth` |
| `sim wait` | read-only | Block until an element appears (or disappears) — the gate before the next step |
| `sim click` | **destructive** | Press one element (`--dry-run` previews the target without acting) |
| `sim set` | **destructive** | Set an element's value |
| `sim screenshot` | read-only | Capture the window, or a single element, to a PNG |
| `sim start` / `stop` / `restart` | **destructive** | Client lifecycle; `restart` is the recycle primitive |
| `sim config` | local | Show or change persisted settings |
| `sim version` | read-only | Which build this is; `--check` compares it against the latest published one |

## Addressing controls
One selector grammar, shared by every command that touches an element. Predicates combine and must all hold:

```
--id / --name / --type / --class <value>    what to match
--match exact|contains                       (default: exact)
--nth N                                      pick the Nth of several matches
--include-offscreen                          include hidden elements (default: visible only)
```

Simphony's controls carry semantic automation ids (a menu item is identified by its **EMC object number**, a tender by its media number), so you can address a button either by its **caption** — portable across installations — or by its **object number**, which survives relabeling and translation:

```
sim click --name "Cheeseburger" --type Button
sim click --id "MenuItem.1001001" --match contains
```

Those ids are **not unique** — the same id can appear on several buttons on one screen, and screens carry hidden duplicate control sets. That is why matching is visible-only by default, why `--nth` exists, and why `sim find` lists every match with the exact `--nth` to pick it.

## Output contract
- **stdout is pure JSON**, one envelope shape for every command; diagnostics go to stderr.
- Success: `{ "ok": true, "command": "...", "data": { … } }`
- Failure: `{ "ok": false, "command": "...", "error": { "code", "message", "hint", "details" } }`
- Exit codes are a contract you can branch on: `0` success · `1` general · `2` target-not-found · `3` element-not-found · `4` ambiguous-selector · `5` timeout · `6` bad-usage · `7` attach-failed.

## Gate on state, never on a sleep
The usual cause of flaky POS automation is a fixed `sleep` that is sometimes too short. `sim` doesn't have one: `sim wait` blocks until an element actually appears (or, with `--gone`, until it goes away), and `sim restart` returns only when the client's UI is genuinely back — not when the process exists.

```
sim wait --name Ok --type Button --timeout 5000 && sim click --name Ok --type Button
```

## A worked example — sign in, ring an item, take payment
A complete round trip. Nothing here is hard-coded to one property: every key is **discovered**
first, which is what makes the same script work on the next installation.

```sh
# 1. Where am I? Which screen is up?
sim describe
#    -> "screen": { "state": "login-pin", "loginType": "pin" }

# 2. Sign in. This property uses a PIN pad, so discover the digit keys rather than
#    assuming their ids, then find whatever the sign-in key is called here.
sim find --id AsciiData --match contains        # the keypad: one match per digit
sim find --id SignIn    --match contains        # the sign-in key

sim click --id "micros.generated.AsciiData.0.0.2."   # ... one call per digit
sim click --id "micros.generated.SignInRvcIndex.0.1.."

# 3. Ring an item. Tiles are a Button plus a same-caption Text label, so --type
#    Button is what separates them.
sim click --name "Cheeseburger" --type Button

# 4. Pay. Tenders do not exist in the tree until the payment screen is open —
#    discover them after pressing Pay, not before.
sim click --name "Pay" --type Button
sim click --name "Eat In" --type Button          # some properties prompt for an order type
sim find  --id Payment --match contains          # what can this property take?
sim click --name "Cash" --type Button

# 5. Paying an exact balance pops a "Change Due" modal. Gate on it, then dismiss it.
sim wait  --name Ok --type Button --timeout 5000
sim click --name Ok --type Button

# 6. Confirm with your own eyes.
sim describe                                     # "state": "signed-in", modalOpen false
sim screenshot --out settled.png
```

The pattern to copy is **discover → act → verify**: `find` to learn the ids on *this* property,
`click`/`set` to act, then `describe`, `read` or `screenshot` to confirm the effect before the
next step. Never assume an id from another installation — object numbers and even the sign-in
key differ per property.

## Which build am I on?
`sim version` reads the version out of the exe and prints it as JSON (`v1`, plus the full assembly version and the commit) — **no network**, so it works offline and on a locked-down POS network. Add `--check` to compare against the latest published build:

```
sim version              # local only
sim version --check      # adds latest, upToDate and the download URL
```
`--check` is the **only** call SimCLI makes to Muneris, and only to compare build numbers. If it can't reach the feed it still reports your local version rather than failing.

## Drive it with an AI agent
SimCLI is agent-first — the primary consumer is an AI coding agent, and the design follows from that:

- **One JSON schema** everywhere, so there is nothing to re-learn per command.
- **A branchable exit-code taxonomy**, so an agent doesn't parse English to find out what went wrong.
- **It never acts on a guess.** An ambiguous selector is a hard error that returns the full candidate list — each with the exact `--nth` that would select it — so the agent corrects itself in one turn instead of pressing the wrong key.
- **Complete `--help`** on every command, including its blast radius, so an agent can discover the whole surface unaided.

The intended loop: recycle the client to reload an Extension App → drive Ops → read or screenshot to confirm what happened.

## Installation-specific by design
Simphony configurations differ, and `sim` deliberately hard-codes none of it. Sign-in is the clearest case: some properties use a PIN keypad, others a single direct sign-in key. `sim describe` tells you which one is in front of you, and `sim find` discovers the keys — so the same scripts and the same agent work across properties.

## Troubleshooting
Every failure is a JSON envelope with a `code` and an exit code, so you can branch on it without
reading English. The common ones:

**`ambiguous-selector` (exit 4) — "N elements matched …"**
Several controls matched and `sim` refuses to guess. This is common and expected: Simphony reuses
automation ids, and one id can sit on several unrelated buttons on the same screen (a shared
`SmartKey` id may cover "Pay", "Total" and "Change to Take Out" at once). The error carries a
`candidates` list, each with the exact `--nth` that selects it. Fix by adding a predicate
(`--type Button`), selecting by `--name` instead of `--id`, or passing the `--nth` from the list.

**`element-not-found` (exit 3) — "no element matched …"**
Usually one of three things:
- **It isn't on screen yet.** Many controls only exist after a prior step — tenders, for example,
  are absent from the tree until the payment screen is open. Do the step, then look again.
- **The match is too strict.** Ids carry trailing parameters (`…MenuItem.1001001.0..`), so an
  exact match on the bare id fails. Use `--match contains`.
- **It's hidden.** Matching is visible-only by default. `--include-offscreen` will find controls
  in hidden duplicate control sets — useful for diagnosis, but think twice before clicking one.

When in doubt, `sim find --name <part> --match contains` lists everything that matches, and
`sim tree --visible --depth 4` shows what is actually on screen.

**`target-not-found` (exit 2) — "no drivable Simphony client UI found"**
`sim status` will show why. Either no client is running (`sim start`), or the only process found is
the background Windows service — `sim` deliberately never drives the `-service` instance. Remember
`sim` must run **on the workstation itself**, in the logged-in desktop session where the client is
displayed; it cannot reach a client on another machine.

**`timeout` (exit 5) from `wait`**
The element never appeared within `--timeout`. Confirm the selector matches at all with `sim find`
before assuming the UI is slow — a selector typo and a slow screen look identical from here.

**A modal is swallowing your clicks**
`sim describe` reports `"state": "modal"` when a dialog window is up. Dismiss it
(`sim wait --name Ok --type Button && sim click --name Ok --type Button`) before continuing.
Detection is best-effort: it catches child dialog windows, not every in-window overlay.

**Sign-in doesn't work like the last property**
Login is installation-specific — some properties present a PIN keypad, others a single key that
signs in directly. `sim describe` reports which (`login-pin` vs `login-direct`). Never port a PIN
sequence between properties.

**A screenshot is blank, cropped oddly, or shows the wrong window**
`sim` foregrounds the client before capturing, because the grab is a screen region and anything
overlapping would otherwise bleed in — so avoid `--no-foreground` unless you know the window is
unobstructed. `sim` is per-monitor DPI aware, so element crops are correct on scaled displays.

## Feedback
SimCLI comes from **Muneris** — [tools.muneris.cloud](https://tools.muneris.cloud/#sim-cli). It's built to be driven by an AI and to grow with use, so if a verb, flag, or selector could be clearer, or is missing, say so: **support@muneris.dk**. Include the command you ran, the JSON envelope it returned, and the exit code.
