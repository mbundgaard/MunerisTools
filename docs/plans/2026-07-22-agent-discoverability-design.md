# tools.muneris.cloud — make the catalog readable by an AI agent

Date: 2026-07-22

## Problem

The site published one HTML file plus a generated `version.json` per released tool.
Everything else — the tool list, and every tool's README / QUICK-START / CHANGELOG — was read
at build time and **inlined into `index.html`**. An agent had to fetch a SPA and pull apart
embedded JSON to learn anything, and a tool's changelog could not be fetched at all.

The repo paths are not a workaround: GitHub Pages deploys only `site/_site`
(`upload-pages-artifact` → `path: site/_site`), so `/tools/sts-cli/CHANGELOG.md` is a 404.

## Decisions

**Publish the tool's own files verbatim; generate as little as possible.** The five files a
tool already authors are exactly what an agent needs, so copy them into `_site/<slug>/`
rather than deriving new shapes. Nothing to keep in sync, nothing to drift.

**`release.json` is the update-check file.** It already carries `{ version, date, size, url }`
— everything an updater needs, written by the pipeline on every release. The previously
generated `version.json` merged two fields from `tool.json` with a reshaped `release.json`
and wrapped the single latest build in a `releases[]` array implying a history it never had.
Dropped: a third concept for information two files already expressed.

**A missing `release.json` is meaningful, not an error.** It is absent until a tool's first
release, so a 404 means "not released yet", distinguished from "no such tool" by whether
`tool.json` is present. Better than inventing `latest: null`.

**No generated catalog.** `tools.json` was dropped for the same reason as `version.json` —
it duplicated `tool.json` content. `llms.txt` lists the slugs, which is all an agent needs to
reach the per-tool files, and it is markdown an LLM reads anyway.

**Only `llms.txt` is generated.** It is an index, not a copy: the slug list plus the file
convention. A community proposal rather than an IETF/W3C standard, with partial crawler
support — so it is signposting, and the per-tool files at predictable paths are the real
contract.

**The site documents no command surface.** It explains how to *find and fetch* a tool; the
tool describes itself via `--help`. So the site cannot go stale relative to the CLIs.

**The download URL points at GitHub releases.** That is where the binaries live. It is
machine-facing plumbing, and the same-domain alternative — a meta-refresh page, since Pages
cannot serve a 302 — would break `curl -O` and harm the agent case.

**Copy-AI-prompt button is site-wide only** (hero CTA), seeding the entry point rather than a
tool list, so the text cannot go stale. Matches the "Copy AI prompt" idiom already in the
MunerisIpPrinter app.

## Published surface

    /llms.txt                     index + file convention (the only generated file)
    /<slug>/tool.json             copied — frame
    /<slug>/release.json          copied — latest build (absent until first release)
    /<slug>/README.md             copied
    /<slug>/QUICK-START.md        copied
    /<slug>/CHANGELOG.md          copied
    /<slug>/screenshots/*         unchanged
    /index.html                   unchanged (the human SPA)

Agent path: `llms.txt` → per-tool files → download → the tool's own `--help`.

## Follow-up required in the tools

Both CLIs' update checks must read `release.json`:

- **StsCLI** currently points at `/sts-cli/version.json` (shipped in v3) — must move to
  `release.json` and parse `version` as a string.
- **MunerisIpPrinter is already broken**: it calls
  `api.github.com/repos/…/releases/tags/ip-printer`, a rolling tag that no longer exists since
  releases became per-version (`ip-printer/v31`). That URL 404s, so deployed copies have
  silently stopped seeing updates. Moving it to `release.json` fixes the bug and removes the
  GitHub API dependency. Only helps copies from the next release onward; existing installs
  cannot self-update and need manual replacement.

## Error handling

Generation is build-time and total — a tool with no markdown simply contributes fewer files.
The clipboard API needs a secure context: catch and fall back to a hidden `<textarea>` +
`execCommand('copy')`, showing the copied state only on success.

## Testing

`npm run build`, then assert `_site` contains `llms.txt` and each tool's copied files; that
copies are byte-identical to source; that the human site still renders (tool count, cards,
feature chips unchanged); and after deploy, that every URL in `llms.txt` resolves.
