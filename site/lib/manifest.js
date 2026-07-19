// Turn the GitHub releases array into a per-tool manifest object.
export function buildManifest(releases, tool) {
  const prefix = `${tool.slug}/v`;
  const items = [];
  for (const r of releases || []) {
    const tag = r.tag_name || '';
    if (!tag.startsWith(prefix)) continue;
    const numeric = tag.slice(prefix.length);
    if (!/^\d+$/.test(numeric)) continue;   // exactly the build counter, no trailing garbage
    const build = Number.parseInt(numeric, 10);
    const asset = (r.assets || []).find(a => a.name === tool.asset);
    items.push({
      build,
      date: (r.published_at || '').slice(0, 10),
      notes: r.body || '',
      url: asset ? asset.browser_download_url : null,
      sha256: asset && asset.digest ? asset.digest.replace(/^sha256:/, '') : null
    });
  }
  items.sort((a, b) => b.build - a.build);
  return { tool: tool.slug, name: tool.name, latest: items.length ? items[0].build : null, releases: items };
}
