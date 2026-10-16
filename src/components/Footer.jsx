import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import AnimatedFooter from './ui/AnimatedFooter';
import { DiyaIcon, MapPinIcon, PhoneIcon, MailIcon, WhatsAppIcon, ShieldCheckIcon } from './Icons';

export default function Footer() {
  const { siteSettings } = useStore();

  const phone = siteSettings?.contactPhone || '+977 9800000000';
  const whatsapp = siteSettings?.contactWhatsapp || '+977 9800000000';
  const email = siteSettings?.contactEmail || 'concierge@lovekod.com';
  const address = siteSettings?.contactAddress || 'Kathmandu Valley, Nepal';

  return (
    <>
      {/* Payment & Trust Strip */}
      <section className="payment-section" aria-label="Accepted Payment Methods">
        <p className="payment-title">Payment Methods in Nepal</p>
        <div className="payment-badges">
          <div className="pay-badge esewa-badge">
            <span className="pay-dot esewa-dot" />
            <span>eSewa Pay</span>
          </div>
          <div className="pay-badge khalti-badge">
            <span className="pay-dot khalti-dot" />
            <span>Khalti Digital Wallet</span>
          </div>
          <div className="pay-badge bank-badge">
            <ShieldCheckIcon size={16} />
            <span>Direct Bank Transfer</span>
          </div>
          <div className="pay-badge cod-badge">
            <span>Cash on Delivery (COD)</span>
          </div>
        </div>
      </section>

      {/* Main Footer with Vengeance UI Animated Ambient Wave */}
      <AnimatedFooter>
        <footer className="footer" style={{ borderTop: 'none' }}>
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo" style={{ marginBottom: '8px' }}>
                <img src="/images/logo.jpg" alt="LoveKod" style={{ height: '44px', borderRadius: '4px' }} />
                <div className="logo-text-group">
                  <span className="logo-text" style={{ fontSize: '1.4rem' }}>LoveKod</span>
                  <span className="logo-sub">BOUTIQUE</span>
                </div>
              </div>
              <p>
                Handcrafted festive kurtha sets curated for the modern woman.
                Celebrate Tihar and Bhai Tika with fluid georgette, shimmering silks, and regal artisanal embroidery.
              </p>
            </div>

            <div>
              <h4>Festive Edit</h4>
              <ul className="footer-links">
                <li><a href="/#collection">Bhai Tika Collection</a></li>
                <li><a href="/#collection">3-Piece Georgette Sets</a></li>
                <li><a href="/#collection">Silk Blend Specials</a></li>
                <li><a href="/#story">Our Craftsmanship</a></li>
              </ul>
            </div>

            <div>
              <h4>Assistance</h4>
              <ul className="footer-links">
                <li><a href="#size-guide">Size Chart &amp; Fit Guide</a></li>
                <li><a href="#shipping">Nepal Delivery Policy</a></li>
                <li><a href="#exchange">3-Day Size Exchange</a></li>
                <li><a href="#faq">Frequently Asked Questions</a></li>
              </ul>
            </div>

            <div className="footer-contact">
              <h4>Boutique Concierge</h4>
              <p>
                <MapPinIcon size={16} className="contact-icon" />
                <span>{address}</span>
              </p>
              <p>
                <PhoneIcon size={16} className="contact-icon" />
                <span>{phone}</span>
              </p>
              <p>
                <MailIcon size={16} className="contact-icon" />
                <span>{email}</span>
              </p>
              <p>
                <WhatsAppIcon size={16} className="contact-icon" />
                <span>WhatsApp: {whatsapp}</span>
              </p>
            </div>
          </div>

          <div className="footer-bottom">
            <span>&copy; 2083 LoveKod. All rights reserved across Nepal.</span>
            <div className="footer-bottom-right">
              <span className="diya-mention">
                <DiyaIcon size={16} active={true} />
                <span>Crafted for Tihar 2083</span>
              </span>
              <Link to="/admin" className="staff-link">
                Admin Management
              </Link>
            </div>
          </div>
        </footer>
      </AnimatedFooter>
    </>
  );
}
