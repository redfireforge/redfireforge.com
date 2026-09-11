import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/landing.css';

const GITHUB_REPO = 'https://github.com/redfireforge/redfireforge-public';

const SECTIONS = [
  { hash: '#features', id: 'features', label: 'Features' },
  { hash: '#protocols', id: 'protocols', label: 'Protocols' },
  { hash: '#compare', id: 'compare', label: 'Compare' },
  { hash: '#surfaces', id: 'surfaces', label: 'Web vs Desktop' },
  { hash: '#cli', id: 'cli', label: 'CLI' },
] as const;

const SECTION_IDS = ['features', 'protocols', 'compare', 'surfaces', 'cli', 'download'] as const;
type SectionId = (typeof SECTION_IDS)[number];

function isSectionId(id: string): id is SectionId {
  return (SECTION_IDS as readonly string[]).includes(id);
}

function useActiveLandingSection(onHome: boolean): [SectionId | null, (id: SectionId) => void] {
  const { hash } = useLocation();
  const lockUntil = useRef(0);
  const [active, setActive] = useState<SectionId | null>(null);

  const pin = (id: SectionId) => {
    lockUntil.current = Date.now() + 900;
    setActive(id);
  };

  useEffect(() => {
    if (!onHome) {
      setActive(null);
      return;
    }

    const fromHash = hash.replace('#', '');
    if (isSectionId(fromHash)) {
      pin(fromHash);
    }

    const elements = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.intersectionRatio);
          else visible.delete(entry.target.id);
        }
        if (Date.now() < lockUntil.current) return;

        let best: SectionId | null = null;
        let bestTop = Infinity;
        for (const el of elements) {
          if (!visible.has(el.id)) continue;
          const top = Math.abs(el.getBoundingClientRect().top - 72);
          if (top < bestTop) {
            bestTop = top;
            best = el.id as SectionId;
          }
        }
        if (best) setActive(best);
      },
      {
        rootMargin: '-72px 0px -45% 0px',
        threshold: [0, 0.15, 0.35, 0.55],
      },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onHome, hash]);

  return [active, pin];
}

export function SiteNav() {
  const { pathname } = useLocation();
  const onHome = pathname === '/';
  const onContact = pathname === '/contact';
  const onDownloadPage = pathname === '/download';
  const [activeSection, pinSection] = useActiveLandingSection(onHome);
  const downloadCurrent = onDownloadPage || activeSection === 'download';

  return (
    <nav className="nav nav-landing">
      <div className="nav-inner">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden>🔥</span>
          <span>RedfireForge</span>
        </Link>
        <div className="nav-links">
          {SECTIONS.map((section) => {
            const current = onHome && activeSection === section.id;
            return (
              <a
                key={section.hash}
                href={onHome ? section.hash : `/${section.hash}`}
                aria-current={current ? 'location' : undefined}
                onClick={() => pinSection(section.id)}
              >
                {section.label}
              </a>
            );
          })}
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
            <a
              href="#download"
              className="lp-btn lp-btn-primary lp-btn-sm"
              aria-current={downloadCurrent ? 'location' : undefined}
              onClick={() => pinSection('download')}
            >
              ↓ Download
            </a>
          ) : (
            <Link
              to="/download"
              className="lp-btn lp-btn-primary lp-btn-sm"
              aria-current={onDownloadPage ? 'page' : undefined}
            >
              ↓ Download
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
