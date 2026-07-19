# Tool page docs — convention

Each tool's detail page is built from the markdown files in **`docs/<tool-slug>/`**. Every `.md`
file becomes a **sub-page tab**, and the generator (`build.js`) renders it with `marked`.

## Frontmatter

Put optional frontmatter at the top of each file to control the tab:

```markdown
---
title: Quick start
order: 1
---

# your content…
```

- **`title`** — the tab label. If omitted, the first heading in the file is used (or "Documentation").
- **`order`** — sort order, ascending. If omitted, the file sorts last, then alphabetically.

So `docs/ip-printer/quick-start.md` (order 1) shows before `documentation.md` (order 2).

## The Changelog tab

The **Changelog** tab is *not* a file — it's generated automatically from the tool's GitHub
releases (newest first), for published tools only, and always appears last. Don't add a
`changelog.md`.

## Adding a page

Drop a new `.md` file in the tool's folder (e.g. `docs/ip-printer/troubleshooting.md`) with a
`title`/`order`, commit, and it appears as a tab on the next build. No code changes.
