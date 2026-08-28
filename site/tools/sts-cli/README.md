---
title: Documentation
order: 2
---

## Overview
**StsCLI** (`sts`) is a command-line client for **Oracle Simphony Transaction Services (STS) Gen2** — the REST API behind Simphony ordering. Authenticate once, then read a property's configuration (locations, revenue centers, menus, tenders, discounts, taxes, service charges) and drive the full check lifecycle — **price → post → add a round → void** — from a terminal, a script, or an AI coding agent.

A single self-contained `sts.exe`, modelled on `gh`/`az`: grouped noun-verb commands, machine-readable JSON on stdout, and a complete `--help` on every command.

## Using it
```
sts auth env                                   # pick your Oracle environment
sts auth config --env mte4 --org <ORG> --username <user> --client-id <id>
sts auth login --password <pw>                 # OAuth2 authorization-code + PKCE

sts location list                              # what can this account reach?
sts rvc list --location <loc>
sts menu get --location <loc> --rvc <rvc>      # config reads
sts tender list --location <loc> --rvc <rvc>

sts check calculate --location <loc> --rvc <rvc> --employee <emp> --order-type <type> --body order.json
sts check new       --location <loc> --rvc <rvc> --employee <emp> --order-type <type> --body order.json
sts check new       --location <loc> --rvc <rvc> --employee <emp> --order-type <type> --body order.json --charged-tip 20
sts check new       --location <loc> --rvc <rvc> --employee <emp> --order-type <type> --body order.json --idempotency-id <id>
sts check new       --location <loc> --rvc <rvc> --employee <emp> --order-type <type> --body order.json --pickup-time 2026-08-28T12:30:00Z
```
Every command emits **one JSON envelope on stdout**; human/diagnostic logs go to stderr. Config and tokens live in `StsCli.json` next to the exe — the **password is never stored** (it's used once at login; everything after renews via `sts auth refresh`). **Nothing ships preconfigured**: a fresh `sts.exe` has no organization, user, or client id, so `sts auth config` is the required first step.

## Autofire / pickup time
`--pickup-time <iso-time>` on `check new` / `check add` writes Oracle's `header.pickupTime` field, which Simphony uses for autofire timing. You may also put `pickupTime` directly in the body; the flag wins when supplied. The order type must have lead time configured, and the pickup time must be far enough in the future or the POS rejects the order.

## Card tips
`--charged-tip <amount>` on `check new` / `check add` posts a **charged tip**: it rides on the tender, and Simphony applies it through the service charge linked to that tender. The tender's `total` in your body must be the **full amount charged, tip included** (97.00 item + 20.00 tip = `total: 117`) — the CLI never computes it, because only the caller knows what the terminal took.

A dropped tip is caught rather than reported as success. If a tender isn't configured for charged tips, STS answers `200 OK`, zeroes the tip and returns it as change — the customer pays the item total and nothing in the response says so. StsCLI compares what you sent against what came back and exits `11` with the reason (and the check in `error.details`) when the tip was dropped, returned as change, or left the check open owing it.

## Retrying safely
A check POST is **not** safe to blind-retry: a timeout is not proof the check wasn't created, and a second attempt charges the customer twice. Pass `--idempotency-id <id>` and **reuse that id for every retry of the same order** — StsCLI asks STS for duplicate detection, so the retry returns the **existing** check (and says so on stderr) rather than creating another. Accepts 32 hex characters or a UUID with dashes; without the flag, each post gets a fresh id and is a new check.

Detection spans endpoints: a check posted to the cloud STS is recognised by the on-prem one and vice versa, so failing over is safe *with* an id. If you must reconcile instead, look the order up with `sts check list --since-time <just before you posted> --include-closed` — and correlate on the check name or the tender's reference text, because the idempotency id is not returned by that read.

## Cloud vs local
Reads and checks target the **cloud STS** by default. For a property whose Simphony is on the **local hub**, add `--local-sts-ip <ip>` to send that one call to its on-prem STS. `sts connection status --location <loc> --rvc <rvc>` tells you where a property is live.

## Which build am I on?
`sts version` reads the version out of the exe and prints it as JSON (`v2`, plus the full assembly version and the commit) — **no network**, so it works offline and on a locked-down POS network. Add `--check` to compare against the latest published build:
```
sts version              # local only
sts version --check      # adds latest, upToDate and the download URL
```
`--check` is the **only** call StsCLI makes to Muneris, and only to compare build numbers. If it can't reach the feed it still reports your local version rather than failing.

## Drive it with an AI agent
StsCLI is agent-first: a stable JSON schema, a branchable exit-code taxonomy, and structured self-correcting errors (the **full STS response body is surfaced verbatim**, so an agent sees exactly what went wrong). `sts endpoints` lists every read; for the write side, **`sts check example`** prints a ready-to-fill request body with the rules baked in (which tender settles vs. service-total fires, what the CLI fills for you) — the agent adapts a concrete example instead of guessing a schema.

## Feedback
StsCLI comes from **Muneris** — [tools.muneris.cloud](https://tools.muneris.cloud/#sts-cli). It's built to be driven by an AI and to grow with use, so if a verb or flag could be clearer, or is missing, say so: **support@muneris.dk**. Include the command you ran, the JSON envelope it returned, and the exit code.
