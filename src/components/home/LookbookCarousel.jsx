import PerspectiveCarousel from '../ui/perspective-carousel';
import { formatPrice } from '../../utils/format';

/**
 * 3D Perspective Carousel showcasing lookbook styles.
 * Enhanced with subtle glass backdrop, refined framing, and responsiveness.
 */
export default function LookbookCarousel({ products = [], siteSettings }) {
  if (!products || products.length === 0) return null;

  const carouselItems = products.map((p) => ({
    src: p.image,
    title: `${p.name} • ${formatPrice(p.price)}`,
    alt: p.name,
    id: p.id,
  }));

  return (
    <section className="perspective-carousel-section" id="lookbook" style={{ padding: '48px 0 64px' }}>
      <div className="section-header-editorial">
        <div className="section-eyebrow">
          <span>{siteSettings?.lookbookEyebrow || 'Curated 3D Collection Showcase'}</span>
        </div>
        <h2 className="section-main-title">{siteSettings?.lookbookTitle || 'Festive Lookbook Showcase'}</h2>
        <p className="section-main-desc">
          {siteSettings?.lookbookSubtitle || 'Spin through our authentic hand-embroidered Tihar kurthas'}
        </p>
      </div>

      <div className="relative w-full max-w-6xl mx-auto px-4 mt-6">
        <PerspectiveCarousel
          items={carouselItems}
          defaultActiveIndex={Math.min(2, Math.floor(carouselItems.length / 2))}
          slideWidth={220}
          loop={true}
          className="perspective-carousel-shell h-[520px] rounded-2xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] shadow-md"
        />
      </div>
    </section>
  );
}
