import { Link } from 'react-router-dom';
import AnimatedFooter from './ui/AnimatedFooter';
import { WhatsAppIcon } from './Icons';
import { Globe } from 'lucide-react';

function InstagramIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
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
      strokeWidth="2"
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
      strokeWidth="2"
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
  return (
    <AnimatedFooter>
      <footer className="footer" style={{ borderTop: 'none' }}>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo" style={{ marginBottom: '8px' }}>
              <img src="/images/logo.jpg" alt="LoveKod" style={{ height: '40px', borderRadius: '4px' }} />
              <div className="logo-text-group">
                <span className="logo-text" style={{ fontSize: '1.3rem' }}>LoveKod</span>
                <span className="logo-sub">BOUTIQUE</span>
              </div>
            </div>
            <p className="footer-brand-desc">
              Festive kurtha sets curated for Tihar and Bhai Tika with artisanal embroidery and fluid silks.
            </p>

            {/* Official Website Badge */}
            <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <Globe size={15} style={{ color: 'var(--gold)' }} />
              <a
                href="https://www.lovekod.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--gold)', textDecoration: 'none', letterSpacing: '0.02em', fontWeight: 500 }}
              >
                www.lovekod.com
              </a>
            </div>
          </div>

          <div className="footer-nav-col">
            <h4>Festive Edit</h4>
            <ul className="footer-links">
              <li><a href="/#collection">Bhai Tika Collection</a></li>
              <li><a href="/#collection">3-Piece Georgette Sets</a></li>
              <li><a href="/#collection">Silk Blend Specials</a></li>
              <li><a href="/#reviews">Customer Reviews</a></li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h4>Assistance</h4>
            <ul className="footer-links">
              <li><a href="#size-guide">Size &amp; Fit Guide</a></li>
              <li><a href="#shipping">Delivery Across Nepal</a></li>
              <li><a href="#exchange">3-Day Size Exchange</a></li>
              <li><a href="#faq">Frequently Asked</a></li>
            </ul>
          </div>

          {/* Social Media Column */}
          <div className="footer-nav-col">
            <h4>Follow Us</h4>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold)', marginBottom: '12px', letterSpacing: '0.05em' }}>
              @lovekod.np
            </div>
            <ul className="footer-links" style={{ gap: '12px' }}>
              <li>
                <a
                  href="https://instagram.com/lovekod.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                >
                  <InstagramIcon style={{ color: 'var(--gold)' }} />
                  <span>Instagram</span>
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com/@lovekod.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                >
                  <TikTokIcon style={{ color: 'var(--gold)' }} />
                  <span>TikTok</span>
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com/lovekod.np"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                >
                  <FacebookIcon style={{ color: 'var(--gold)' }} />
                  <span>Facebook</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/9779800000000?text=Namaste%20LoveKod%2C%20I%20would%20like%20to%20inquire%20about%20festive%20kurtha%20sets."
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}
                >
                  <WhatsAppIcon size={16} />
                  <span>WhatsApp Concierge</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; 2083 LoveKod. All rights reserved across Nepal.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem' }}>
            <a href="https://www.lovekod.com" style={{ color: 'inherit', textDecoration: 'none' }}>
              www.lovekod.com
            </a>
            <span>•</span>
            <span style={{ color: 'var(--gold)' }}>@lovekod.np</span>
          </div>
        </div>
      </footer>
    </AnimatedFooter>
  );
}
