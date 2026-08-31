import { Link } from 'react-router-dom';

export function SiteNav() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/download" className="logo">
          <span className="logo-mark" aria-hidden>
            🔥
          </span>
          <span>RedfireForge</span>
        </Link>
        <div className="nav-links">
          <a href="https://app.redfireforge.com">Web App</a>
          <a href="https://demo.redfireforge.com">Demo</a>
          <a href="https://github.com/redfireforge/redfire-forge">GitHub</a>
        </div>
      </div>
    </nav>
  );
}
