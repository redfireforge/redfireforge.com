import { useEffect, useMemo, useState } from 'react';
import { SiteNav } from '../components/SiteNav';
import { detectOSTarget, platformLabel, PLATFORM_OPTIONS, LH_PLATFORM_OPTIONS, type OSTarget } from '../utils/detectOS';
import {
  fetchChecksums,
  fetchLatestRelease,
  fetchLatestLearningHubRelease,
  findAsset,
  formatBytes,
  formatReleaseDate,
  getDownloadUrl,
  renderReleaseNotes,
  type LatestRelease,
} from '../utils/githubRelease';

const GITHUB_RELEASES = 'https://github.com/redfireforge/redfireforge-public/releases';
const GITHUB_REPO = 'https://github.com/redfireforge/redfireforge-public';

type LoadState = 'loading' | 'ready' | 'empty' | 'error';
type EditionTab = 'standard' | 'lh';

export function DownloadPage() {
  const detected = useMemo(() => detectOSTarget(), []);
  const [state, setState] = useState<LoadState>('loading');
  const [release, setRelease] = useState<LatestRelease | null>(null);
  const [checksums, setChecksums] = useState<string | null>(null);
  const [lhRelease, setLhRelease] = useState<LatestRelease | null>(null);
  const [activeTab, setActiveTab] = useState<EditionTab>('standard');

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
      const lh = await fetchLatestLearningHubRelease();
      if (!cancelled) setLhRelease(lh);
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

  const lhPrimaryAsset = lhRelease
    ? lhRelease.assets.find((a) => LH_PLATFORM_OPTIONS.find((p) => p.id === detected)?.pattern.test(a.name)) ?? null
    : null;
  const lhPrimaryUrl = lhPrimaryAsset?.browser_download_url ?? (lhRelease?.htmlUrl ?? null);
  const lhOtherPlatforms = LH_PLATFORM_OPTIONS.filter((p) => p.id !== detected);

  return (
    <>
      <SiteNav />
      <main className="wrap download-page">
        {/* ── Page header ── */}
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

        {/* ── Status: loading / empty / error ── */}
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
                github.com/redfireforge/redfireforge-public
              </a>
            </p>
          </div>
        )}

        {/* ── Tabbed edition panel ── */}
        {state === 'ready' && release && (
          <>
            {/* Tab switcher */}
            <div className="edition-tabs" role="tablist" aria-label="Choose edition">
              <button
                role="tab"
                aria-selected={activeTab === 'standard'}
                aria-controls="tab-panel-standard"
                id="tab-standard"
                className={`edition-tab${activeTab === 'standard' ? ' edition-tab--active' : ''}`}
                onClick={() => setActiveTab('standard')}
              >
                <span className="edition-tab__dot edition-tab__dot--standard" aria-hidden />
                <span className="edition-tab__label">Standard Edition</span>
                <span className="edition-tab__badge">Latest stable</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'lh'}
                aria-controls="tab-panel-lh"
                id="tab-lh"
                className={`edition-tab${activeTab === 'lh' ? ' edition-tab--active edition-tab--lh-active' : ''}`}
                onClick={() => setActiveTab('lh')}
              >
                <span className="edition-tab__dot edition-tab__dot--lh" aria-hidden />
                <span className="edition-tab__label">Learning Hub Edition</span>
                <span className="edition-tab__badge edition-tab__badge--lh">28 guided lessons</span>
              </button>
            </div>

            {/* ── Standard Edition panel ── */}
            <div
              role="tabpanel"
              id="tab-panel-standard"
              aria-labelledby="tab-standard"
              className={`tab-panel${activeTab === 'standard' ? ' tab-panel--active' : ''}`}
            >
              <div className="tab-panel__inner">
                {/* Primary CTA */}
                <div className="primary-cta">
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
                      <div className="filemeta">No installer found for {platformLabel(detected)}</div>
                    </>
                  )}
                  <p className="macos-note">
                    Both Apple Silicon and Intel shown below — detection can be wrong under Rosetta.
                  </p>
                </div>

                {/* Other platforms */}
                <div className="plat-section">
                  <div className="plat-section__label">All platforms</div>
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
                            {p.id.startsWith('macos') ? '' : p.id.startsWith('windows') ? '⊞' : '🐧'}
                          </span>
                          <span>
                            <span className="plat-name">{p.label}</span>
                            <span className="plat-sub">
                              .{p.format}
                              {asset?.size ? ` · ${formatBytes(asset.size)}` : asset ? '' : ' · via GitHub'}
                            </span>
                          </span>
                          <span className="plat-dl" aria-hidden>↓</span>
                        </a>
                      );
                    })}
                  </div>
                </div>

                {/* Homebrew */}
                <div className="homebrew-card">
                  <span className="homebrew-icon" aria-hidden>🍺</span>
                  <div className="homebrew-body">
                    <p className="homebrew-title">Homebrew (macOS) — bypasses Gatekeeper</p>
                    <pre className="homebrew-cmd">brew tap redfireforge/tap{'\n'}brew install --cask redfireforge</pre>
                  </div>
                </div>

                {/* macOS Gatekeeper */}
                <div className="gatekeeper-note">
                  <strong>macOS first launch:</strong> Apple Gatekeeper will block the app because
                  it is not yet notarized. Run this once in Terminal after installing:
                  <pre className="xattr-cmd">xattr -cr /Applications/RedfireForge.app</pre>
                  Then double-click the app normally. This is only needed once.
                </div>
              </div>
            </div>

            {/* ── Learning Hub Edition panel ── */}
            <div
              role="tabpanel"
              id="tab-panel-lh"
              aria-labelledby="tab-lh"
              className={`tab-panel tab-panel--lh${activeTab === 'lh' ? ' tab-panel--active' : ''}`}
            >
              <div className="tab-panel__inner">
                {/* Description */}
                <div className="lh-intro">
                  <p className="lh-intro__text">
                    Everything in Standard, plus an interactive learning environment built directly
                    into the app — 28 guided lessons covering HTTP, GraphQL, gRPC, WebSocket, SSE,
                    and Kafka with step-by-step automation, live API calls, and in-app exercises.
                  </p>
                  <div className="lh-feature-row">
                    {[
                      { icon: '📖', text: '28 guided lessons' },
                      { icon: '⚡', text: 'Live API calls' },
                      { icon: '6 protocols', text: 'HTTP · GraphQL · gRPC · WS · SSE · Kafka', mono: true },
                    ].map((f) => (
                      <div key={f.icon} className="lh-feature">
                        <span className="lh-feature__icon" aria-hidden>{f.icon}</span>
                        <span className={f.mono ? 'lh-feature__text lh-feature__text--mono' : 'lh-feature__text'}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {lhRelease ? (
                  <>
                    {/* Primary CTA — detected OS */}
                    <div className="primary-cta">
                      <div className="detected">Detected: {platformLabel(detected)}</div>
                      {lhPrimaryUrl ? (
                        <>
                          <a className="btn btn-primary btn-primary--lh" href={lhPrimaryUrl}>
                            ↓ Download for {platformLabel(detected)}
                          </a>
                          {lhPrimaryAsset && (
                            <div className="filemeta">
                              {lhPrimaryAsset.name}
                              {lhPrimaryAsset.size > 0 ? ` · ${formatBytes(lhPrimaryAsset.size)}` : ''}
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <a className="btn btn-primary btn-primary--lh" href={lhRelease.htmlUrl} target="_blank" rel="noopener noreferrer">
                            View Learning Hub release on GitHub →
                          </a>
                          <div className="filemeta">No installer found for {platformLabel(detected)}</div>
                        </>
                      )}
                      <p className="macos-note">
                        Both Apple Silicon and Intel shown below — detection can be wrong under Rosetta.
                      </p>
                    </div>

                    {/* Other platforms */}
                    <div className="plat-section">
                      <div className="plat-section__label plat-section__label--lh">All platforms</div>
                      <div className="plat-grid">
                        {lhOtherPlatforms.map((p) => {
                          const asset = lhRelease.assets.find((a) => p.pattern.test(a.name));
                          const href = asset?.browser_download_url ?? lhRelease.htmlUrl;
                          return (
                            <a
                              key={p.id}
                              href={href}
                              target={asset ? '_self' : '_blank'}
                              rel="noopener noreferrer"
                              className="plat plat--lh"
                            >
                              <span className="plat-ico" aria-hidden>
                                {p.format === 'dmg' ? '' : p.format === 'exe' ? '⊞' : '🐧'}
                              </span>
                              <span>
                                <span className="plat-name">{p.label}</span>
                                <span className="plat-sub">
                                  .{p.format}{asset?.size ? ` · ${formatBytes(asset.size)}` : ''}
                                </span>
                              </span>
                              <span className="plat-dl" aria-hidden>↓</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>

                    {/* macOS Gatekeeper — LH */}
                    <div className="gatekeeper-note gatekeeper-note--lh">
                      <strong>macOS first launch:</strong> Apple Gatekeeper will block the app.
                      Run this once in Terminal after installing:
                      <pre className="xattr-cmd">xattr -cr "/Applications/RedfireForge Learning Hub.app"</pre>
                      Then double-click the app normally. This is only needed once.
                    </div>
                  </>
                ) : (
                  <p className="lh-unavail">
                    Learning Hub build not yet published for v{release.version}.{' '}
                    <a href={GITHUB_RELEASES} target="_blank" rel="noopener noreferrer">
                      Check GitHub releases →
                    </a>
                  </p>
                )}
              </div>
            </div>

            {/* ── Details (checksums + release notes) ── */}
            <h2 className="sec-title">Release details</h2>

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
