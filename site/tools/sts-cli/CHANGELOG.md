---
title: Changelog
order: 100
---

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
