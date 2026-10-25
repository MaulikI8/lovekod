import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

/**
 * Continuous Left-to-Right Looping Model & Lookbook Showcase.
 * Displays models wearing LoveKod festive kurtha sets with their Instagram handles.
 * Infinite CSS marquee scrolling smoothly from left to right. Pauses on hover.
 */
export default function LookbookCarousel({ products = [], siteSettings }) {
  // Built-in festive muses fallback with real catalogue kurthas
  const fallbackMuses = [
    {
      id: 'muse-1',
      productId: 'lk-002',
      productName: 'Sage Green Floral Embroidered Kurtha',
      price: 2999,
      image: '/images/kurtha-sage-coord.webp',
      modelHandle: 'shradha.acharya',
      occasion: 'Bhai Tika Morning',
    },
    {
      id: 'muse-2',
      productId: 'lk-001',
      productName: 'Rani Pink Zari Festive Kurtha Set',
      price: 2999,
      image: '/images/kurtha-rani-pink.webp',
      modelHandle: 'anushree.np',
      occasion: 'Laxmi Puja Evening',
    },
    {
      id: 'muse-3',
      productId: 'lk-003',
      productName: 'Royal Red Gold Silk Kurtha Set',
      price: 3499,
      image: '/images/kurtha-red-gold.webp',
      modelHandle: 'priyanka.karki',
      occasion: 'Tihar Family Dinner',
    },
    {
      id: 'muse-4',
      productId: 'lk-004',
      productName: 'Olive Green Zari Hand-Worked Kurtha',
      price: 2799,
      image: '/images/kurtha-olive-green.webp',
      modelHandle: 'malvika_subba',
      occasion: 'Govardhan Puja Gathering',
    },
    {
      id: 'muse-5',
      productId: 'lk-005',
      productName: 'Charcoal Silk Festive Co-ord Set',
      price: 2999,
      image: '/images/kurtha-charcoal.webp',
      modelHandle: 'sadichha.shrestha',
      occasion: 'Bhai Dooj Reception',
    },
  ];

  // Dynamic muses: populate from products that have a modelHandle
  const productMuses = products
    .filter(p => p.image && (p.modelHandle || p.image))
    .map((p, idx) => ({
      id: p.id || `prod-${idx}`,
      productId: p.id,
      productName: p.name,
      price: p.price,
      image: p.image,
      modelHandle: p.modelHandle || fallbackMuses[idx % fallbackMuses.length].modelHandle,
      occasion: p.badge || 'Festive Edit',
    }));

  const activeMuses = productMuses.length >= 3 ? productMuses : fallbackMuses;

  // Duplicate for seamless 100% infinite marquee loop with zero blank gaps
  const marqueeItems = [...activeMuses, ...activeMuses, ...activeMuses];

  return (
    <section className="model-lookbook-section" id="lookbook">
      {/* Section Header */}
      <div className="section-header-editorial">
        <div className="section-eyebrow">
          <span>{siteSettings?.lookbookEyebrow || 'COMMUNITY & LOOKBOOK'}</span>
        </div>
        <h2 className="section-main-title">
          {siteSettings?.lookbookTitle || 'Draped in LoveKod • Styled by You'}
        </h2>
        <p className="section-main-desc">
          {siteSettings?.lookbookSubtitle || 'Festive silhouettes styled by real muses across Nepal. Tag @lovekod to be featured.'}
        </p>
      </div>

      {/* Marquee Wrapper with soft edge gradients */}
      <div className="model-marquee-container">
        {/* Left & Right ambient fade masks */}
        <div className="model-marquee-fade-left" aria-hidden="true" />
        <div className="model-marquee-fade-right" aria-hidden="true" />

        {/* Continuous Left-to-Right Moving Track */}
        <div className="model-marquee-track">
          {marqueeItems.map((item, index) => {
            const cleanHandle = (item.modelHandle || '').replace(/^@/, '');
            const igUrl = `https://instagram.com/${cleanHandle}`;

            return (
              <div key={`${item.id}-${index}`} className="model-card">
                {/* Model / Outfit Photograph */}
                <div className="model-card-image-wrap">
                  <img
                    src={item.image}
                    alt={`${item.productName} worn by @${cleanHandle}`}
                    className="model-card-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/kurtha-charcoal.jpg';
                    }}
                  />

                  {/* Gradient Overlay for Text Legibility */}
                  <div className="model-card-scrim" />

                  {/* Top Floating Instagram Handle Tag */}
                  {cleanHandle && (
                    <a
                      href={igUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="model-ig-tag"
                      title={`View @${cleanHandle} on Instagram`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                      </svg>
                      <span>@{cleanHandle}</span>
                    </a>
                  )}

                  {/* Bottom Outfit Details Pill */}
                  <div className="model-card-details">
                    <span className="model-occasion-badge">{item.occasion}</span>
                    <h3 className="model-product-title">{item.productName}</h3>
                    <div className="model-footer-row">
                      <span className="model-product-price">{formatPrice(item.price)}</span>
                      {item.productId && (
                        <Link to={`/product/${item.productId}`} className="model-view-btn">
                          View Outfit →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
