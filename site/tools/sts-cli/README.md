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

## Drive it with an AI agent
StsCLI is agent-first: a stable JSON schema, a branchable exit-code taxonomy, and structured self-correcting errors (the **full STS response body is surfaced verbatim**, so an agent sees exactly what went wrong). `sts endpoints` lists every read; for the write side, **`sts check example`** prints a ready-to-fill request body with the rules baked in (which tender settles vs. fires, what the CLI fills for you) — the agent adapts a concrete example instead of guessing a schema.
