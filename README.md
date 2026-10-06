# Muneris Tools

Public catalog and documentation hosting: https://tools.muneris.cloud/

## Provider-owned content, generic site

The site must not know any specific tool's commands, release process, package manager,
platform, or response format. Providers own that information. This repository only
transports, validates, renders and hosts their public bundles.

`site/tools/<slug>/` holds one provider bundle. The build discovers every folder with
`tool.json`; no product-specific conditionals or tests belong in the renderer.
Never hand-edit generated `site/_site/`.

### Bundle contract

- `tool.json`: name, icon, description, features, runtime, license, order, and optional
  `agentGuidance`. The provider chooses their values.
- `README.md`: overview; other top-level Markdown documents become tabs. Frontmatter
  `title` and `order` specify their labels/order. Providers choose which files exist.
- `CHANGELOG.md`: provider-authored history; versions need not follow a site-specific format.
- `release.json`: optional release information. Its presence marks a released tool.
- `screenshots/`: optional reviewed public images. Filenames set gallery order/captions.

The site publishes these files verbatim and generates a navigation index at `llms.txt`.
Provider guidance is carried into that index without inferring commands or behavior.
Links within provider documentation must already point to their intended destination.

### Installation actions

Providers supply display-ready actions in `release.json`:

```json
{
  "version": "provider-version",
  "date": "2026-10-06",
  "actions": [
    { "type": "command", "label": "Install", "text": "provider-owned installation command" },
    { "type": "link", "label": "Project page", "url": "https://example.com/project" }
  ]
}
```

The renderer displays command text; it never executes it. Link actions optionally
set `download: true` and `description`. Labels, commands, package/version choices,
URLs and download behavior belong to the provider. Links must be credential-free
HTTPS; unknown action kinds or malformed data fail validation. An explicit empty
`actions` array displays no installation action.

For existing providers only, a legacy `release.json.url` without an `actions` array
is rendered as a download, with `tool.json.asset` as its caption. This is a generic
compatibility adapter, not an executable/package-manager detector. Providers should
supply actions when adopting the current contract.

Icons: `printer`, `terminal`, `kds`, `sync`, `gauge`, `key`.
Markdown frontmatter example:

```markdown
---
title: Commands
order: 2
---

# Commands
```

## Provider synchronization

`providers.json` is declarative registration data: `slug`, public GitHub `repository`,
`ref`, and a Node `.mjs` `entrypoint`. The generic `scripts/sync-providers.mjs` clones
that registered ref and invokes:

```text
node <provider-entrypoint> <new-output-directory> <current-catalog-directory>
```

The provider decides which published release to use, how to verify it, whether an
update is appropriate, what docs/actions to export, and how to prevent downgrades.
It must not modify the current catalog directory. If it emits no output directory,
the consumer leaves that catalog entry unchanged.

Provider code is trusted code, not sandboxed. Registrations and changes to provider
refs/entrypoints require maintainer review. The subprocess is not given Actions
write tokens; checkout credentials are not persisted. Providers must export only
explicitly reviewed public content, never credentials, runtime state, logs, private
references or customer data. Review screenshots and their metadata before export.

The consumer rejects unexpected files and symlinks, then replaces only the registered
slug with its validated bundle. Markdown, tool/release JSON and supported screenshots
are the entire allowed surface. It does not fetch package registries or interpret
provider versions.

`.github/workflows/sync-providers.yml` runs hourly or manually and opens/updates a
reviewed PR on `automation/provider-catalogs`. Enable **Settings > Actions > General >
Workflow permissions > Allow GitHub Actions to create and approve pull requests**.
The workflow creates but does not approve/merge its own PR. No additional PAT is needed.
Schedules may be delayed or disabled after inactivity; manual dispatch remains available.

Merging reviewed content triggers `.github/workflows/pages.yml` to test, build and
deploy. Other providers can still deliver bundles through their own existing pipelines.
The catalog may lag a release pending review; follow provider guidance for update checks.

## Local checks

```sh
cd site
npm ci
npm test
npm run build
```

The generated site is `site/_site/index.html`. Tests use synthetic provider contracts,
not assumptions about specific catalog products.
