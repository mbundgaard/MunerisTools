---
title: Documentation
order: 2
---

## Overview
**IP Printer** stands in for up to fifteen ESC/POS receipt printers on loopback IP addresses. Point your POS at `127.0.0.1:9100`, `127.0.0.2:9100`, … (one logical printer per address) and every receipt that would have hit a kitchen or counter printer shows up **on screen**, fully rendered — text, logos, barcodes and QR codes.

It's a single self-contained `.exe` — no installer, no prerequisites. Uses the in-box .NET Framework 4.6.2 on any Windows 10+/Server 2016+.

## Using it
- Open **Settings** and add up to 15 printers; each is assigned the next loopback address on port 9100.
- Point each POS printer record at the matching `127.0.0.X:9100`.
- Receipts stack newest-on-top per printer, with hover copy buttons — as text, as image, or as raw hex bytes.

## Drive it with an AI agent
IP Printer exposes a small local HTTP API on port `9101` that a coding agent can read and drive:

```
GET  /                  # self-describing guide to the API
GET  /latest?printer=N  # PNG of a printer's newest receipt
GET  /latest.txt        # decoded receipt text
POST /clear             # clear receipts
```

The hamburger menu's **Copy AI prompt** seeds an agent — **Claude Code, Codex, or Gemini CLI** — that points itself at `http://127.0.0.1:9101/` and iterates on receipt output hands-free.

