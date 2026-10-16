import React, { useState, useEffect } from 'react';
import NumberFlow from '@number-flow/react';
import { useStore } from '../../context/StoreContext';
import { siteConfig } from '../../config/site';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CountdownTimer() {
  const { siteSettings } = useStore();

  const isEnabled = siteSettings?.countdownEnabled !== false;
  const targetDateStr = siteSettings?.countdownTargetDate || '2026-11-10T12:00:00';
  const title = siteSettings?.countdownTitle || 'Order by Kartik 15 for Bhai Tika Delivery';
  const subtitle = siteSettings?.countdownSubtitle || 'Consciously handcrafted in small batches. Ensure guaranteed delivery across all 77 districts before the festival begins.';
  const ctaText = siteSettings?.countdownCtaText || 'Explore Bhai Tika Sets';
  const ctaLink = siteSettings?.countdownCtaLink || '#collection';

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
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
  }, [targetDateStr]);

  if (!isEnabled) return null;

  return (
    <section className="tihar-countdown-section" aria-label="Festive Order Countdown">
      <div className="tihar-countdown-container">
        
        {/* Subtle Devanagari backdrop */}
        <div className="countdown-devanagari-watermark" aria-hidden="true">
          भाइटीका
        </div>

        <div className="countdown-content-wrap">
          {/* Header pill & copy */}
          <div className="countdown-header-meta">
            <div className="countdown-tag-cut">
              <Clock size={13} className="countdown-tag-icon" />
              <span>Festive Dispatch Window</span>
            </div>

            <h2 className="countdown-main-heading">{title}</h2>
            <p className="countdown-description">{subtitle}</p>
          </div>

          {/* NumberFlow Animated Digital Counter Units (Skiper37 style) */}
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
              Guaranteed nationwide delivery before Bhai Tika
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
