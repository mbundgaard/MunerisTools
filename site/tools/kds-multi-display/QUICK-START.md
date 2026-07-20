---
title: Quick start
order: 1
---

1. **Download** `MunerisKdsMultiDisplay.exe` and run it. It needs the **.NET 10 Desktop Runtime** on the machine.
2. It opens with two stations — **Prep** on `127.0.0.1:5022` and **Expo** on `127.0.0.2:5022`.
3. Point your KDS Controller (or Simphony's virtual KDS) at those loopback addresses — one order-device per station.
4. Orders arrive as chits; **click a chit to bump it** (sends a Done back to the controller).

Open **Settings** to add or rename stations — each new one gets the next loopback address (`127.0.0.3`, `127.0.0.4`, …). Adding or removing a station needs a restart to rebind the listeners.

> Port **5022** must be free on those loopback addresses. Stop any real `KDSDisplay.exe`, Observer, or co-resident KDS Controller holding `0.0.0.0:5022` first, or a station shows "bind failed".
