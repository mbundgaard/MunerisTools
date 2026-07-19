# Muneris Tools — roster (for the catalog)

The real tools to list on the Muneris Tools page. Only **IP Printer** is published so far;
the rest are recorded here to add later (each becomes real once it has a MunerisTools release).

| Slug | Executable | What it is | Agent-drivable |
|------|-----------|------------|----------------|
| `ip-printer` | `MunerisIpPrinter.exe` | Emulator for multiple IP receipt printers in one app; listens on `127.0.0.x`. **Published.** | Yes (local HTTP API on 9101) |
| `sim-cli` | `SimCli.exe` | Command-line interface for the Simphony **client** — log in, order items, press buttons, restart. Reads the live WPF element tree, not screenshots. | Yes (CLI) |
| `multi-kds-display` | `MunerisMultiKdsDisplay.exe` * | Hosts many KDS displays in one app, so you don't need a VM per screen. | No |
| `sts-cli` | `StsCli.exe` | Command-line interface for the Simphony **Transaction Service** (the Simphony API) — authorize, list items, list open checks, post check. | Yes (CLI) |
| `open-check-viewer` | `SimphonyOpenCheckViewer.exe` * | Queries the legacy API to show open checks in the Simphony XML format. | No |
| `iquery-cli` | `IqueryCli.exe` | Command-line interface for querying and exporting data from Oracle Simphony **Reporting & Analytics**. | Yes (CLI) |

\* Executable spelling corrected from the note (`MunrisMultiKdsDisplay.exe` → `MunerisMultiKdsDisplay.exe`,
`SimhonyOpenCheckViewer.exe` → `SimphonyOpenCheckViewer.exe`) — please confirm the exact filenames.
