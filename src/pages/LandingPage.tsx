import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { detectOSTarget, platformLabel } from '../utils/detectOS';
import {
  fetchLatestRelease,
  findAsset,
  getDownloadUrl,
  formatReleaseDate,
  type LatestRelease,
} from '../utils/githubRelease';
import { DownloadPanel } from '../components/DownloadPanel';
import '../styles/landing.css';

const GITHUB_REPO = 'https://github.com/redfireforge/redfireforge-public';
const GITHUB_RELEASES = 'https://github.com/redfireforge/redfireforge-public/releases';
const APP_URL = 'https://app.redfireforge.com';
const DEMO_URL = 'https://demo.redfireforge.com';

// ── compact hook for embedded download section ──────────────

function useLatestRelease() {
  const [release, setRelease] = useState<LatestRelease | null>(null);
  const detected = useMemo(() => detectOSTarget(), []);

  useEffect(() => {
    let cancelled = false;
    fetchLatestRelease().then((data) => {
      if (!cancelled) setRelease(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const primaryAsset = release ? findAsset(release.assets, detected) : null;
  const primaryUrl = release ? getDownloadUrl(release.assets, detected, release.tagName) : null;
  return { release, detected, primaryUrl, primaryName: primaryAsset?.name };
}

// ── sub-components ──────────────────────────────────────────

function LandingNav() {
  return (
    <nav className="nav nav-landing">
      <div className="nav-inner">
        <Link to="/" className="logo">
          <span className="logo-mark" aria-hidden>🔥</span>
          <span>RedfireForge</span>
        </Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#protocols">Protocols</a>
          <a href="#compare">Compare</a>
          <a href="#surfaces">Web vs Desktop</a>
          <a href="#cli">CLI</a>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="nav-cta">
          <a href={GITHUB_REPO} className="lp-btn lp-btn-ghost lp-btn-sm" target="_blank" rel="noopener noreferrer">
            ★ GitHub
          </a>
          <a href="#download" className="lp-btn lp-btn-primary lp-btn-sm">↓ Download</a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const { release, detected, primaryUrl, primaryName } = useLatestRelease();
  const heroDownloadLabel = `↓ Download for ${platformLabel(detected)}`;
  const heroHref = primaryUrl ?? `${GITHUB_RELEASES}/latest`;

  return (
    <header className="hero">
      <div className="lp-wrap hero-inner">
        <div className="eyebrow">◆ Open source · AGPL-3.0 · No account required</div>

        <h1>
          Six protocols.<br />
          <span className="hero-grad">One workbench.</span>
        </h1>

        <p className="hero-sub">
          RedfireForge is a visual API testing &amp; load-testing workbench for{' '}
          <strong>HTTP, GraphQL, gRPC, WebSocket, SSE, and Kafka</strong> — with a
          drag-and-drop workflow designer, a built-in mock server, and a CLI that runs
          the same engine in your pipeline.
        </p>

        <p className="hero-tagline">Fire. Measure. Validate.</p>

        <div className="hero-actions">
          <a href={heroHref} className="lp-btn lp-btn-primary lp-btn-lg" download={primaryName}>
            {heroDownloadLabel}
          </a>
          <a href={APP_URL} className="lp-btn lp-btn-ghost lp-btn-lg">
            Try it in your browser →
          </a>
        </div>

        <p className="hero-note">
          Free forever · macOS · Windows · Linux · or{' '}
          <code>npm i -g redfireforge-cli</code>
        </p>

        {release && (
          <p className="hero-note" style={{ marginTop: 6 }}>
            Latest: v{release.version} · {formatReleaseDate(release.publishedAt)}
          </p>
        )}

        <div className="trust">
          <span className="trust-item"><b>6</b> protocols, natively</span>
          <span className="trust-item"><b>151</b> interactive lessons</span>
          <span className="trust-item"><b>158</b> ready-to-run samples</span>
          <span className="trust-item">Desktop <b>·</b> Browser <b>·</b> CLI</span>
          <span className="trust-item">🔒 <b>Local-first</b> — your data never leaves your machine</span>
        </div>

        <div className="hero-shot">
          <img
            src="/screenshots/workflow-designer.png"
            alt="RedfireForge Workflow Designer — drag-and-drop canvas for chaining API requests"
            loading="eager"
          />
        </div>
      </div>
    </header>
  );
}

function StatsStrip() {
  return (
    <div className="lp-band stats-strip">
      <div className="lp-wrap">
        <div className="stats-grid">
          <div className="stat-cell"><div className="stat-n">6</div><div className="stat-l">Protocols in one tool</div></div>
          <div className="stat-cell"><div className="stat-n">151</div><div className="stat-l">Guided lessons</div></div>
          <div className="stat-cell"><div className="stat-n">158</div><div className="stat-l">Ready-to-run samples</div></div>
          <div className="stat-cell"><div className="stat-n">24</div><div className="stat-l">Assertion operators</div></div>
          <div className="stat-cell"><div className="stat-n">$0</div><div className="stat-l">Forever, open source</div></div>
        </div>
      </div>
    </div>
  );
}

function ProblemSection() {
  return (
    <section className="lp-section">
      <div className="lp-wrap">
        <div className="lp-section-head">
          <div className="lp-section-label">The problem</div>
          <h2>Your API stack outgrew your tools</h2>
          <p>
            Modern services speak six protocols. Most teams end up juggling five different tools —
            each with its own config format, its own auth setup, and no shared results.
          </p>
        </div>

        <div className="swap">
          <div className="swap-col before">
            <div className="swap-title">Today — five tools, five silos</div>
            <div className="tool-row"><span className="tool-tag">REST</span> Postman or Insomnia</div>
            <div className="tool-row"><span className="tool-tag">Load</span> k6 or JMeter scripts</div>
            <div className="tool-row"><span className="tool-tag">gRPC</span> a separate CLI client</div>
            <div className="tool-row"><span className="tool-tag">Kafka</span> console producer / consumer</div>
            <div className="tool-row"><span className="tool-tag">Mocks</span> Mockoon or WireMock</div>
          </div>

          <div className="swap-arrow" aria-hidden>→</div>

          <div className="swap-col after">
            <div className="swap-title">With RedfireForge — one workbench</div>
            <div className="one-tool">
              <div className="one-tool-logo" aria-hidden>🔥</div>
              <div className="one-tool-name">RedfireForge</div>
              <div className="one-tool-chips">
                {['HTTP', 'GraphQL', 'gRPC', 'WebSocket', 'SSE', 'Kafka', 'Load testing', 'Mock server', 'CLI'].map((c) => (
                  <span key={c} className="chip">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURE_ROWS = [
  {
    kicker: '◈ Requests',
    title: 'An ad-hoc client that respects your time',
    desc: 'A familiar Postman-style workspace with a live JSON response tree, environment variables, and one-click promotion into a reusable test or workflow.',
    bullets: [
      '<b>Live response tree</b> — click any node to copy its JSONPath',
      '<b>Multi-environment</b> base URLs resolved per collection',
      '<b>Promote to test</b> — turn any request into an assertion-backed scenario',
      '<b>cURL in / cURL out</b> — paste to import, copy to share',
    ],
    img: '/screenshots/requests-workspace.png',
    imgAlt: 'Requests workspace showing a live JSON response tree',
    rev: false,
    desktopOnly: false,
  },
  {
    kicker: '◈ Workflow Designer',
    title: 'Chain requests visually — no boilerplate',
    desc: 'Drag nodes onto a canvas, wire them together, and extract variables from one response into the next. Fork, join, branch on conditions, and loop over data sets.',
    bullets: [
      '<b>Parallel fork / join</b> with a real topological execution engine',
      '<b>Visual data mapper</b> — drag a source field onto a target field',
      '<b>Step-through debugging</b> with per-node request/response inspection',
      '<b>Auto-layout</b> and version history with visual diffs',
    ],
    img: '/screenshots/workflow-designer.png',
    imgAlt: 'Workflow Designer canvas with parallel fork/join nodes',
    rev: true,
    desktopOnly: false,
  },
  {
    kicker: '◈ API Mock Studio',
    kicker2: '· desktop',
    title: 'Stand up a mock server in seconds',
    desc: 'Rule-based routing, templated responses, and a live request journal — so you can build against an API that doesn\'t exist yet, or reproduce a failure on demand.',
    bullets: [
      '<b>Rule, sequence, weighted & stateful</b> response selection',
      '<b>Fault injection</b> — latency, timeouts, connection resets',
      '<b>Live journal</b> with header redaction for safe sharing',
      '<b>Import an OpenAPI spec</b> and get a working mock instantly',
    ],
    img: '/screenshots/api-mock-studio.png',
    imgAlt: 'API Mock Studio showing rule-based routing and live journal',
    rev: false,
    desktopOnly: true,
  },
  {
    kicker: '◈ Load testing & results',
    title: 'Load testing on every protocol — not just HTTP',
    desc: 'Configure concurrency, iterations, think time, and ramp — then read percentiles, throughput, and per-assertion pass/fail in one explorer.',
    bullets: [
      '<b>p50 / p90 / p95 / p99</b> percentiles and throughput charts',
      '<b>24 assertion operators</b> plus a full expression DSL',
      '<b>Bottleneck analysis</b> — find the slowest node in a workflow',
      '<b>Results Explorer</b> — replay any iteration node-by-node',
    ],
    img: '/screenshots/test-runner-results.png',
    imgAlt: 'Test runner results showing p99 percentiles and assertion pass/fail',
    rev: true,
    desktopOnly: false,
  },
  {
    kicker: '◈ Protocol studios',
    title: 'A first-class studio per protocol',
    desc: 'Not a generic request box with a dropdown. Each protocol gets a purpose-built workspace that understands its semantics.',
    bullets: [
      '<b>GraphQL</b> — schema explorer, query builder, introspection diffing',
      '<b>gRPC</b> — reflection-based discovery, all four streaming modes',
      '<b>Kafka</b> — produce, consume, inspect topics, manage clusters',
      '<b>WebSocket & SSE</b> — live message console with schema validation',
    ],
    img: '/screenshots/grpc-studio.png',
    imgAlt: 'gRPC Studio showing reflection-based service discovery',
    rev: false,
    desktopOnly: false,
  },
  {
    kicker: '◈ API Catalog',
    title: 'Your OpenAPI specs, browsable and runnable',
    desc: 'Import Swagger 2.0 or OpenAPI 3.x, browse every endpoint, and execute it directly — then diff versions to see exactly what changed between releases.',
    bullets: [
      '<b>Try It</b> execution straight from the spec',
      '<b>Version diffing</b> with structural change summaries',
      '<b>Convert & upgrade</b> Swagger 2 → OpenAPI 3.0 / 3.1 / 3.2',
      '<b>Sample bodies</b> generated from schemas automatically',
    ],
    img: '/screenshots/api-catalog.png',
    imgAlt: 'API Catalog showing endpoint browsing and version diff',
    rev: true,
    desktopOnly: false,
  },
  {
    kicker: '◈ Learning Hub',
    title: 'Learn by doing, not by reading',
    desc: 'An optional build ships 151 guided lessons that drive the real UI — clicking real buttons, filling real forms. Not a slideshow, not a video.',
    bullets: [
      '<b>Every protocol covered</b> — from first request to distributed load',
      '<b>28 learning paths</b> that build on each other',
      '<b>Live studio bridges</b> — the lesson drives the actual app',
      `<b>Try it now</b> at <a href="${DEMO_URL}" style="color:var(--primary)">${DEMO_URL.replace('https://', '')}</a>`,
    ],
    img: '/screenshots/learning-hub.png',
    imgAlt: 'Learning Hub showing a guided lesson driving the live app',
    rev: false,
    desktopOnly: false,
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="lp-section lp-band">
      <div className="lp-wrap">
        <div className="lp-section-head">
          <div className="lp-section-label">What's inside</div>
          <h2>Built for the whole request lifecycle</h2>
          <p>
            Explore an API, chain it into a workflow, mock what isn't built yet, then
            hammer it under load — without ever leaving the app.
          </p>
        </div>

        {FEATURE_ROWS.map((row, i) => (
          <div key={i} className={`frow${row.rev ? ' rev' : ''}`}>
            <div className="fcopy">
              <div className="fkicker">
                {row.kicker}
                {row.desktopOnly && <span className="fkicker-desktop"> · desktop</span>}
              </div>
              <h3>{row.title}</h3>
              <p>{row.desc}</p>
              <ul className="fbullets">
                {row.bullets.map((b, j) => (
                  <li key={j} dangerouslySetInnerHTML={{ __html: b }} />
                ))}
              </ul>
            </div>
            <div className="fshot">
              <img src={row.img} alt={row.imgAlt} loading="lazy" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProtocolMatrix() {
  const protocols = [
    'HTTP / REST', 'GraphQL', 'gRPC', 'WebSocket', 'Server-Sent Events', 'Kafka',
  ];
  return (
    <section id="protocols" className="lp-section">
      <div className="lp-wrap">
        <div className="lp-section-head">
          <div className="lp-section-label">Protocol support</div>
          <h2>Every protocol, every surface</h2>
          <p>The same execution engine powers the desktop app, the browser build, and the CLI.</p>
        </div>
        <div className="tablewrap">
          <table className="lp-table">
            <thead>
              <tr>
                <th>Protocol</th>
                <th>Visual designer</th>
                <th>Load testing</th>
                <th>Assertions</th>
                <th>CLI</th>
              </tr>
            </thead>
            <tbody>
              {protocols.map((p) => (
                <tr key={p}>
                  <td>{p}</td>
                  <td className="td-y">✓</td>
                  <td className="td-y">✓</td>
                  <td className="td-y">✓</td>
                  <td className="td-y">✓</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CompareSection() {
  const rows = [
    { cap: 'REST', us: '✓', k6: '✓', pm: '✓', br: '✓', jm: '✓', usCls: 'td-y', k6Cls: 'td-y', pmCls: 'td-y', brCls: 'td-y', jmCls: 'td-y' },
    { cap: 'GraphQL', us: '✓', k6: 'partial', pm: '✓', br: '✓', jm: '✓', usCls: 'td-y', k6Cls: 'td-p', pmCls: 'td-y', brCls: 'td-y', jmCls: 'td-y' },
    { cap: 'gRPC', us: '✓', k6: '✓', pm: '✓', br: '✓', jm: 'plugin', usCls: 'td-y', k6Cls: 'td-y', pmCls: 'td-y', brCls: 'td-y', jmCls: 'td-p' },
    { cap: 'WebSocket', us: '✓', k6: '✓', pm: '✓', br: '✓', jm: 'plugin', usCls: 'td-y', k6Cls: 'td-y', pmCls: 'td-y', brCls: 'td-y', jmCls: 'td-p' },
    { cap: 'Kafka', us: '✓', k6: 'extension', pm: '✕', br: '✕', jm: 'plugin', usCls: 'td-y', k6Cls: 'td-p', pmCls: 'td-n', brCls: 'td-n', jmCls: 'td-p' },
    { cap: 'Server-Sent Events', us: '✓', k6: '✕', pm: '✕', br: '✕', jm: '✕', usCls: 'td-y', k6Cls: 'td-n', pmCls: 'td-n', brCls: 'td-n', jmCls: 'td-n' },
    { cap: 'API mock server', us: '✓', k6: '✕', pm: '✓', br: '✓', jm: 'basic', usCls: 'td-y', k6Cls: 'td-n', pmCls: 'td-y', brCls: 'td-y', jmCls: 'td-p' },
    { cap: 'Visual workflow designer', us: '✓', k6: 'code only', pm: '✓', br: '✕', jm: '✕', usCls: 'td-y', k6Cls: 'td-p', pmCls: 'td-y', brCls: 'td-n', jmCls: 'td-n' },
    { cap: 'Load testing', us: '✓', k6: '✓', pm: '✕', br: '✕', jm: '✓', usCls: 'td-y', k6Cls: 'td-y', pmCls: 'td-n', brCls: 'td-n', jmCls: 'td-y' },
    { cap: 'Desktop app', us: '✓', k6: '✕', pm: '✓', br: '✓', jm: '✓', usCls: 'td-y', k6Cls: 'td-n', pmCls: 'td-y', brCls: 'td-y', jmCls: 'td-y' },
    { cap: 'CLI for CI/CD', us: '✓', k6: '✓', pm: '✓', br: '✓', jm: '✓', usCls: 'td-y', k6Cls: 'td-y', pmCls: 'td-y', brCls: 'td-y', jmCls: 'td-y' },
    { cap: 'Open source', us: '✓ AGPL', k6: '✓ AGPL', pm: '✕', br: '✓ MIT', jm: '✓ Apache', usCls: 'td-y', k6Cls: 'td-y', pmCls: 'td-n', brCls: 'td-y', jmCls: 'td-y' },
  ];

  return (
    <section id="compare" className="lp-section lp-band">
      <div className="lp-wrap">
        <div className="lp-section-head">
          <div className="lp-section-label">How it compares</div>
          <h2>Why teams switch</h2>
          <p>
            Other tools are excellent at one job. RedfireForge is built for teams whose
            services no longer speak just HTTP.
          </p>
        </div>
        <div className="tablewrap">
          <table className="lp-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th className="us">RedfireForge</th>
                <th>k6</th>
                <th>Postman</th>
                <th>Bruno</th>
                <th>JMeter</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.cap}>
                  <td>{r.cap}</td>
                  <td className={`td-us ${r.usCls}`}>{r.us}</td>
                  <td className={r.k6Cls}>{r.k6}</td>
                  <td className={r.pmCls}>{r.pm}</td>
                  <td className={r.brCls}>{r.br}</td>
                  <td className={r.jmCls}>{r.jm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          Checked against each project's own documentation, August 2026. Competitor features move fast — verify before relying on this table.
        </p>
      </div>
    </section>
  );
}

function SurfacesSection() {
  return (
    <section id="surfaces" className="lp-section">
      <div className="lp-wrap">
        <div className="lp-section-head">
          <div className="lp-section-label">Pick your surface</div>
          <h2>Start in the browser. Go deeper on the desktop.</h2>
          <p>
            Both run the same engine. The desktop app adds everything a browser sandbox
            fundamentally cannot do — local ports, raw sockets, and your private network.
          </p>
        </div>
        <div className="surfaces-grid">
          <div className="surface-card">
            <div className="surface-head">
              <span className="surface-icon" aria-hidden>🌐</span>
              <h4>Browser</h4>
            </div>
            <div className="surface-url">app.redfireforge.com — nothing to install</div>
            <ul className="caps">
              <li className="on">HTTP / REST testing</li>
              <li className="on">GraphQL studio</li>
              <li className="on">Server-Sent Events</li>
              <li className="on">WebSocket console</li>
              <li className="on">Workflow designer &amp; load runs</li>
              <li className="off">API Mock server <span style={{ opacity: 0.7 }}>— needs a local port</span></li>
              <li className="off">gRPC <span style={{ opacity: 0.7 }}>— needs HTTP/2 framing</span></li>
              <li className="off">Kafka <span style={{ opacity: 0.7 }}>— needs raw TCP</span></li>
              <li className="off">Private / VPN endpoints</li>
            </ul>
          </div>

          <div className="surface-card best">
            <div className="surface-head">
              <span className="surface-icon" aria-hidden>🖥️</span>
              <h4>Desktop app</h4>
            </div>
            <div className="surface-url">macOS · Windows · Linux — free download</div>
            <ul className="caps">
              <li className="on">Everything in the browser, plus…</li>
              <li className="on"><b>API Mock server</b> on a real local port</li>
              <li className="on"><b>gRPC</b> with reflection &amp; streaming</li>
              <li className="on"><b>Kafka</b> produce / consume / admin</li>
              <li className="on"><b>Private &amp; VPN endpoints</b> — traffic never leaves your machine</li>
              <li className="on">Local file system for specs &amp; data sets</li>
              <li className="on">Optional Learning Hub build</li>
            </ul>
          </div>

          <div className="surface-card">
            <div className="surface-head">
              <span className="surface-icon" aria-hidden>⌨️</span>
              <h4>CLI</h4>
            </div>
            <div className="surface-url">npm i -g redfireforge-cli</div>
            <ul className="caps">
              <li className="on">Same engine as the GUI</li>
              <li className="on">YAML test definitions in version control</li>
              <li className="on">GitHub Actions, GitLab, Jenkins, Azure DevOps</li>
              <li className="on">JUnit &amp; JSON reporters</li>
              <li className="on">Exit codes for pipeline gating</li>
              <li className="off">Visual designer <span style={{ opacity: 0.7 }}>— headless by design</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CliSection() {
  return (
    <section id="cli" className="lp-section lp-band">
      <div className="lp-wrap">
        <div className="cli-cols">
          <div>
            <div className="lp-section-label" style={{ textAlign: 'left' }}>Same engine, headless</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.4vw, 2.4rem)', fontWeight: 740, letterSpacing: '-0.022em', lineHeight: 1.16, marginBottom: 16 }}>
              Design it visually.<br />Run it in your pipeline.
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 22 }}>
              Export any workflow to YAML, commit it, and run it in CI with the exact same
              execution engine the desktop app uses. No translation layer, no drift between
              what you tested locally and what runs on every merge.
            </p>
            <ul className="fbullets" style={{ marginBottom: 26 }}>
              <li><b>One binary</b> — no JVM, no Docker required</li>
              <li><b>JUnit output</b> that CI dashboards already understand</li>
              <li><b>Fails the build</b> on assertion or threshold breach</li>
            </ul>
            <a href={`${GITHUB_REPO}#cli`} className="lp-btn lp-btn-ghost" target="_blank" rel="noopener noreferrer">
              Read the CLI reference →
            </a>
          </div>

          <div>
            <div className="code-block">
              <div className="code-bar">
                <span className="dot" style={{ background: '#ff5f57' }} />
                <span className="dot" style={{ background: '#febc2e' }} />
                <span className="dot" style={{ background: '#28c840' }} />
                <span className="code-file">api-tests.yaml</span>
              </div>
              <pre dangerouslySetInnerHTML={{ __html: `<span class="c-key">name</span>: Checkout API — smoke
<span class="c-key">baseUrl</span>: <span class="c-str">https://api.example.com</span>
<span class="c-key">tests</span>:
  - <span class="c-key">name</span>: List users
    <span class="c-key">method</span>: GET
    <span class="c-key">url</span>: <span class="c-str">/users</span>
    <span class="c-key">assertions</span>:
      - <span class="c-key">type</span>: status
        <span class="c-key">expected</span>: <span class="c-str">"200"</span>
      - <span class="c-key">type</span>: jsonPath
        <span class="c-key">path</span>: <span class="c-str">$.data[0].id</span>
        <span class="c-key">operator</span>: exists
      - <span class="c-key">type</span>: responseTime
        <span class="c-key">lessThan</span>: <span class="c-num">400</span>` }} />
            </div>

            <div className="code-block">
              <div className="code-bar">
                <span className="dot" style={{ background: '#ff5f57' }} />
                <span className="dot" style={{ background: '#febc2e' }} />
                <span className="dot" style={{ background: '#28c840' }} />
                <span className="code-file">.github/workflows/api-tests.yml</span>
              </div>
              <pre dangerouslySetInnerHTML={{ __html: `<span class="c-com"># Gate every PR on your API contract</span>
- <span class="c-key">run</span>: npm i -g redfireforge-cli
- <span class="c-key">run</span>: rff run api-tests.yaml \\
    --reporter junit \\
    --out results.xml` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DownloadSection() {
  return (
    <section id="download" className="lp-section lp-download">
      <div className="lp-wrap lp-dl-inner">
        <DownloadPanel embedded />
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  {
    q: 'Is it really free? What\'s the catch?',
    a: 'Yes — RedfireForge is open source under AGPL-3.0. There\'s no paid tier, no seat limit, and no feature gate. You can read every line of the source, build it yourself, and fork it.',
    open: true,
  },
  {
    q: 'Does it send my requests or data anywhere?',
    a: 'No. The desktop app is local-first: collections, environments, and results are stored on your machine, and requests go directly from your machine to your target. There is no telemetry and no account system.',
    open: false,
  },
  {
    q: 'Can I test APIs on my corporate network or behind a VPN?',
    a: 'Yes — with the desktop app. Because it runs on your machine, it inherits your network access, including VPN routes and internal DNS. The browser version proxies through a public server and cannot reach private endpoints.',
    open: false,
  },
  {
    q: 'Why do API Mock, gRPC, and Kafka require the desktop app?',
    a: 'Browser sandboxes cannot bind to local ports, open raw TCP sockets, or control HTTP/2 framing — which those three features fundamentally need. Everything else (REST, GraphQL, SSE, WebSocket, workflows, load runs) works in the browser.',
    open: false,
  },
  {
    q: 'How is this different from Postman or k6?',
    a: 'Postman is excellent for exploring REST APIs but has no load testing. k6 is excellent at load testing but is code-only with no visual designer. RedfireForge covers both, plus Kafka and SSE that neither supports, in a single tool with one shared results model.',
    open: false,
  },
  {
    q: 'Can I use it in CI without a GUI?',
    a: (<>Install <code>redfireforge-cli</code> from npm, commit your test definitions as YAML, and run <code>rff run</code> in any pipeline. It emits JUnit or JSON and sets a non-zero exit code when assertions fail.</>),
    open: false,
  },
  {
    q: 'Which platforms are supported?',
    a: 'macOS (Apple Silicon and Intel), Windows x64, and Linux (AppImage and .deb). The browser build runs in any modern browser, and the CLI runs anywhere Node.js 20+ runs.',
    open: false,
  },
];

function FaqSection() {
  return (
    <section className="lp-section">
      <div className="lp-wrap">
        <div className="lp-section-head">
          <div className="lp-section-label">FAQ</div>
          <h2>Questions, answered</h2>
        </div>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, i) => (
            <details key={i} open={item.open}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

const WAITLIST_URL = 'https://tally.so/r/1AaNzQ';

function WaitlistCta() {
  return (
    <section className="lp-section lp-waitlist">
      <div className="lp-wrap waitlist-inner">
        <div className="waitlist-badge">Coming soon</div>
        <h2 className="waitlist-heading">RedfireForge Cloud</h2>
        <p className="waitlist-sub">
          Run load tests from globally distributed nodes, share collections with your team,
          and manage environments without leaving the browser — no desktop required.
        </p>
        <a
          href={WAITLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="lp-btn lp-btn-primary lp-btn-lg waitlist-btn"
        >
          Join the waitlist →
        </a>
        <p className="waitlist-note">No spam. One email when it launches.</p>
      </div>
    </section>
  );
}

function FinalCta() {
  const { detected, primaryUrl, primaryName } = useLatestRelease();
  const mainHref = primaryUrl ?? `${GITHUB_RELEASES}/latest`;
  return (
    <div className="lp-band final-cta">
      <div className="lp-wrap final-inner">
        <h2>Fire. Measure. Validate.</h2>
        <p>Stop stitching five tools together. Start with one.</p>
        <div className="hero-actions">
          <a href={mainHref} className="lp-btn lp-btn-primary lp-btn-lg" download={primaryName}>
            ↓ Download for {platformLabel(detected)} — free
          </a>
          <a href={DEMO_URL} className="lp-btn lp-btn-ghost lp-btn-lg">
            Explore the Learning Hub →
          </a>
        </div>
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="lp-wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <span className="logo-mark" aria-hidden>🔥</span>
              <span>RedfireForge</span>
            </Link>
            <p>
              An open-source visual API testing and load-testing workbench for teams whose
              services speak more than HTTP.
            </p>
          </div>

          <div className="footer-col">
            <h5>Product</h5>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#protocols">Protocols</a></li>
              <li><Link to="/download">Download</Link></li>
              <li><a href={APP_URL}>Web app</a></li>
              <li><a href={DEMO_URL}>Learning Hub demo</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Developers</h5>
            <ul>
              <li><a href={`${GITHUB_REPO}#readme`} target="_blank" rel="noopener noreferrer">Documentation</a></li>
              <li><a href={`${GITHUB_REPO}#cli`} target="_blank" rel="noopener noreferrer">CLI reference</a></li>
              <li><a href={`${GITHUB_REPO}/blob/master/CHANGELOG.md`} target="_blank" rel="noopener noreferrer">Changelog</a></li>
              <li><a href={`${GITHUB_REPO}/blob/master/CONTRIBUTING.md`} target="_blank" rel="noopener noreferrer">Contributing</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Project</h5>
            <ul>
              <li><a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">GitHub</a></li>
              <li><a href={`${GITHUB_REPO}/issues`} target="_blank" rel="noopener noreferrer">Issues</a></li>
              <li><a href={`${GITHUB_REPO}/blob/master/SECURITY.md`} target="_blank" rel="noopener noreferrer">Security policy</a></li>
              <li><a href={`${GITHUB_REPO}/blob/master/LICENSE`} target="_blank" rel="noopener noreferrer">License (AGPL-3.0)</a></li>
              <li><a href={`${GITHUB_REPO}/blob/master/PRIVACY.md`} target="_blank" rel="noopener noreferrer">Privacy</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 RedfireForge · AGPL-3.0</span>
          <span>Built with Tauri, React &amp; Rust · Local-first by design</span>
        </div>
      </div>
    </footer>
  );
}

// ── main export ──────────────────────────────────────────────

export function LandingPage() {
  return (
    <>
      <LandingNav />
      <Hero />
      <StatsStrip />
      <ProblemSection />
      <FeaturesSection />
      <ProtocolMatrix />
      <CompareSection />
      <SurfacesSection />
      <CliSection />
      <DownloadSection />
      <FaqSection />
      <WaitlistCta />
      <FinalCta />
      <SiteFooter />
    </>
  );
}
