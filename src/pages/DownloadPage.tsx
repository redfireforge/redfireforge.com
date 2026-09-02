import { useEffect, useState } from 'react';
import { SiteNav } from '../components/SiteNav';
import { DownloadEditions } from '../components/DownloadEditions';
import {
  fetchChecksums,
  fetchLatestRelease,
  fetchLatestLearningHubRelease,
  formatReleaseDate,
  renderReleaseNotes,
  type LatestRelease,
} from '../utils/githubRelease';

const GITHUB_RELEASES = 'https://github.com/redfireforge/redfireforge-public/releases';
const GITHUB_REPO = 'https://github.com/redfireforge/redfireforge-public';

type LoadState = 'loading' | 'ready' | 'empty' | 'error';

export function DownloadPage() {
  const [state, setState] = useState<LoadState>('loading');
  const [release, setRelease] = useState<LatestRelease | null>(null);
  const [checksums, setChecksums] = useState<string | null>(null);
  const [lhRelease, setLhRelease] = useState<LatestRelease | null>(null);

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
            <DownloadEditions release={release} lhRelease={lhRelease} />

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
