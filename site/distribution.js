// Generic presentation contract. Providers choose labels, commands and URLs.
// Commands are displayed as text, never executed by the site.
export function distribution(tool, release) {
  if (!release) return { actions: [], download: null };
  const actions = release.actions ?? (release.url ? [{
    type: 'link', label: 'Download', url: release.url, download: true,
    description: tool.asset || '',
  }] : []); // Compatibility for providers that still emit legacy download feeds.
  if (!Array.isArray(actions) || actions.length > 16) throw new Error('Invalid provider actions');
  const text = (value, maximum) => typeof value === 'string' && value.trim() && value.length <= maximum;
  const validated = actions.map(action => {
    if (!action || !text(action.label, 100)) throw new Error('Action label required');
    if (action.type === 'command') {
      if (!text(action.text, 4096)) throw new Error('Command text required');
      return { type: 'command', label: action.label, text: action.text };
    }
    if (action.type !== 'link') throw new Error('Unknown provider action type');
    const url = new URL(action.url);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Provider links must use credential-free HTTPS');
    if (action.download !== undefined && typeof action.download !== 'boolean') throw new Error('Invalid download flag');
    if (action.description !== undefined && typeof action.description !== 'string') throw new Error('Invalid action description');
    return { type: 'link', label: action.label, url: url.href,
      download: action.download === true, description: action.description || '' };
  });
  return { actions: validated, download: validated.find(action => action.download)?.url || null };
}
