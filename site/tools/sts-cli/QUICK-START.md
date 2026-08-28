---
title: Quick start
order: 1
---

1. **Download** `sts.exe` (needs the .NET 10 Runtime) and put it on your PATH.
2. **Log in** — one time:
   ```
   sts auth env                                    # pick an Oracle environment
   sts auth config --env mte4 --org <ORG> --username <user> --client-id <id>
   sts auth login --password <pw>
   ```
   Config and tokens are saved in `StsCli.json` next to the exe; the **password is never stored**. Nothing is preconfigured — until `auth config` runs, every command fails with `not-configured` (exit 7) and names the fields it still needs.
3. **Read the property:**
   ```
   sts location list
   sts rvc list --location <loc>
   sts menu get --location <loc> --rvc <rvc>
   ```
4. **Post a check:** `sts check example` prints a ready-to-fill body; then
   ```
   sts check new --location <loc> --rvc <rvc> --employee <emp> --order-type <type> --body order.json
   ```
   Use a payment tender to settle/close; use a `serviceTotal` tender (for example tender 1004 where configured) with `total: 0` to send/fire and leave the check open.
   Add `--charged-tip <amount>` for a card tip — your tender's `total` must be the full amount charged, tip included.
   Add `--pickup-time <iso-time>` for Oracle autofire/pickup scheduling; the order type needs lead time configured and the time must be far enough in the future.
   Add `--idempotency-id <id>` if you may retry: reuse the same id and a retry returns the existing check instead of creating a second one.

Run `sts endpoints` to list every read command, and `sts <cmd> --help` for full details on any of them.

**Check your build:** `sts version` (offline) or `sts version --check` to see whether a newer one has been published.

**Feedback:** StsCLI comes from Muneris — [tools.muneris.cloud](https://tools.muneris.cloud/#sts-cli). Send suggestions or problems to **support@muneris.dk** with the command, the JSON envelope, and the exit code.
