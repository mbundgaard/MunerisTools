// Keep portable executable tools unchanged; npm tools have installation metadata,
// never an executable download link or the HTML download attribute.
export function distribution(tool, release) {
  if (tool.distribution?.type !== 'npm') return {
    installation: null,
    downloads: release?.url ? [{ t: 'Windows - portable .exe', sub: tool.asset || 'download', url: release.url }] : [],
    download: release?.url || null,
  };
  const name = tool.distribution.package;
  if (typeof name !== 'string' || !/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(name)) throw new Error('Invalid npm package name');
  if (release && !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(release.version)) throw new Error('npm releases require stable SemVer');
  return { downloads: [], download: null, installation: release ? {
    type: 'npm', package: name, url: `https://www.npmjs.com/package/${name}`,
    command: `npm install --global ${name}@${release.version}`,
  } : null };
}
