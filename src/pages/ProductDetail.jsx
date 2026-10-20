import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import GarlandDivider from '../components/GarlandDivider';
import {
  DiyaIcon,
  ShoppingBagIcon,
  WhatsAppIcon,
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CloseIcon,

} from '../components/Icons';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, siteSettings } = useStore();

  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      const seoTitle = product.seo?.title || `${product.name} | LoveKod Store Nepal`;
      const seoDesc = product.seo?.description || product.description || `Shop ${product.name} at LoveKod Store Nepal. Handcrafted festive kurtha set with delivery across Nepal.`;
      const seoKeywords = product.seo?.keywords || `${product.name}, kurtha nepal, tihar wear, lovekod`;
      const canonical = product.seo?.canonicalUrl || window.location.href;
      const ogImg = product.seo?.ogImage || product.image;

      document.title = seoTitle;

      const setMeta = (name, content, isProperty = false) => {
        const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
        let el = document.querySelector(selector);
        if (!el) {
          el = document.createElement('meta');
          if (isProperty) el.setAttribute('property', name);
          else el.setAttribute('name', name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };

      setMeta('description', seoDesc);
      setMeta('keywords', seoKeywords);
      setMeta('og:title', seoTitle, true);
      setMeta('og:description', seoDesc, true);
      setMeta('og:image', ogImg, true);
      setMeta('og:url', canonical, true);
      setMeta('og:type', 'product', true);
      setMeta('twitter:card', 'summary_large_image');
      setMeta('twitter:title', seoTitle);
      setMeta('twitter:description', seoDesc);
      setMeta('twitter:image', ogImg);

      // Google Schema.org JSON-LD Structured Data
      let ldJson = document.querySelector('#product-ld-json');
      if (!ldJson) {
        ldJson = document.createElement('script');
        ldJson.id = 'product-ld-json';
        ldJson.type = 'application/ld+json';
        document.head.appendChild(ldJson);
      }
      ldJson.text = JSON.stringify({
        '@context': 'https://schema.org/',
        '@type': 'Product',
        'name': product.name,
        'image': [ogImg],
        'description': seoDesc,
        'sku': product.id,
        'offers': {
          '@type': 'Offer',
          'url': canonical,
          'priceCurrency': 'NPR',
          'price': product.price,
          'availability': 'https://schema.org/InStock',
        },
      });
    }
    return () => {
      document.title = "LoveKod (लभकोड) | Handcrafted Tihar Kurtha Sets & Festive Atelier Nepal";
      const ldJson = document.querySelector('#product-ld-json');
      if (ldJson) ldJson.remove();
    };
  }, [id, product]);


  if (!product) {
    return (
      <div className="section not-found-section">
        <h2>Product Not Found</h2>
        <p>The kurtha you are looking for does not exist or has been retired from the collection.</p>
        <Link to="/" className="btn-primary-marigold">Return to Collection</Link>
      </div>
    );
  }

  const sizes = product.sizes || {};
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(product.id, selectedSize);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(product.id, selectedSize);
    navigate('/checkout');
  };

  const getWaLink = () => {
    const sizeText = selectedSize ? `in size ${selectedSize}` : '';
    const text = encodeURIComponent(
      `Namaste LoveKod! I would like to order "${product.name}" ${sizeText} (Rs. ${product.price.toLocaleString()}) for Tihar. Please share delivery details.`
    );
    const waPhone = (siteSettings?.contactWhatsapp || '9779719567133').replace(/[^\d]/g, '');
    return `https://wa.me/${waPhone}?text=${text}`;
  };

  const related = products.filter(p => p.id !== product.id).slice(0, 3);

  return (
    <div className="pd-page">
      {/* ── Breadcrumb Navigation ── */}
      {/* Breadcrumb & Product JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.lovekod.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Collection",
                "item": "https://www.lovekod.com/#collection"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": product.name,
                "item": `https://www.lovekod.com/product/${product.id}`
              }
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": `https://www.lovekod.com${product.image}`,
            "description": product.description,
            "sku": product.id,
            "brand": { "@type": "Brand", "name": "LoveKod" },
            "offers": {
              "@type": "Offer",
              "url": `https://www.lovekod.com/product/${product.id}`,
              "priceCurrency": "NPR",
              "price": product.price,
              "priceValidUntil": "2027-12-31",
              "availability": "https://schema.org/InStock"
            }
          })
        }}
      />
      <nav className="pd-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span className="bc-sep">/</span>
        <a href="/#collection">Collection</a>
        <span className="bc-sep">/</span>
        <span className="bc-current">{product.name}</span>
      </nav>

      <div className="pd-grid">
        {/* Left: Product Imagery with warm ambient frame */}
        <div className="pd-image-frame">
          <img src={product.image} alt={product.name} className="pd-main-img" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/images/kurtha-charcoal.jpg'; }} />
          {product.badge && (
            <div className="pd-cut-badge">
              <span>{product.badge}</span>
            </div>
          )}
        </div>

        {/* Right: Detailed Product & Sizing Panel */}
        <div className="pd-info-panel">
          <div className="pd-fabric-strip">
            <span className="fabric-pill">{product.fabricType}</span>
            <span className="pill-dot">•</span>
            <span className="fabric-pill">{product.pieces}</span>
          </div>

          <h1 className="pd-title">{product.name}</h1>
          

          {/* Clean Non-Wrapping Tabular Price Row */}
          <div className="pd-price-row">
            <span className="pd-price-now tabular-num">
              Rs. {product.price.toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="pd-price-mrp tabular-num">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
            )}
            {discount > 0 && (
              <span className="pd-discount-tag">
                {discount}% OFF
              </span>
            )}
          </div>

          <p className="pd-desc">{product.description}</p>

          {/* ── Size Selector ── */}
          <div className={`size-section-wrap ${sizeError ? 'has-error' : ''}`}>
            <div className="size-header-bar">
              <span className="size-label-text">Select Size:</span>
              <button
                type="button"
                className="btn-size-guide-toggle"
                onClick={() => setShowSizeGuide(!showSizeGuide)}
              >
                <span>Size Chart &amp; Fit</span>
              </button>
            </div>

            {/* Size Guide Drawer */}
            {showSizeGuide && (
              <div className="size-guide-panel">
                <div className="size-guide-header">
                  <span>Standard Kurtha Fit Chart (Inches)</span>
                  <button
                    type="button"
                    className="close-guide-btn"
                    onClick={() => setShowSizeGuide(false)}
                    aria-label="Close size guide"
                  >
                    <CloseIcon size={16} />
                  </button>
                </div>
                <table className="size-guide-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Bust</th>
                      <th>Waist</th>
                      <th>Hip</th>
                      <th>Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>XS</td><td>34"</td><td>30"</td><td>36"</td><td>43"</td></tr>
                    <tr><td>S</td><td>36"</td><td>32"</td><td>38"</td><td>43"</td></tr>
                    <tr><td>M</td><td>38"</td><td>34"</td><td>40"</td><td>44"</td></tr>
                    <tr><td>L</td><td>40"</td><td>36"</td><td>42"</td><td>44"</td></tr>
                    <tr><td>XL</td><td>42"</td><td>38"</td><td>44"</td><td>45"</td></tr>
                    <tr><td>XXL</td><td>44"</td><td>40"</td><td>46"</td><td>45"</td></tr>
                    <tr><td>XXXL</td><td>46"</td><td>42"</td><td>48"</td><td>46"</td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Distinct State Size Buttons (Customizable & Dynamic) */}
            <div className="size-buttons-grid">
              {(() => {
                const standardOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Free Size'];
                const rawSizes = Object.keys(sizes);
                const allKeys = rawSizes.length > 0 ? rawSizes : ['M', 'L', 'XL', 'XXL', 'XXXL'];
                const sortedSizes = allKeys.sort((a, b) => {
                  const idxA = standardOrder.indexOf(a);
                  const idxB = standardOrder.indexOf(b);
                  if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                  if (idxA !== -1) return -1;
                  if (idxB !== -1) return 1;
                  return a.localeCompare(b);
                });

                return sortedSizes.map(size => {
                  const stock = sizes[size] || 0;
                  const isSelected = selectedSize === size;
                  const isOutOfStock = stock === 0;
                  const isLow = stock > 0 && stock <= 2;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      className={`size-choice-btn ${isSelected ? 'is-selected' : isOutOfStock ? 'is-out-of-stock' : isLow ? 'is-low-stock' : 'is-available'}`}
                    >
                      <span className="choice-size-name">{size}</span>
                      <span className="choice-status">
                        {isOutOfStock ? (
                          'Sold Out'
                        ) : isLow ? (
                          `${stock} left`
                        ) : (
                          'In Stock'
                        )}
                      </span>
                    </button>
                  );
                });
              })()}
            </div>

            {sizeError && (
              <div className="size-error-notice">
                Please select your preferred kurtha size to proceed.
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pd-actions-row">
            <button
              type="button"
              className="btn-primary-marigold btn-add-bag"
              onClick={handleAddToCart}
            >
              <ShoppingBagIcon size={18} />
              <span>Add to Shopping Bag</span>
            </button>

            <button
              type="button"
              className="btn-secondary-outline btn-buy-now"
              onClick={handleBuyNow}
            >
              <span>Instant Buy</span>
            </button>

            <a
              href={getWaLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-square"
              title="Inquire or Order via WhatsApp"
              aria-label="Order on WhatsApp"
            >
              <WhatsAppIcon size={20} />
            </a>
          </div>

          {/* Festive Guarantees Strip */}
          <div className="pd-guarantee-list">
            <div className="guarantee-item">
              <DiyaIcon size={18} active={true} />
              <div>
                <strong>Tihar Ready:</strong> Priority dispatch within 24 hours to reach before Bhai Tika.
              </div>
            </div>
            <div className="guarantee-item">
              <TruckIcon size={18} />
              <div>
                <strong>Nationwide Delivery:</strong> Fast express shipping across all 77 districts in Nepal.
              </div>
            </div>
            <div className="guarantee-item">
              <ShieldCheckIcon size={18} />
              <div>
                <strong>Flexible Payment:</strong> Instant Dynamic QR Pay & Cash on Delivery.
              </div>
            </div>
            <div className="guarantee-item">
              <SparklesIcon size={18} />
              <div>
                <strong>3-Day Exchange:</strong> Hassle-free size adjustment guarantee.
              </div>
            </div>
          </div>
        </div>
      </div>

      <GarlandDivider className="section-divider" />

      {/* ── Related Kurthas: Horizontal Daraz Nepal Style Scroll ── */}
      {related.length > 0 && (
        <section className="pd-related-section">
          <div className="section-header-editorial">
            <h3 className="section-main-title">More Festive Looks</h3>
            <p className="section-main-desc">Explore alternative fabric drapes for Bhai Tika</p>
          </div>

          <div className="daraz-horizontal-scroll-track" role="region" aria-label="Similar festive kurthas">
            {related.map(item => (
              <article key={item.id} className="daraz-product-card">
                <Link to={`/product/${item.id}`} className="daraz-card-img-link">
                  <img src={item.image} alt={item.name} className="daraz-card-img" loading="lazy" />
                  {item.badge && <span className="daraz-badge">{item.badge}</span>}
                </Link>
                <div className="daraz-card-body">
                  <div className="daraz-fabric-tag">{item.fabricType} • {item.pieces}</div>
                  <Link to={`/product/${item.id}`} className="daraz-title-link">
                    <h4 className="daraz-card-title">{item.name}</h4>
                  </Link>
                  <div className="daraz-price-row">
                    <span className="daraz-price tabular-num">Rs. {item.price.toLocaleString()}</span>
                    {item.originalPrice && (
                      <span className="daraz-mrp tabular-num">Rs. {item.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <Link to={`/product/${item.id}`} className="daraz-view-btn">
                    <span>View details</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
