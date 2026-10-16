import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ArrowRightIcon, ShoppingBagIcon } from '../Icons';

export default function PerspectiveCarousel({
  items = [],
  title = 'Festive Lookbook Showcase',
  subtitle = 'Interactive 3D Perspective Gallery',
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!items || items.length === 0) return null;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="perspective-carousel-section">
      <div className="section-header-editorial">
        <div className="section-eyebrow">
          <span>{subtitle}</span>
        </div>
        <h2 className="section-main-title">{title}</h2>
        <p className="section-main-desc">
          Browse handcrafted festive silhouettes in fluid georgette and silk blends
        </p>
      </div>

      <div className="perspective-carousel-stage">
        <div className="perspective-carousel-track">
          {items.map((item, idx) => {
            const offset = idx - activeIndex;
            const isCenter = offset === 0;
            const isLeft = offset === -1 || (activeIndex === 0 && idx === items.length - 1);
            const isRight = offset === 1 || (activeIndex === items.length - 1 && idx === 0);

            // Hide items further away for performance
            const isVisible = isCenter || isLeft || isRight;
            if (!isVisible) return null;

            return (
              <div
                key={item.id}
                className={`perspective-slide ${isCenter ? 'active' : isLeft ? 'left' : 'right'}`}
                onClick={() => setActiveIndex(idx)}
              >
                <div className="slide-card">
                  <div className="slide-media">
                    <img src={item.image} alt={item.name} />
                    {item.badge && (
                      <span className="slide-badge">{item.badge}</span>
                    )}
                  </div>
                  <div className="slide-info">
                    <span className="slide-fabric">{item.fabricType} • {item.pieces}</span>
                    <h3 className="slide-title">{item.name}</h3>
                    <div className="slide-price tabular-num">Rs. {item.price.toLocaleString()}</div>
                    <Link to={`/product/${item.id}`} className="btn-slide-inspect">
                      <span>Inspect Details</span>
                      <ShoppingBagIcon size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Controls */}
        <div className="perspective-controls">
          <button
            type="button"
            className="carousel-ctrl-btn"
            onClick={handlePrev}
            aria-label="Previous look"
          >
            <ArrowLeftIcon size={18} />
          </button>
          <div className="carousel-indicators">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`carousel-dot ${i === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            className="carousel-ctrl-btn"
            onClick={handleNext}
            aria-label="Next look"
          >
            <ArrowRightIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
