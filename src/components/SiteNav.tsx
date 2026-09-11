import { Link, useLocation } from 'react-router-dom';
import '../styles/landing.css';

const GITHUB_REPO = 'https://github.com/redfireforge/redfireforge-public';

const SECTIONS = [
  { hash: '#features', label: 'Features' },
  { hash: '#protocols', label: 'Protocols' },
  { hash: '#compare', label: 'Compare' },
  { hash: '#surfaces', label: 'Web vs Desktop' },
  { hash: '#cli', label: 'CLI' },
] as const;

export function SiteNav() {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const onContact = pathname === '/contact';
  const onDownload = pathname === '/download';

  return (
    <nav className="nav nav-landing">
      <div className="nav-inner">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden>🔥</span>
          <span>RedfireForge</span>
        </Link>
        <div className="nav-links">
          {SECTIONS.map((section) => (
            <a key={section.hash} href={onHome ? section.hash : `/${section.hash}`}>
              {section.label}
            </a>
          ))}
          <Link to="/contact" aria-current={onContact ? 'page' : undefined}>
            Contact
          </Link>
        </div>
        <div className="nav-cta">
          <a
            href={GITHUB_REPO}
            className="lp-btn lp-btn-ghost lp-btn-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            ★ GitHub
          </a>
          {onHome ? (
            <a href="#download" className="lp-btn lp-btn-primary lp-btn-sm">↓ Download</a>
          ) : (
            <Link
              to="/download"
              className="lp-btn lp-btn-primary lp-btn-sm"
              aria-current={onDownload ? 'page' : undefined}
            >
              ↓ Download
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
