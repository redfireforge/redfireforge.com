import { Link } from 'react-router-dom';

export function SiteNav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden>
            🔥
          </span>
          <span>RedfireForge</span>
        </Link>
        <div className="nav-links">
          <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <a href="https://app.redfireforge.com">Web App</a>
          <a href="https://demo.redfireforge.com">Demo</a>
          <a href="https://github.com/redfireforge/redfireforge-public">GitHub</a>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
    </nav>
  );
}
