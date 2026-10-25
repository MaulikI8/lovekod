import AnimatedFooter from './ui/AnimatedFooter';
import { WhatsAppIcon } from './Icons';
import { Globe, ArrowUpRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

function InstagramIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  const { siteSettings } = useStore();

  const socialHandle = siteSettings?.socialHandle || '@lovekod.np';
  const socialInstagram = siteSettings?.socialInstagram || 'https://instagram.com/lovekod.np';
  const socialTiktok = siteSettings?.socialTiktok || 'https://tiktok.com/@lovekod.np';
  const socialFacebook = siteSettings?.socialFacebook || 'https://facebook.com/lovekod.np';
  const websiteUrl = siteSettings?.websiteUrl || 'https://www.lovekod.com';
  const rawDomain = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const waPhone = (siteSettings?.contactWhatsapp || '9779717567133').replace(/[^\d]/g, '');
  const waLink = `https://wa.me/${waPhone}?text=Namaste%20LoveKod%2C%20I%20would%20like%20to%20inquire%20about%20festive%20kurtha%20sets.`;

  return (
    <AnimatedFooter>
      <footer className="footer" style={{ borderTop: 'none', background: 'var(--night)', color: 'var(--paper)' }}>
        {/* Top Atelier Bar */}
        <div style={{ maxWidth: 'var(--container)', margin: '0 auto 48px', paddingBottom: '32px', borderBottom: '1px solid var(--line)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(197, 160, 89, 0.12)', color: 'var(--gold)' }}>
              <Sparkles size={16} />
            </span>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', letterSpacing: '0.02em', color: 'var(--paper)' }}>
                LoveKod Atelier &amp; Concierge
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Handcrafted Festive Kurtha Sets • Delivering Across All 77 Districts
              </div>
            </div>
          </div>

          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '2px',
              border: '1px solid var(--gold)',
              background: 'rgba(197, 160, 89, 0.08)',
              color: 'var(--gold)',
              fontSize: '0.82rem',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
            }}
            className="hover:bg-[var(--gold)] hover:text-[var(--night)]"
          >
            <Globe size={14} />
            <span>{rawDomain}</span>
            <ArrowUpRight size={13} />
          </a>
        </div>

        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo" style={{ marginBottom: '14px' }}>
              <img src="/images/logo.jpg" alt="LoveKod" style={{ height: '42px', borderRadius: '2px', border: '1px solid var(--line)' }} />
              <div className="logo-text-group">
                <span className="logo-text" style={{ fontSize: '1.35rem', letterSpacing: '0.04em' }}>LoveKod</span>
                <span className="logo-sub" style={{ letterSpacing: '0.22em' }}>BOUTIQUE</span>
              </div>
            </div>
            <p className="footer-brand-desc" style={{ color: 'var(--ink-muted)', fontSize: '0.88rem', lineHeight: 1.7, maxWidth: '300px' }}>
              Festive kurtha sets curated for Tihar and Bhai Tika with artisanal zari embroidery, scalloped dupattas, and fluid silks.
            </p>
          </div>

          <div className="footer-nav-col">
            <h4 style={{ color: 'var(--paper)', fontSize: '0.95rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '18px' }}>Festive Edit</h4>
            <ul className="footer-links">
              <li><a href="/#collection">Bhai Tika Collection</a></li>
              <li><a href="/#collection">3-Piece Georgette Sets</a></li>
              <li><a href="/#collection">Silk Blend Specials</a></li>
              <li><a href="/#reviews">Customer Reviews</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4 style={{ color: 'var(--paper)', fontSize: '0.95rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '18px' }}>Assistance</h4>
            <ul className="footer-links">
              <li><a href="#size-guide">Size &amp; Fit Guide</a></li>
              <li><a href="#shipping">Delivery Across Nepal</a></li>
              <li><a href="#exchange">3-Day Size Exchange</a></li>
              <li><a href="#faq">Frequently Asked</a></li>
            </ul>
          </div>

          {/* Dynamic Social Media Column */}
          <div className="footer-nav-col">
            <h4 style={{ color: 'var(--paper)', fontSize: '0.95rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Connect</h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--gold)', marginBottom: '16px', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
              {socialHandle}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={socialInstagram}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  borderRadius: '2px',
                  border: '1px solid var(--line)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: 'var(--paper)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  transition: 'all 0.25s ease',
                }}
                className="hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <InstagramIcon className="w-4 h-4 text-[var(--gold)]" />
                  <span>Instagram</span>
                </span>
                <ArrowUpRight size={14} style={{ opacity: 0.6 }} />
              </a>

              <a
                href={socialTiktok}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  borderRadius: '2px',
                  border: '1px solid var(--line)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: 'var(--paper)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  transition: 'all 0.25s ease',
                }}
                className="hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <TikTokIcon className="w-4 h-4 text-[var(--gold)]" />
                  <span>TikTok</span>
                </span>
                <ArrowUpRight size={14} style={{ opacity: 0.6 }} />
              </a>

              <a
                href={socialFacebook}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  borderRadius: '2px',
                  border: '1px solid var(--line)',
                  background: 'rgba(255, 255, 255, 0.02)',
                  color: 'var(--paper)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  transition: 'all 0.25s ease',
                }}
                className="hover:border-[var(--gold)] hover:text-[var(--gold)]"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <FacebookIcon className="w-4 h-4 text-[var(--gold)]" />
                  <span>Facebook</span>
                </span>
                <ArrowUpRight size={14} style={{ opacity: 0.6 }} />
              </a>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 14px',
                  borderRadius: '2px',
                  border: '1px solid rgba(37, 211, 102, 0.35)',
                  background: 'rgba(37, 211, 102, 0.06)',
                  color: 'var(--paper)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  transition: 'all 0.25s ease',
                }}
                className="hover:border-[#25D366] hover:bg-[rgba(37,211,102,0.12)]"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  <WhatsAppIcon size={16} />
                  <span>WhatsApp Concierge</span>
                </span>
                <ArrowUpRight size={14} style={{ opacity: 0.6 }} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom" style={{ borderColor: 'var(--line)', paddingTop: '28px', color: 'var(--ink-muted)' }}>
          <span>&copy; 2083 LoveKod Atelier. All rights reserved across Nepal.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem' }}>
            <a href={websiteUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--paper)', textDecoration: 'none', letterSpacing: '0.04em' }}>
              {rawDomain}
            </a>
            <span style={{ opacity: 0.4 }}>•</span>
            <span style={{ color: 'var(--gold)', letterSpacing: '0.06em' }}>{socialHandle}</span>
          </div>
        </div>
      </footer>
    </AnimatedFooter>
  );
}
