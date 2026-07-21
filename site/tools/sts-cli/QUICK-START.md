---
title: Quick start
order: 1
---

1. **Download** `sts.exe` (needs the .NET 10 Runtime) and put it on your PATH.
2. **Log in** — one time:
   ```
   sts auth env                                    # pick an Oracle environment
   sts auth config --env mte4 --org <ORG> --username <user>
   sts auth login --password <pw>
   ```
   Config and tokens are saved in `StsCli.json` next to the exe; the **password is never stored**.
3. **Read the property:**
   ```
   sts location list
   sts rvc list --location <loc>
   sts menu get --location <loc> --rvc <rvc>
   ```
4. **Post a check:** `sts check example` prints a ready-to-fill body; then
   ```
   sts check new --location <loc> --rvc <rvc> --employee <emp> --order-type 1 --body order.json
   ```

Run `sts endpoints` to list every read command, and `sts <cmd> --help` for full details on any of them.
