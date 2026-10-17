import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DiyaIcon, ArrowRightIcon, WhatsAppIcon, ShoppingBagIcon } from '../components/Icons';

/**
 * Luxury 404 Custom Page for LoveKod Atelier.
 */
export default function NotFound() {
  useEffect(() => {
    document.title = 'Page Not Found (404) | LoveKod Atelier';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="not-found-page-wrapper">
      <div className="not-found-card">
        <div className="not-found-icon-wrap">
          <DiyaIcon size={48} active={true} />
        </div>

        <div className="not-found-devanagari">पृष्ठ भेटिएन</div>
        <h1 className="not-found-title">404 · Outfit or Page Not Found</h1>
        
        <p className="not-found-desc">
          The page or kurtha set you are looking for may have concluded its batch, 
          or the URL might have an outdated weave.
        </p>

        <div className="not-found-actions">
          <Link to="/" className="btn-primary-marigold">
            <ShoppingBagIcon size={18} />
            <span>Explore Tihar Collection</span>
          </Link>

          <a
            href="https://wa.me/9779719567133?text=Namaste%20LoveKod%2C%20I%20am%20looking%20for%20a%20specific%20kurtha%20style."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary-outline"
          >
            <WhatsAppIcon size={18} />
            <span>Ask Concierge on WhatsApp</span>
          </a>
        </div>

        <div className="not-found-quick-links">
          <span className="quick-links-title">Popular Destinations:</span>
          <div className="quick-links-row">
            <Link to="/#collection">Seasonal Kurthas</Link>
            <span className="dot-sep">•</span>
            <Link to="/#featured">Signature Set</Link>
            <span className="dot-sep">•</span>
            <Link to="/#lookbook">3D Lookbook</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
