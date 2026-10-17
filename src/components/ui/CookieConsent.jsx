import { useState, useEffect } from 'react';
import { ShieldCheckIcon, CloseIcon } from '../Icons';

/**
 * Cookie consent banner & preferences modal for LoveKod.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: true,
  });

  useEffect(() => {
    try {
      const consent = localStorage.getItem('lovekod_cookie_consent');
      if (!consent) {
        // Small delay so it does not interfere with hero entrance
        const timer = setTimeout(() => setVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  const handleAcceptAll = () => {
    try {
      localStorage.setItem(
        'lovekod_cookie_consent',
        JSON.stringify({ essential: true, analytics: true, marketing: true, date: new Date().toISOString() })
      );
    } catch {}
    setVisible(false);
  };

  const handleDeclineNonEssential = () => {
    try {
      localStorage.setItem(
        'lovekod_cookie_consent',
        JSON.stringify({ essential: true, analytics: false, marketing: false, date: new Date().toISOString() })
      );
    } catch {}
    setVisible(false);
  };

  const handleSavePreferences = () => {
    try {
      localStorage.setItem(
        'lovekod_cookie_consent',
        JSON.stringify({ ...preferences, essential: true, date: new Date().toISOString() })
      );
    } catch {}
    setShowPreferences(false);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <>
      <div className="cookie-banner-wrapper" role="region" aria-label="Privacy and Cookie Consent">
        <div className="cookie-banner-card">
          <div className="cookie-banner-content">
            <div className="cookie-banner-icon">
              <ShieldCheckIcon size={20} />
            </div>
            <div className="cookie-banner-text">
              <h4 className="cookie-title">Atelier Privacy &amp; Cookies</h4>
              <p className="cookie-desc">
                We use cookies to maintain your shopping bag and analyze boutique visits. 
                We honor your privacy and will never sell your personal information.
              </p>
            </div>
          </div>

          <div className="cookie-banner-actions">
            <button
              type="button"
              className="cookie-btn-pref"
              onClick={() => setShowPreferences(true)}
            >
              Preferences
            </button>
            <button
              type="button"
              className="cookie-btn-decline"
              onClick={handleDeclineNonEssential}
            >
              Essential Only
            </button>
            <button
              type="button"
              className="cookie-btn-accept"
              onClick={handleAcceptAll}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="cookie-modal-backdrop" onClick={() => setShowPreferences(false)}>
          <div
            className="cookie-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-pref-title"
          >
            <div className="cookie-modal-header">
              <h3 id="cookie-pref-title">Cookie Preferences</h3>
              <button
                type="button"
                className="cookie-modal-close"
                onClick={() => setShowPreferences(false)}
                aria-label="Close preferences"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            <div className="cookie-pref-list">
              <div className="cookie-pref-item">
                <div className="cookie-pref-info">
                  <strong>Strictly Necessary</strong>
                  <p>Required for shopping bag, checkout session, and security. Cannot be disabled.</p>
                </div>
                <input type="checkbox" checked disabled className="cookie-checkbox" />
              </div>

              <div className="cookie-pref-item">
                <div className="cookie-pref-info">
                  <strong>Performance &amp; Analytics</strong>
                  <p>Helps us understand which kurtha collections sisters adore most.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences((p) => ({ ...p, analytics: e.target.checked }))}
                  className="cookie-checkbox"
                />
              </div>

              <div className="cookie-pref-item">
                <div className="cookie-pref-info">
                  <strong>Marketing &amp; Tailored Edits</strong>
                  <p>Used to display festive updates on Instagram and Facebook.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences((p) => ({ ...p, marketing: e.target.checked }))}
                  className="cookie-checkbox"
                />
              </div>
            </div>

            <div className="cookie-modal-footer">
              <button
                type="button"
                className="cookie-btn-accept"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
