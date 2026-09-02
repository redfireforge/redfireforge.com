import { DownloadEditions } from './DownloadEditions';
import { useDownloadReleases } from '../hooks/useDownloadReleases';
import { formatReleaseDate, renderReleaseNotes } from '../utils/githubRelease';

const GITHUB_RELEASES = 'https://github.com/redfireforge/redfireforge-public/releases';
const GITHUB_REPO = 'https://github.com/redfireforge/redfireforge-public';

interface DownloadPanelProps {
  /** Landing page embed — section heading instead of page header */
  embedded?: boolean;
  /** Checksums + release notes — shown on /download only */
  showReleaseDetails?: boolean;
}

export function DownloadPanel({ embedded = false, showReleaseDetails = false }: DownloadPanelProps) {
  const { state, release, lhRelease, checksums } = useDownloadReleases();

  const versionPill =
    state === 'ready' && release ? (
      <div className={embedded ? 'dl-version-pill' : 'relpill'}>
        <span className="pulse" aria-hidden />
        <span>
          {embedded ? 'Latest release · ' : ''}v{release.version}
          {embedded ? ' · ' : ' · Released '}
          {formatReleaseDate(release.publishedAt)}
        </span>
      </div>
    ) : state === 'loading' ? (
      <div className={embedded ? 'dl-version-pill' : 'relpill'}>
        <span>Loading latest release…</span>
      </div>
    ) : null;

  return (
    <>
      {embedded ? (
        <>
          <div className="lp-section-label">Get started</div>
          <h2
            style={{
              fontSize: 'clamp(1.9rem, 3.8vw, 2.6rem)',
              fontWeight: 780,
              letterSpacing: '-0.026em',
              marginBottom: 18,
            }}
          >
            Download RedfireForge
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 26px' }}>
            Performance Workbench — desktop app for API testing, load testing, Mock, gRPC &amp; Kafka.
            Free and open source. No account, no telemetry, no license key.
          </p>
          {versionPill}
        </>
      ) : (
        <header className="head">
          <div className="head-inner">
            <h1>Download RedfireForge</h1>
            <p>Performance Workbench — desktop app for API testing, load testing, Mock, gRPC &amp; Kafka</p>
            {versionPill}
          </div>
        </header>
      )}

      {state === 'loading' && (
        <div className="status-card">Fetching release info from GitHub…</div>
      )}

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

      {state === 'ready' && release && (
        <>
          <DownloadEditions release={release} lhRelease={lhRelease} />

          {showReleaseDetails && (
            <>
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
        </>
      )}

      {embedded && (
        <p className="dl-meta-links">
          <a href={GITHUB_RELEASES} target="_blank" rel="noopener noreferrer">
            All releases on GitHub
          </a>
          {' · '}
          <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
            Build from source
          </a>
        </p>
      )}
    </>
  );
}
