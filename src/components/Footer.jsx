import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import AnimatedFooter from './ui/AnimatedFooter';

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
        </div>

        <div className="footer-bottom">
          <span>&copy; 2083 LoveKod. All rights reserved across Nepal.</span>
        </div>
      </footer>
    </AnimatedFooter>
  );
}
