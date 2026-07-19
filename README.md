# Muneris Tools

Small, self-contained Windows utilities from Muneris — documentation and downloads.

**Browse the tools and grab the latest builds:** https://mbundgaard.github.io/MunerisTools/

> This repository hosts the public documentation, release binaries, and the static site
> generated from them. Each tool's source code is maintained privately; only its docs and
> releases live here.

## How this repo works

The site linked above is generated from this repo and deployed to GitHub Pages — it isn't
edited by hand.

- **Releases are the data.** Each tool ships per-version GitHub releases tagged `<slug>/v<n>`
  (e.g. `ip-printer/v28`), with the build attached as an asset. The generator reads them to
  build each tool's download page, its full version-history archive, and a `version.json`
  update manifest.
- **The generator** lives in `site/` (a small Node build) and runs from
  `.github/workflows/pages.yml` on every release and on `tools/**` / `site/**` pushes.
- **A tool's `tools/<slug>/` folder is a generated copy** — the README, changelog, and images
  are pushed here from that tool's private source repo (`docs/` → `tools/<slug>/`). Never
  hand-edit it; it's overwritten on the next publish.

## Adding a tool

1. In the tool's source repo, keep its public docs in a top-level `docs/` folder (`README.md`,
   `CHANGELOG.md`, optional `images/`).
2. Wire its release automation to push those docs to `tools/<slug>/` here and to create
   `<slug>/v<n>` releases with the binary attached.
3. Add an entry to `site/tools.json` (`slug`, `name`, `asset`, `tagline`) so the generator
   renders the tool's page and lists it in the catalog.

The slug must match in three places: the `tools/<slug>/` folder, the release tag prefix
`<slug>/v…`, and the tool's own auto-update configuration.
