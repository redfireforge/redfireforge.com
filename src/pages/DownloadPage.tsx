import { useEffect, useMemo, useState } from 'react';
import { SiteNav } from '../components/SiteNav';
import { detectOSTarget, platformLabel, PLATFORM_OPTIONS, type OSTarget } from '../utils/detectOS';
import {
  fetchChecksums,
  fetchLatestRelease,
  findAsset,
  formatBytes,
  formatReleaseDate,
  getDownloadUrl,
  renderReleaseNotes,
  type LatestRelease,
} from '../utils/githubRelease';

const GITHUB_RELEASES = 'https://github.com/redfireforge/redfire-forge/releases';
const GITHUB_REPO = 'https://github.com/redfireforge/redfire-forge';

type LoadState = 'loading' | 'ready' | 'empty' | 'error';

export function DownloadPage() {
  const detected = useMemo(() => detectOSTarget(), []);
  const [state, setState] = useState<LoadState>('loading');
  const [release, setRelease] = useState<LatestRelease | null>(null);
  const [checksums, setChecksums] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchLatestRelease();
      if (cancelled) return;
      if (!data) {
        setState('empty');
        return;
      }
      setRelease(data);
      setState('ready');
      const sums = await fetchChecksums(data.assets);
      if (!cancelled) setChecksums(sums);
    })().catch(() => {
      if (!cancelled) setState('error');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const primaryUrl = release ? getDownloadUrl(release.assets, detected) : null;
  const primaryAsset = release ? findAsset(release.assets, detected) : null;
  const otherPlatforms = PLATFORM_OPTIONS.filter((p) => p.id !== detected);

  return (
    <>
      <SiteNav />
      <main className="wrap download-page">
        <header className="head">
          <div className="head-inner">
            <h1>Download RedfireForge</h1>
            <p>Performance Workbench — desktop app for API testing, load testing, Mock, gRPC &amp; Kafka</p>
            {state === 'ready' && release && (
              <div className="relpill">
                <span className="pulse" aria-hidden />
                <span>
                  v{release.version} · Released {formatReleaseDate(release.publishedAt)}
                </span>
              </div>
            )}
            {state === 'loading' && (
              <div className="relpill">
                <span>Loading latest release…</span>
              </div>
            )}
          </div>
        </header>

        {state === 'loading' && <div className="status-card">Fetching release info from GitHub…</div>}

        {(state === 'empty' || state === 'error') && (
          <div className="status-card status-card--warn">
            <h2>{state === 'error' ? 'Could not reach GitHub' : 'Not yet publicly released'}</h2>
            <p>
              {state === 'error'
                ? 'The GitHub Releases API is unreachable right now.'
                : 'No published stable release is available yet. Watch the repo for the first official tag.'}
            </p>
            <a className="btn btn-primary" href={GITHUB_RELEASES} target="_blank" rel="noopener noreferrer">
              View releases on GitHub →
            </a>
            <p className="status-card__link">
              <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
                github.com/redfireforge/redfire-forge
              </a>
            </p>
          </div>
        )}

        {state === 'ready' && release && (
          <>
            <section className="primary-card">
              <div className="detected">Detected: {platformLabel(detected)}</div>
              {primaryUrl ? (
                <>
                  <a className="btn btn-primary" href={primaryUrl}>
                    ↓ Download for {platformLabel(detected)}
                  </a>
                  {primaryAsset && (
                    <div className="filemeta">
                      {primaryAsset.name}
                      {primaryAsset.size > 0 ? ` · ${formatBytes(primaryAsset.size)}` : ''}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <a className="btn btn-primary" href={release.htmlUrl} target="_blank" rel="noopener noreferrer">
                    View v{release.version} on GitHub →
                  </a>
                  <div className="filemeta">No installer asset found for {platformLabel(detected)}</div>
                </>
              )}
              <p className="macos-note">
                On macOS we show both Apple Silicon and Intel below — pick the one that matches your Mac
                (detection can be wrong under Rosetta).
              </p>
              <div className="macos-gatekeeper-note">
                <strong>macOS first launch:</strong> Apple Gatekeeper will block the app because it is not yet
                notarized. After installing, run this once in Terminal:
                <pre className="xattr-cmd">xattr -cr /Applications/RedfireForge.app</pre>
                Then double-click the app normally. This is only needed once.
              </div>
            </section>

            <h2 className="sec-title">Also available for</h2>
            <div className="plat-grid">
              {otherPlatforms.map((p) => {
                const asset = findAsset(release.assets, p.id as OSTarget);
                const href = asset?.browser_download_url ?? release.htmlUrl;
                return (
                  <a
                    key={p.id}
                    className="plat"
                    href={href}
                    target={asset ? undefined : '_blank'}
                    rel={asset ? undefined : 'noopener noreferrer'}
                  >
                    <span className="plat-ico" aria-hidden>
                      {p.id.startsWith('macos') ? '' : p.id.startsWith('windows') ? '⊞' : '🐧'}
                    </span>
                    <span>
                      <span className="plat-name">{p.label}</span>
                      <span className="plat-sub">
                        .{p.format}
                        {asset?.size ? ` · ${formatBytes(asset.size)}` : asset ? '' : ' · via GitHub'}
                      </span>
                    </span>
                    <span className="plat-dl" aria-hidden>
                      ↓
                    </span>
                  </a>
                );
              })}
            </div>

            <h2 className="sec-title">Details</h2>

            <details>
              <summary>SHA256 checksums</summary>
              <div className="details-body">
                {checksums ? (
                  checksums
                    .trim()
                    .split('\n')
                    .filter(Boolean)
                    .map((line) => {
                      const [hash, ...rest] = line.trim().split(/\s+/);
                      const name = rest.join(' ') || 'file';
                      return (
                        <div className="checksum" key={line}>
                          <b>{name.replace(/^\.\//, '')}</b>
                          <span>{hash}</span>
                        </div>
                      );
                    })
                ) : (
                  <p className="notes">
                    Checksums are not attached to this release yet. Verify assets on{' '}
                    <a href={release.htmlUrl} target="_blank" rel="noopener noreferrer">
                      the GitHub release page
                    </a>
                    .
                  </p>
                )}
              </div>
            </details>

            <details>
              <summary>What&apos;s new in v{release.version}</summary>
              <div className="details-body">
                {release.body.trim() ? (
                  <div
                    className="notes"
                    dangerouslySetInnerHTML={{ __html: renderReleaseNotes(release.body) }}
                  />
                ) : (
                  <p className="notes">No release notes were published for this version.</p>
                )}
              </div>
            </details>

            <p className="footer-link">
              <a href={GITHUB_RELEASES} target="_blank" rel="noopener noreferrer">
                View all releases on GitHub →
              </a>
            </p>
          </>
        )}
      </main>
    </>
  );
}
