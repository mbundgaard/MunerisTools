---
title: Changelog
order: 100
---

## v9 — 2026-08-28
- **New: `--pickup-time <iso-time>` on `sts check new` and `sts check add`** — writes Oracle's `header.pickupTime` field for autofire/pickup scheduling. The request body may still carry `header.pickupTime`; the flag wins when supplied. Help/docs call out the POS requirement: the order type needs lead time configured and the pickup time must be far enough in the future.
- `sts check example`, the quick start, and the published docs now show the pickup-time/autofire path alongside service-total send/fire, charged tips, and idempotent retries.
- Project agent guidance moved from Claude-specific `CLAUDE.md` to Pi/Herdr `AGENTS.md`.

## v8 — 2026-08-20
- **New: `--idempotency-id <id>` on `sts check new` and `sts check add`** — makes a check write safe to retry. Reuse **one id for every retry of the same order**; StsCLI puts it on the request and asks STS for duplicate detection (`Simphony-Features: detect-duplicate-request`). A retry then returns the **existing** check instead of creating a second one, and says so on stderr. Accepts 32 hex characters or a UUID with dashes.
- **Why it matters:** a check POST is *not* safe to blind-retry. A timeout is not proof the check wasn't created — the POS may have committed it and only the reply got lost. Without an id, a retry charges the customer twice. Verified: the same body posted twice with one id produced a single check; without the flag it produced two paid checks.
- **Nothing changes if you don't use it.** Without the flag StsCLI still generates a fresh id per post and sends no feature header, exactly as before.
- Duplicate detection **spans endpoints** — a check posted to the cloud STS is recognised as a duplicate by the on-prem STS and vice versa. So failing over to the other endpoint after an uncertain call is safe *with* an id, and duplicates without one.
- When reconciling instead, note **`idempotencyId` is not returned by `sts check list`** — correlate on the check name or the tender's reference text.
- `sts check example` now carries the retry rule alongside the body format.

## v7 — 2026-08-19
- **New: `--charged-tip <amount>` on `sts check new` and `sts check add`** — post a card tip. The tip rides on the tender (`chargedTipTotal`), and Simphony applies it through the service charge **linked to that tender**; you no longer hand-write the field into `--body`.
- **The tender's `total` must be the FULL amount charged, tip included** (97.00 item + 20.00 tip = `total: 117`). The CLI never computes it — only the caller knows what the terminal actually took. If `total` only covers the items, the tip posts but the check stays **open owing it**, and the command now says so instead of reporting success.
- **A tip the POS silently drops is now an error.** When a tender is not configured for charged tips, STS returns `200 OK`, zeroes `chargedTipTotal` and pays the tip back out as change — the customer is charged the item total and nothing in the response says so. Every tipped write is now compared against the response: a dropped tip, a tip returned as change, or a check left open owing the tip exits `11 api-error` with the reason, and the check itself in `error.details`.
- The check is verified for **hand-written bodies too**, not just uses of the flag — if your `--body` carries `chargedTipTotal`, it is checked.
- `sts check example` now explains the charged tip: what `total` must be, that the tip is applied via the tender-linked service charge, and that this is not the same as posting a tip into `serviceCharges[]`.
- Not on `sts check calculate` — that endpoint ignores tenders entirely, so a tip there would do nothing.

## v6 — 2026-08-05
- **Security fix — update from v5.** When an account's password had expired, the identity server returned a usable password-reset token in its response, and v5 printed it to stdout (and to `sts-invocations.jsonl` with `--debug-log on`). Secrets in an auth response are now replaced with `[redacted]` before anything is printed. If you saw such an error on v5, treat that account's reset token as exposed.
- An **expired password** is now reported as what it is — "the credentials were accepted but the account's password has EXPIRED", with the portal URL to change it — instead of the misleading "usually a wrong username/password".
- `sts auth login --help` now says that failures carry the identity server's own reason, and that an expired password is not a wrong-password error.

## v5 — 2026-07-29
- `auth login` / `auth refresh` now return **the identity server's own error message** instead of a generic one. A wrong password used to surface as `signin did not return a redirect (nextOp=null)`; it now reads `signin failed (HTTP 401): Invalid credentials. [AUTHENTICATION_INVALID]`.
- The full IDM response body is passed through verbatim in `error.details` (`{leg, status, code, body}`) — the same contract the read commands already use, so a caller can branch on it. Response bodies only; your password is never included.
- Hints are now specific: invalid credentials points at the account, an unrecognised client id points at `sts auth show` and warns that a client id's trailing `=` padding is significant (stripping it makes a valid id fail).
- Code cleanup: removed the built-in first-run configuration. A fresh `sts.exe` now ships with nothing preconfigured — no organization, user, or client id.
- **Upgrading changes nothing** — your existing `StsCli.json` is untouched. On a **fresh install**, run `sts auth config --env <env> --org <ORG> --username <user> --client-id <id>` first; until then commands return `not-configured` (exit 7) and name the fields still missing.
- Help text, `sts endpoints` examples and the docs now use placeholders (`<loc>`, `<rvc>`, `<emp>`, `<type>`) instead of values from one specific property, so a copy-pasted example no longer targets a property you don't have.

## v4 — 2026-07-22
- fix: `sts version --check` reported "could not reach the feed" — it read a file that no longer exists. It now reads the tool's published `release.json`, the documented update feed.
- `--check` also reports the release date and download size, which come from that file.

## v3 — 2026-07-22
- New `sts version`: reports this build as JSON (`v3`, the full assembly version, and the commit), read from the exe — no network, so it works offline and on a locked-down POS network.
- `sts version --check` compares against the published build and returns `latest`, `upToDate` and the download URL. It is the only call StsCLI makes to Muneris, it is opt-in, and if the feed is unreachable it still reports your local version instead of failing.
- Root `--help` now says where the tool comes from (tools.muneris.cloud) and where to send feedback (support@muneris.dk), and is explicit that nothing is phoned home unless you ask.
- Fixed: release notes and CLI text mangled non-ASCII (em-dashes appearing as `â€"`). The compiler was reading our BOM-less UTF-8 sources as CP1252.

## v2 — 2026-07-21
- `check list` gains the STS server-side filters: `--check-number` (one or more, comma-separated), `--since-time`, `--order-type`, `--employee`, `--table`. Finding a closed check by its check number no longer needs the `checkRef`.
- `--since-time` accepts a bare date (`2026-07-21` → `2026-07-21T00:00Z`).
- Note: with `--include-closed`, STS reads every closed check in the window, so one unreadable check fails the whole call (`400 … MenuItemPriceNotFound`). Narrowing `--since-time` is the way past it — the check-number filter is applied *after* the details are read, so it does not help on its own.

## v1 — 2026-07-20
- Initial release.
- Auth: OAuth2 authorization-code + PKCE `login` / `refresh` / `status` / `show` / `env` / `config`; password never stored; rotated refresh token always saved; known Oracle multitenant environment presets.
- Reads (raw JSON body out): `location` / `rvc` / `org` (list + get), `tender` / `tax` / `service-charge` / `discount` / `barcode` list, `menu` list/get/unavailable, `employee get`; `endpoints` lists the catalog.
- Checks: full lifecycle — `calculate`, `new`, `add`, `get` (+`--printed`), `list`, `delete`; `connection status` preflight; `check example` teaches the request body.
- Cloud STS by default; `--local-sts-ip <ip>` sends a single call to an on-prem STS.
