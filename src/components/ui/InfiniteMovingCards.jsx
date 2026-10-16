import React from 'react';
import { StarIcon } from '../Icons';

export default function InfiniteMovingCards({
  items = [],
  direction = 'left',
  speed = 'normal',
  pauseOnHover = true,
  className = '',
}) {
  if (!items || items.length === 0) return null;

  // Duplicate for seamless infinite loop
  const list = [...items, ...items];

  const durationMap = {
    fast: '25s',
    normal: '45s',
    slow: '70s',
  };

  return (
    <div
      className={`infinite-cards-wrapper ${className}`}
      style={{
        '--animation-duration': durationMap[speed] || '45s',
        '--animation-direction': direction === 'left' ? 'forwards' : 'reverse',
      }}
    >
      <div
        className={`infinite-cards-track ${pauseOnHover ? 'pause-hover' : ''}`}
      >
        {list.map((item, idx) => (
          <div key={`${item.id}-${idx}`} className="moving-review-card">
            <div className="review-stars-strip">
              {Array.from({ length: item.rating || 5 }).map((_, i) => (
                <StarIcon key={i} size={14} filled={true} />
              ))}
            </div>
            <p className="review-quote">"{item.quote}"</p>
            <div className="review-person">
              <div className="person-initials">{item.initials || 'LK'}</div>
              <div>
                <div className="person-name">{item.name}</div>
                <div className="person-location">{item.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
