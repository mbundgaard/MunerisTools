---
title: Changelog
order: 100
---

## v1 — 2026-07-20
- Initial release.
- Auth: OAuth2 authorization-code + PKCE `login` / `refresh` / `status` / `show` / `env` / `config`; password never stored; rotated refresh token always saved; known Oracle multitenant environment presets.
- Reads (raw JSON body out): `location` / `rvc` / `org` (list + get), `tender` / `tax` / `service-charge` / `discount` / `barcode` list, `menu` list/get/unavailable, `employee get`; `endpoints` lists the catalog.
- Checks: full lifecycle — `calculate`, `new`, `add`, `get` (+`--printed`), `list`, `delete`; `connection status` preflight; `check example` teaches the request body.
- Cloud STS by default; `--local-sts-ip <ip>` sends a single call to an on-prem STS.
