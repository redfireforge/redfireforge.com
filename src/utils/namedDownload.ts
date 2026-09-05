/** Official GitHub tags we will serve: v1.2.3, plus leftover v1.2.3-lh links. */
export const SAFE_RELEASE_TAG = /^v\d+\.\d+\.\d+(?:-lh)?$/;

/** Installer names from our Tauri builds — no slashes or query chars. */
export const SAFE_ASSET_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export const GITHUB_RELEASE_DOWNLOAD =
  'https://github.com/redfireforge/redfireforge-public/releases/download';

export interface NamedDownload {
  tag: string;
  file: string;
}

/** Parse `/dl/v0.8.4/RedfireForge_0.8.4_aarch64.dmg` (query string ignored). */
export function parseNamedDownloadPath(pathname: string): NamedDownload | null {
  const path = pathname.split('?')[0] ?? '';
  const match = path.match(/^\/dl\/(v\d+\.\d+\.\d+(?:-lh)?)\/([A-Za-z0-9][A-Za-z0-9._-]*)$/);
  if (!match?.[1] || !match[2]) return null;
  if (!SAFE_RELEASE_TAG.test(match[1]) || !SAFE_ASSET_NAME.test(match[2])) return null;
  return { tag: match[1], file: match[2] };
}

export function githubReleaseAssetUrl(tag: string, file: string): string {
  return `${GITHUB_RELEASE_DOWNLOAD}/${tag}/${file}`;
}

export function contentDispositionAttachment(file: string): string {
  return `attachment; filename="${file}"`;
}
