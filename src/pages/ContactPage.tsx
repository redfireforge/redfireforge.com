import { SiteNav } from '../components/SiteNav';

const SUPPORT_EMAIL = 'support@redfireforge.com';
const GITHUB_ISSUES = 'https://github.com/redfireforge/redfire-forge/issues';
const GITHUB_DISCUSSIONS = 'https://github.com/redfireforge/redfire-forge/discussions';

const CHANNELS = [
  {
    icon: '🐛',
    title: 'Bug Reports',
    desc: 'Unexpected behavior, crashes, or broken features',
    bestFor: ['Reproducible bugs', 'Error messages or stack traces', 'Platform-specific issues (macOS, Windows, Linux)'],
    action: 'Open a GitHub Issue',
    href: GITHUB_ISSUES,
    response: 'Triaged within a few days',
    responseDetail: 'Severity determines priority — critical bugs are addressed first.',
    external: true,
  },
  {
    icon: '💬',
    title: 'Questions & Ideas',
    desc: 'Feature requests, workflow questions, and general discussion',
    bestFor: ['How-to questions', 'Feature suggestions', 'Show & tell — share what you built'],
    action: 'Start a Discussion',
    href: GITHUB_DISCUSSIONS,
    response: 'Community replies vary; maintainer check-ins weekly',
    responseDetail: 'Open discussions get the most eyes and benefit everyone.',
    external: true,
  },
  {
    icon: '✉',
    title: 'Private & Sensitive',
    desc: 'Security disclosures, licensing, or anything not suitable for public forums',
    bestFor: ['Security vulnerabilities', 'Commercial or licensing inquiries', 'Anything you prefer to keep private'],
    action: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    response: '1–2 business days for general inquiries',
    responseDetail: 'Security reports are treated as highest priority.',
    external: false,
  },
];

const FAQ = [
  {
    q: 'Is RedfireForge really free?',
    a: 'Yes — the desktop app, web app, CLI, and all source code are free and open source under the MIT license. No account required, no telemetry, no usage limits.',
  },
  {
    q: 'Do you offer enterprise or team support?',
    a: 'We don\'t have a formal enterprise plan yet. For team-specific questions or volume inquiries, email us directly and we\'ll work something out.',
  },
  {
    q: 'How do I report a security vulnerability?',
    a: 'Please do not open a public GitHub issue. Email support@redfireforge.com with details and we\'ll respond as a priority.',
  },
  {
    q: 'Can I request a specific protocol or integration?',
    a: 'Absolutely — open a GitHub Discussion under the "Ideas" category. Upvotes help us prioritize.',
  },
];

export function ContactPage() {
  return (
    <>
      <SiteNav />
      <main className="wrap contact-page">

        <header className="contact-header">
          <p className="contact-label">Support</p>
          <h1>How can we help?</h1>
          <p className="contact-sub">
            RedfireForge is built by a small team. Pick the right channel below
            and you'll get the fastest, most useful response.
          </p>
        </header>

        <div className="contact-channels">
          {CHANNELS.map((ch) => (
            <a
              key={ch.title}
              href={ch.href}
              className="contact-channel"
              target={ch.external ? '_blank' : undefined}
              rel={ch.external ? 'noopener noreferrer' : undefined}
            >
              <div className="contact-channel-icon" aria-hidden>{ch.icon}</div>
              <div className="contact-channel-body">
                <p className="contact-channel-title">{ch.title}</p>
                <p className="contact-channel-desc">{ch.desc}</p>
                <ul className="contact-channel-best-for">
                  {ch.bestFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="contact-channel-footer">
                  <span className="contact-channel-action">{ch.action} →</span>
                  <span className="contact-channel-response">
                    <span className="contact-response-dot" aria-hidden /> {ch.response}
                  </span>
                </div>
                <p className="contact-channel-response-detail">{ch.responseDetail}</p>
              </div>
            </a>
          ))}
        </div>

        <section className="contact-faq">
          <h2 className="contact-faq-heading">Frequently asked</h2>
          <div className="contact-faq-grid">
            {FAQ.map((item) => (
              <div key={item.q} className="contact-faq-item">
                <p className="contact-faq-q">{item.q}</p>
                <p className="contact-faq-a">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}
