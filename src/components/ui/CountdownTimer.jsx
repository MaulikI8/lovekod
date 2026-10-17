import React, { useState, useEffect } from 'react';
import NumberFlow from '@number-flow/react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CountdownTimer() {
  const { siteSettings } = useStore();

  // INVISIBLE BY DEFAULT : Only shows if explicitly toggled ON in Django Admin or React Admin
  const isEnabled = siteSettings?.saleCountdownEnabled === true;
  const targetDateStr = siteSettings?.saleCountdownTargetDate || '2026-11-10T23:59:59';
  const title = siteSettings?.saleCountdownTitle || 'Flash Sale • Tihar Festive Drop';
  const subtitle = siteSettings?.saleCountdownSubtitle || 'Limited batch festive kurtha sets in pure georgette and silk blends. Offer expires when the timer hits zero.';
  const ctaText = siteSettings?.saleCountdownCtaText || 'Shop the Flash Sale';
  const ctaLink = siteSettings?.saleCountdownCtaLink || '#collection';

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    if (!isEnabled) return;

    function calculate() {
      const target = new Date(targetDateStr).getTime();
      const now = Date.now();
      const diff = target - now;

      if (isNaN(target) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    }

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr, isEnabled]);

  // If disabled in admin, render completely invisible (zero DOM output)
  if (!isEnabled) return null;

  return (
    <section className="tihar-countdown-section" aria-label="Festive Sale Countdown">
      <div className="tihar-countdown-container">
        
        {/* Subtle Devanagari background watermark */}
        <div className="countdown-devanagari-watermark" aria-hidden="true">
          अफर
        </div>

        <div className="countdown-content-wrap">
          {/* Header pill & copy */}
          <div className="countdown-header-meta">
            <div className="countdown-tag-cut">
              <Zap size={13} className="countdown-tag-icon" />
              <span>Limited Festive Sale Window</span>
            </div>

            <h2 className="countdown-main-heading">{title}</h2>
            <p className="countdown-description">{subtitle}</p>
          </div>

          {/* NumberFlow Animated Digital Counter Units */}
          <div className="countdown-digits-grid">
            {/* Days */}
            <div className="countdown-unit-card">
              <div className="countdown-number-flow">
                <NumberFlow
                  value={timeLeft.days}
                  trend={-1}
                  format={{ minimumIntegerDigits: 2 }}
                />
              </div>
              <span className="countdown-unit-label">DAYS</span>
            </div>

            <div className="countdown-colon-separator">:</div>

            {/* Hours */}
            <div className="countdown-unit-card">
              <div className="countdown-number-flow">
                <NumberFlow
                  value={timeLeft.hours}
                  trend={-1}
                  format={{ minimumIntegerDigits: 2 }}
                />
              </div>
              <span className="countdown-unit-label">HOURS</span>
            </div>

            <div className="countdown-colon-separator">:</div>

            {/* Minutes */}
            <div className="countdown-unit-card">
              <div className="countdown-number-flow">
                <NumberFlow
                  value={timeLeft.minutes}
                  trend={-1}
                  format={{ minimumIntegerDigits: 2 }}
                />
              </div>
              <span className="countdown-unit-label">MINS</span>
            </div>

            <div className="countdown-colon-separator">:</div>

            {/* Seconds */}
            <div className="countdown-unit-card seconds-card">
              <div className="countdown-number-flow highlight-seconds">
                <NumberFlow
                  value={timeLeft.seconds}
                  trend={-1}
                  format={{ minimumIntegerDigits: 2 }}
                />
              </div>
              <span className="countdown-unit-label">SECS</span>
            </div>
          </div>

          {/* CTA Action */}
          <div className="countdown-cta-wrap">
            {ctaLink.startsWith('#') ? (
              <a href={ctaLink} className="countdown-cta-btn">
                <span>{ctaText}</span>
                <ArrowRight size={14} />
              </a>
            ) : (
              <Link to={ctaLink} className="countdown-cta-btn">
                <span>{ctaText}</span>
                <ArrowRight size={14} />
              </Link>
            )}
            <span className="countdown-delivery-reassurance">
              {timeLeft.isExpired 
                ? "This sale drop has ended. Browse the permanent collection below."
                : `Sale timer running • ${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m remaining`}
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
