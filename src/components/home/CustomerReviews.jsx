import { StarIcon } from '../Icons';
import InfiniteMovingCards from '../ui/InfiniteMovingCards';

/**
 * Editorial customer review ticker using Aceternity InfiniteMovingCards.
 */
export default function CustomerReviews({ testimonials = [] }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="reviews-staggered-section" id="reviews">
      <div className="section-header-editorial">
        <div className="section-eyebrow">
          <StarIcon size={15} filled={true} />
          <span>Boutique Experiences</span>
        </div>
        <h2 className="section-main-title">Worn with Love for Tihar</h2>
        <p className="section-main-desc">
          Authentic words from sisters and festive shoppers across Nepal
        </p>
      </div>

      <InfiniteMovingCards items={testimonials} speed="normal" pauseOnHover={true} />
    </section>
  );
}
