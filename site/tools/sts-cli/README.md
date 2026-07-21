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
sts auth config --env mte4 --org RIN --username <user>
sts auth login --password <pw>                 # OAuth2 authorization-code + PKCE

sts location list                              # what can this account reach?
sts rvc list --location 9993
sts menu get --location 9993 --rvc 104         # config reads
sts tender list --location 9993 --rvc 104

sts check calculate --location 9993 --rvc 104 --employee 1479 --order-type 1 --body order.json
sts check new       --location 9993 --rvc 104 --employee 1479 --order-type 1 --body order.json
```
Every command emits **one JSON envelope on stdout**; human/diagnostic logs go to stderr. Config and tokens live in `StsCli.json` next to the exe — the **password is never stored** (it's used once at login; everything after renews via `sts auth refresh`).

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
StsCLI is agent-first: a stable JSON schema, a branchable exit-code taxonomy, and structured self-correcting errors (the **full STS response body is surfaced verbatim**, so an agent sees exactly what went wrong). `sts endpoints` lists every read; for the write side, **`sts check example`** prints a ready-to-fill request body with the rules baked in (which tender settles vs. fires, what the CLI fills for you) — the agent adapts a concrete example instead of guessing a schema.

## Feedback
StsCLI comes from **Muneris** — [tools.muneris.cloud](https://tools.muneris.cloud/#sts-cli). It's built to be driven by an AI and to grow with use, so if a verb or flag could be clearer, or is missing, say so: **support@muneris.dk**. Include the command you ran, the JSON envelope it returned, and the exit code.
