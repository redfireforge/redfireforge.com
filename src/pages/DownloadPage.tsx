import { SiteNav } from '../components/SiteNav';
import { DownloadPanel } from '../components/DownloadPanel';

export function DownloadPage() {
  return (
    <>
      <SiteNav />
      <main className="wrap download-page">
        <DownloadPanel showReleaseDetails />
      </main>
    </>
  );
}
