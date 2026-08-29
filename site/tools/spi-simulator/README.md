---
title: Documentation
order: 2
---

## Overview
**SPI Simulator** stands in for a local Oracle Simphony SPI payment terminal. Simphony posts XML to `http://127.0.0.1:8991/`; the simulator shows the request, lets you choose a response from a small set of dropdowns, and sends generated SPI XML back.

It is a single framework-dependent `.exe`. Install the .NET 10 Windows Desktop Runtime on the target workstation.

## Using it
- Start **SPI Simulator**. It automatically listens on `127.0.0.1:8991`/port `8991`.
- Configure Simphony SPI to use `http://127.0.0.1:8991/`.
- Run one transaction at a time.
- Choose result, amount behavior, card profile, cardholder flow, and online/offline behavior.
- Press **Send response**.

If another transaction arrives while one is pending, the simulator returns a terminal-busy response.
