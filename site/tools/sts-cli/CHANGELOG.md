---
title: Changelog
order: 100
---

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
