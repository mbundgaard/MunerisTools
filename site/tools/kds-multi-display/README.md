---
title: Documentation
order: 2
---

## Overview
**KDS Multi-Display** hosts several Muneris KDS display stations in a single window. Each station binds its own loopback endpoint — `127.0.0.1:5022`, `127.0.0.2:5022`, … — so a KDS Controller sees them as distinct displays, exactly as if each ran on its own screen. One machine, one window, many stations.

It runs the **real** display engine and wire protocol — the same code the single-station display ships — so what you see on a station here is what the kitchen sees in production. It's a portable `.exe` (needs the .NET 10 Desktop Runtime); no installer.

## What it's for
- **Multi-station setups on one screen** — Prep, Expo, Drive-Thru side by side without a monitor per station.
- **Testing & demos** — drive a whole kitchen's worth of displays from a KDS Controller (or Simphony's virtual KDS) against loopback, with no hardware.

## Using it
- The sidebar lists every station: name, endpoint, a KDS-Controller connection dot, and a live order count. `Ctrl+1..9` switches; hover the pencil (or double-click) to rename inline.
- **Click a chit to bump it** — sends a Done (270) to the controller and clears the order, same as pressing Done on a bumpbar.
- The burger menu has **Settings** (add/rename/remove stations), **Open logs folder**, **Check for updates**, and **About**.

## Stations & identity
Each loopback address the controller dials becomes that station's identity — `127.0.0.1` = "Prep", `127.0.0.2` = "Expo", and so on — so they route independently. Stations and the window size are remembered between runs (`%LOCALAPPDATA%\MunerisKdsMultiDisplay\settings.json`). Adding or removing a station needs a restart to rebind the loopback listeners.

## Updates
The app checks for a newer build on launch (and every few hours) and quietly downloads it in the background. When one is ready a link appears at the bottom of the sidebar — click it to install and restart, or it applies automatically on the next launch. Offline machines simply keep running the current build.
