import { Link } from 'react-router-dom';
import { MarigoldIcon, CheckIcon, WhatsAppIcon, ArrowRightIcon } from '../Icons';
import { formatPrice, calcDiscount, getWhatsAppLink } from '../../utils/format';

/**
 * Oversized editorial product spotlight card.
 * Reads description/highlights from Django admin fields with safe fallbacks.
 */
export default function FeaturedSpotlight({ product, siteSettings, waPhone }) {
  if (!product) return null;

  const discount = calcDiscount(product.originalPrice, product.price);
  const desc = siteSettings?.spotlightDescription || siteSettings?.spotlightDesc
    || product.description
    || 'Pure georgette with silver needlework across the collar and cuffs. Complete three-piece set with a matching lightweight lower and scalloped dupatta.';

  const highlights = siteSettings?.spotlightHighlights
    || product.highlights
    || [
        `Includes ${product.pieces}: Kurtha, Matching Lower & Dupatta`,
        'Handcrafted silver zari split-collar embroidery',
        'Measured against standard fits with generous seam allowances',
      ];

  return (
    <section className="featured-spotlight-section" id="featured">
      <div className="featured-spotlight-card">
        <div className="spotlight-visual">
          <img
            src={product.image}
            alt={product.name}
            className="spotlight-img"
          />
          <div className="spotlight-tag-cut">
            <span>Featured this week</span>
          </div>
        </div>

        <div className="spotlight-story">
          <div className="spotlight-label">
            <MarigoldIcon size={16} />
            <span>{siteSettings?.spotlightBadge || 'SIGNATURE TIHAR SET'}</span>
          </div>
          <h2 className="spotlight-title">{siteSettings?.spotlightTitle || product.name}</h2>

          <p className="spotlight-desc">{desc}</p>

          <div className="spotlight-highlights">
            {(Array.isArray(highlights) ? highlights : []).map((hl, i) => (
              <div className="highlight-item" key={i}>
                <CheckIcon size={16} />
                <span>{hl}</span>
              </div>
            ))}
          </div>

          <div className="spotlight-price-row">
            <div className="spotlight-prices">
              <span className="price-bold tabular-num">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="price-mrp tabular-num">{formatPrice(product.originalPrice)}</span>
              )}
              {discount > 0 && (
                <span className="discount-tag">{discount}% OFF</span>
              )}
            </div>

            <div className="spotlight-actions">
              <Link to={`/product/${product.id}`} className="btn-primary-marigold">
                <span>View details</span>
                <ArrowRightIcon size={16} />
              </Link>
              <a
                href={getWhatsAppLink(product, waPhone)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-square"
                title="Order on WhatsApp"
                aria-label="Order on WhatsApp"
              >
                <WhatsAppIcon size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
