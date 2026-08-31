import { useState } from 'react';
import { SiteNav } from '../components/SiteNav';

const SUPPORT_EMAIL = 'support@redfireforge.com';

export function ContactPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      subject: subject || 'RedfireForge Support Request',
      body: message,
    });
    window.location.href = `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
  }

  return (
    <>
      <SiteNav />
      <main className="wrap contact-page">
        <header className="contact-header">
          <p className="contact-label">Support</p>
          <h1>Contact Us</h1>
          <p className="contact-sub">
            Have a question, found a bug, or need help getting started?<br />
            We'll get back to you as soon as possible.
          </p>
        </header>

        <div className="contact-card">
          <form className="contact-form" onSubmit={handleSend}>
            <div className="contact-field">
              <label htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                type="text"
                placeholder="e.g. Issue with gRPC test runner"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                rows={8}
                placeholder="Describe your question or issue in detail…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="contact-submit">
              Open in Email Client →
            </button>
          </form>

          <div className="contact-divider" />

          <div className="contact-direct">
            <p className="contact-direct-label">Or email us directly</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="contact-email-link">
              {SUPPORT_EMAIL}
            </a>
            <p className="contact-note">
              Clicking "Open in Email Client" above will pre-fill your email app with the subject and message.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
