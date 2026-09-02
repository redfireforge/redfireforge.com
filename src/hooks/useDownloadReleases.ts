import { useEffect, useState } from 'react';
import {
  fetchChecksums,
  fetchLatestRelease,
  fetchLatestLearningHubRelease,
  type LatestRelease,
} from '../utils/githubRelease';

export type DownloadLoadState = 'loading' | 'ready' | 'empty' | 'error';

export function useDownloadReleases() {
  const [state, setState] = useState<DownloadLoadState>('loading');
  const [release, setRelease] = useState<LatestRelease | null>(null);
  const [lhRelease, setLhRelease] = useState<LatestRelease | null>(null);
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

      const [sums, lh] = await Promise.all([
        fetchChecksums(data.assets),
        fetchLatestLearningHubRelease(),
      ]);

      if (cancelled) return;
      setChecksums(sums);
      setLhRelease(lh);
    })().catch(() => {
      if (!cancelled) setState('error');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { state, release, lhRelease, checksums };
}
