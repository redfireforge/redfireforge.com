import { useState } from 'react';
import {
  detectOSTarget,
  platformLabel,
  PLATFORM_OPTIONS,
  LH_PLATFORM_OPTIONS,
  type OSTarget,
} from '../utils/detectOS';
import {
  findAsset,
  formatBytes,
  getDownloadUrl,
  namedAssetUrl,
  type LatestRelease,
} from '../utils/githubRelease';

const GITHUB_RELEASES = 'https://github.com/redfireforge/redfireforge-public/releases';

type EditionTab = 'standard' | 'lh';

interface Props {
  release: LatestRelease;
  lhRelease: LatestRelease | null;
}

export function DownloadEditions({ release, lhRelease }: Props) {
  const detected = detectOSTarget();
  const [activeTab, setActiveTab] = useState<EditionTab>('standard');

  // Standard edition
  const primaryUrl = getDownloadUrl(release.assets, detected, release.tagName);
  const primaryAsset = findAsset(release.assets, detected);
  const otherPlatforms = PLATFORM_OPTIONS.filter((p) => p.id !== detected);

  // Learning Hub edition
  const lhPrimaryAsset = lhRelease
    ? lhRelease.assets.find((a) => LH_PLATFORM_OPTIONS.find((p) => p.id === detected)?.pattern.test(a.name)) ?? null
    : null;
  const lhPrimaryUrl = lhPrimaryAsset && lhRelease
    ? namedAssetUrl(lhRelease.tagName, lhPrimaryAsset.name) ?? lhPrimaryAsset.browser_download_url
    : (lhRelease?.htmlUrl ?? null);
  const lhOtherPlatforms = LH_PLATFORM_OPTIONS.filter((p) => p.id !== detected);

  return (
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
          <div className="primary-cta">
            <div className="detected">Detected: {platformLabel(detected)}</div>
            {primaryUrl ? (
              <>
                <a
                  className="btn btn-primary"
                  href={primaryUrl}
                  download={primaryAsset?.name}
                >
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
              If the file has no extension, rename it to the name shown above.
            </p>
          </div>

          <div className="plat-section">
            <div className="plat-section__label">All platforms</div>
            <div className="plat-grid">
              {otherPlatforms.map((p) => {
                const asset = findAsset(release.assets, p.id as OSTarget);
                const href = asset
                  ? namedAssetUrl(release.tagName, asset.name) ?? asset.browser_download_url
                  : release.htmlUrl;
                return (
                  <a
                    key={p.id}
                    className="plat"
                    href={href}
                    download={asset?.name}
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

          <div className="homebrew-card">
            <span className="homebrew-icon" aria-hidden>🍺</span>
            <div className="homebrew-body">
              <p className="homebrew-title">Homebrew (macOS) — bypasses Gatekeeper</p>
              <pre className="homebrew-cmd">brew tap redfireforge/tap{'\n'}brew install --cask redfireforge</pre>
            </div>
          </div>

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
              <div className="primary-cta">
                <div className="detected">Detected: {platformLabel(detected)}</div>
                {lhPrimaryUrl ? (
                  <>
                    <a
                      className="btn btn-primary btn-primary--lh"
                      href={lhPrimaryUrl}
                      download={lhPrimaryAsset?.name}
                    >
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
                  If the file has no extension, rename it to the name shown above.
                </p>
              </div>

              <div className="plat-section">
                <div className="plat-section__label plat-section__label--lh">All platforms</div>
                <div className="plat-grid">
                  {lhOtherPlatforms.map((p) => {
                    const asset = lhRelease.assets.find((a) => p.pattern.test(a.name));
                    const href = asset
                      ? namedAssetUrl(lhRelease.tagName, asset.name) ?? asset.browser_download_url
                      : lhRelease.htmlUrl;
                    return (
                      <a
                        key={p.id}
                        href={href}
                        download={asset?.name}
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
    </>
  );
}
