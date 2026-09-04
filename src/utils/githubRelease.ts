import { PLATFORM_OPTIONS, type OSTarget } from './detectOS';

export interface ReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
}

export interface LatestRelease {
  tagName: string;
  version: string;
  publishedAt: string;
  body: string;
  assets: ReleaseAsset[];
  htmlUrl: string;
}

const REPO = 'redfireforge/redfireforge-public';
const CACHE_KEY = 'rff-marketing-latest-release';
const CACHE_TTL_MS = 5 * 60 * 1000;

/** Official stable tags only — never alpha/beta/rc or leftover -lh releases. */
export function isOfficialStableRelease(
  tagName: string,
  name = '',
  prerelease = false,
  draft = false,
): boolean {
  if (draft || prerelease) return false;
  if (/Learning\s*Hub/i.test(name)) return false;
  if (/-/.test(tagName.replace(/^v/, ''))) return false;
  return /^\d+\.\d+\.\d+$/.test(tagName.replace(/^v/, ''));
}

/** Legacy Learning Hub-only tag (vX.Y.Z-lh) from before both editions shared vX.Y.Z. */
export function isOfficialLearningHubRelease(
  tagName: string,
  _name = '',
  prerelease = false,
  draft = false,
): boolean {
  if (draft || prerelease) return false;
  const stripped = tagName.replace(/^v/, '');
  return /^\d+\.\d+\.\d+-lh$/.test(stripped);
}

export function hasLearningHubAssets(assets: ReleaseAsset[]): boolean {
  return assets.some((a) => /LearningHub/i.test(a.name));
}

function isLearningHubAsset(name: string): boolean {
  return /LearningHub/i.test(name);
}

/** Official GitHub tags we will redirect: v1.2.3, plus leftover v1.2.3-lh links. */
export const SAFE_RELEASE_TAG = /^v\d+\.\d+\.\d+(?:-lh)?$/;

/** Installer names from our Tauri builds — no slashes or query chars. */
export const SAFE_ASSET_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Same-origin path so Chrome uses this filename instead of GitHub's UUID
 * redirect (`release-assets.githubusercontent.com/.../<uuid>`).
 */
export function namedAssetUrl(tagName: string, assetName: string): string | null {
  if (!SAFE_RELEASE_TAG.test(tagName) || !SAFE_ASSET_NAME.test(assetName)) return null;
  return `/dl/${tagName}/${assetName}`;
}

export function getDownloadUrl(
  assets: ReleaseAsset[],
  target: OSTarget,
  tagName?: string,
): string | null {
  const opt = PLATFORM_OPTIONS.find((p) => p.id === target);
  if (!opt) return null;
  const asset = assets.find((a) => opt.pattern.test(a.name) && !isLearningHubAsset(a.name));
  if (!asset) return null;
  if (tagName) {
    return namedAssetUrl(tagName, asset.name) ?? asset.browser_download_url;
  }
  return asset.browser_download_url;
}

export function findAsset(assets: ReleaseAsset[], target: OSTarget): ReleaseAsset | null {
  const opt = PLATFORM_OPTIONS.find((p) => p.id === target);
  if (!opt) return null;
  return assets.find((a) => opt.pattern.test(a.name) && !isLearningHubAsset(a.name)) ?? null;
}

export function formatBytes(size: number): string {
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatReleaseDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export async function fetchLatestRelease(): Promise<LatestRelease | null> {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached) as {
        data: LatestRelease;
        timestamp: number;
      };
      if (Date.now() - timestamp < CACHE_TTL_MS) return data;
    }
  } catch {
    // ignore corrupt cache
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return null;
    const releases = (await res.json()) as Array<{
      tag_name: string;
      prerelease: boolean;
      draft: boolean;
      published_at: string;
      body: string | null;
      assets: ReleaseAsset[];
      html_url: string;
      name: string;
    }>;

    const stable = releases.find((r) =>
      isOfficialStableRelease(r.tag_name, r.name, r.prerelease, r.draft),
    );
    if (!stable) return null;

    const data: LatestRelease = {
      tagName: stable.tag_name,
      version: stable.tag_name.replace(/^v/, ''),
      publishedAt: stable.published_at,
      body: stable.body ?? '',
      assets: stable.assets ?? [],
      htmlUrl: stable.html_url,
    };

    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {
      // ignore
    }
    return data;
  } catch {
    return null;
  }
}

const LH_CACHE_KEY = 'rff-marketing-latest-lh-release';

export async function fetchLatestLearningHubRelease(): Promise<LatestRelease | null> {
  try {
    const cached = sessionStorage.getItem(LH_CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached) as { data: LatestRelease; timestamp: number };
      if (Date.now() - timestamp < CACHE_TTL_MS) return data;
    }
  } catch { /* ignore */ }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return null;
    const releases = (await res.json()) as Array<{
      tag_name: string; prerelease: boolean; draft: boolean;
      published_at: string; body: string | null; assets: ReleaseAsset[];
      html_url: string; name: string;
    }>;
    const stable = releases.find((r) =>
      isOfficialStableRelease(r.tag_name, r.name, r.prerelease, r.draft),
    );
    const fromStable = stable && hasLearningHubAssets(stable.assets ?? []) ? stable : null;
    const legacy = releases.find((r) =>
      isOfficialLearningHubRelease(r.tag_name, r.name, r.prerelease, r.draft),
    );
    const lh = fromStable ?? legacy ?? null;
    if (!lh) return null;
    const data: LatestRelease = {
      tagName: lh.tag_name, version: lh.tag_name.replace(/^v/, '').replace(/-lh$/, ''),
      publishedAt: lh.published_at, body: lh.body ?? '',
      assets: lh.assets ?? [], htmlUrl: lh.html_url,
    };
    try {
      sessionStorage.setItem(LH_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    } catch { /* ignore */ }
    return data;
  } catch {
    return null;
  }
}

/** Fetch and parse SHA256SUMS.txt from release assets when present. */
export async function fetchChecksums(assets: ReleaseAsset[]): Promise<string | null> {
  const file =
    assets.find((a) => /^SHA256SUMS(\.txt)?$/i.test(a.name)) ??
    assets.find((a) => /checksums?\.txt$/i.test(a.name));
  if (!file) return null;
  try {
    const res = await fetch(file.browser_download_url);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Very small markdown → HTML for release notes (headings, lists, bold, links, code). */
export function renderReleaseNotes(md: string): string {
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const inline = (s: string) =>
    escape(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
      );

  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^###\s+/.test(line)) {
      closeList();
      out.push(`<h4>${inline(line.replace(/^###\s+/, ''))}</h4>`);
    } else if (/^##\s+/.test(line)) {
      closeList();
      out.push(`<h4>${inline(line.replace(/^##\s+/, ''))}</h4>`);
    } else if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ''))}</li>`);
    } else if (line.trim() === '') {
      closeList();
    } else {
      closeList();
      out.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return out.join('\n');
}
