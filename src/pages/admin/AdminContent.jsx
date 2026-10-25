import { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';

export default function AdminContent() {
  const { siteSettings, updateSiteSettings, products } = useStore();
  const [form, setForm] = useState(siteSettings);
  const [activeTab, setActiveTab] = useState('hero');

  useEffect(() => {
    if (siteSettings) {
      setForm(prev => ({ ...prev, ...siteSettings }));
    }
  }, [siteSettings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSiteSettings(form);
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2>Site Content &amp; Visual Settings</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Control every heading, watermark, announcement, and contact detail across the site
          </p>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="btn-primary-marigold"
          style={{ fontSize: '0.85rem', padding: '10px 24px' }}
        >
          Save All Changes
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'hero', label: 'Hero & Watermark' },
          { id: 'announcement', label: 'Announcement & Shipping' },
          { id: 'spotlight', label: 'Spotlight Feature' },
          { id: 'contact', label: 'Concierge Contacts' },
          { id: 'social', label: 'Footer & Socials' },
          { id: 'countdown', label: 'Flash Sale Timer' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            className="admin-btn"
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'var(--marigold)' : 'var(--night-surface)',
              color: activeTab === tab.id ? '#1a0d08' : 'var(--text-body)',
              fontWeight: activeTab === tab.id ? 700 : 500,
              borderColor: activeTab === tab.id ? 'var(--marigold)' : 'var(--kaalo-border)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'var(--kaalo-card)', border: '1px solid var(--kaalo-border)', borderRadius: 'var(--radius-md)', padding: '28px' }}>
        {/* ── 1. HERO TAB ── */}
        {activeTab === 'hero' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.25rem', marginBottom: '18px' }}>
              Hero Section &amp; Watermark
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label>Hero Badge Nepali Text</label>
                <input
                  type="text"
                  value={form.heroBadgeNepali || ''}
                  onChange={e => setForm({ ...form, heroBadgeNepali: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Hero Badge English Sub</label>
                <input
                  type="text"
                  value={form.heroBadgeText || ''}
                  onChange={e => setForm({ ...form, heroBadgeText: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hero Main Title (Line 1)</label>
                <input
                  type="text"
                  value={form.heroTitleLine1 || ''}
                  onChange={e => setForm({ ...form, heroTitleLine1: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Hero Title Accent (Line 2 in Marigold)</label>
                <input
                  type="text"
                  value={form.heroTitleAccent || ''}
                  onChange={e => setForm({ ...form, heroTitleAccent: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Hero Subtitle / Description</label>
              <textarea
                rows="3"
                value={form.heroSubtitle || ''}
                onChange={e => setForm({ ...form, heroSubtitle: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Background Watermark Text (e.g. LOVEKOD)</label>
                <input
                  type="text"
                  value={form.heroWatermark || ''}
                  onChange={e => setForm({ ...form, heroWatermark: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Hero Center Panel Image URL</label>
                <input
                  type="text"
                  placeholder="/images/kurtha-rani-pink.png or product image URL"
                  value={form.heroCenterImage || form.heroImage || ''}
                  onChange={e => setForm({ ...form, heroCenterImage: e.target.value, heroImage: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hero Left Panel Image URL</label>
                <input
                  type="text"
                  placeholder="/images/kurtha-red-gold.png or product image URL"
                  value={form.heroLeftImage || ''}
                  onChange={e => setForm({ ...form, heroLeftImage: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Hero Right Panel Image URL</label>
                <input
                  type="text"
                  placeholder="/images/kurtha-olive-green.png or product image URL"
                  value={form.heroRightImage || ''}
                  onChange={e => setForm({ ...form, heroRightImage: e.target.value })}
                />
              </div>
            </div>

            <h4 style={{ color: 'var(--marigold-light)', fontSize: '0.95rem', margin: '20px 0 12px' }}>
              Hero Trust Pills (Single-Line Bar)
            </h4>
            <div className="form-row">
              <div className="form-group">
                <label>Trust Item 1</label>
                <input
                  type="text"
                  value={form.heroTrustItem1 || ''}
                  onChange={e => setForm({ ...form, heroTrustItem1: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Trust Item 2</label>
                <input
                  type="text"
                  value={form.heroTrustItem2 || ''}
                  onChange={e => setForm({ ...form, heroTrustItem2: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Trust Item 3</label>
              <input
                type="text"
                value={form.heroTrustItem3 || ''}
                onChange={e => setForm({ ...form, heroTrustItem3: e.target.value })}
              />
            </div>

            <h4 style={{ color: 'var(--marigold-light)', fontSize: '0.95rem', margin: '26px 0 8px' }}>
              Craftsmanship Hotspots (Interactive Pins &amp; Popover Notes)
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
              Configure the 3 interactive embroidery pins that appear on the hero center outfit (Neckline, Dupatta, Hemline).
            </p>

            {(form.heroHotspots && form.heroHotspots.length === 3
              ? form.heroHotspots
              : [
                  { id: 'neckline', x: 50, y: 26, label: 'Neckline Zari Work', note: 'Hand-embossed silver needlework framed along an artisanal split collar.', productSlug: '' },
                  { id: 'dupatta', x: 66, y: 42, label: 'Dupatta Edge', note: 'Gossamer georgette with scalloped silver embroidery edging.', productSlug: '' },
                  { id: 'hemline', x: 50, y: 65, label: 'Embroidered Hem Band', note: 'Handcrafted kurtha border with fine floral needlework.', productSlug: '' },
                ]
            ).map((hs, idx) => {
              const handleHsChange = (field, val) => {
                const current = (form.heroHotspots && form.heroHotspots.length === 3)
                  ? [...form.heroHotspots]
                  : [
                      { id: 'neckline', x: 50, y: 26, label: 'Neckline Zari Work', note: 'Hand-embossed silver needlework framed along an artisanal split collar.', productSlug: '' },
                      { id: 'dupatta', x: 66, y: 42, label: 'Dupatta Edge', note: 'Gossamer georgette with scalloped silver embroidery edging.', productSlug: '' },
                      { id: 'hemline', x: 50, y: 65, label: 'Embroidered Hem Band', note: 'Handcrafted kurtha border with fine floral needlework.', productSlug: '' },
                    ];
                current[idx] = { ...current[idx], [field]: val, isCustom: true };
                setForm({ ...form, heroHotspots: current });
              };

              return (
                <div
                  key={hs.id || idx}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.88rem', marginBottom: '10px' }}>
                    Pin {idx + 1}: {hs.id ? hs.id.toUpperCase() : `HOTSPOT ${idx + 1}`} ({hs.x}%, {hs.y}%)
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Popup Title / Label</label>
                      <input
                        type="text"
                        value={hs.label || ''}
                        onChange={(e) => handleHsChange('label', e.target.value)}
                        placeholder="e.g. Dupatta Edge"
                      />
                    </div>
                    <div className="form-group">
                      <label>Target Product (View set &rarr; link)</label>
                      <select
                        value={hs.productSlug || ''}
                        onChange={(e) => handleHsChange('productSlug', e.target.value)}
                        style={{
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff',
                          borderRadius: '6px',
                          padding: '10px',
                          width: '100%',
                        }}
                      >
                        <option value="">Auto (Current Featured / Center Outfit)</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Popup Description Note</label>
                    <textarea
                      rows="2"
                      value={hs.note || ''}
                      onChange={(e) => handleHsChange('note', e.target.value)}
                      placeholder="e.g. Gossamer georgette with scalloped silver embroidery edging."
                    />
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 12px', marginTop: '4px' }}
              onClick={() => {
                setForm({
                  ...form,
                  heroHotspots: [
                    { id: 'neckline', x: 50, y: 26, label: 'Neckline Zari Work', note: 'Hand-embossed silver needlework framed along an artisanal split collar.', productSlug: '' },
                    { id: 'dupatta', x: 66, y: 42, label: 'Dupatta Edge', note: 'Gossamer georgette with scalloped silver embroidery edging.', productSlug: '' },
                    { id: 'hemline', x: 50, y: 65, label: 'Embroidered Hem Band', note: 'Handcrafted kurtha border with fine floral needlework.', productSlug: '' },
                  ],
                });
              }}
            >
              Reset Hotspots to Defaults
            </button>
          </div>
        )}

        {/* ── 2. ANNOUNCEMENT & SHIPPING TAB ── */}
        {activeTab === 'announcement' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.25rem', marginBottom: '18px' }}>
              Top Announcement Bar &amp; Delivery Rules
            </h3>
            <div className="form-group">
              <label>Announcement Eyebrow Tag (e.g. TIHAR FESTIVE EDIT)</label>
              <input
                type="text"
                value={form.announcementNepali || ''}
                onChange={e => setForm({ ...form, announcementNepali: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Announcement Bar Main Notice</label>
              <input
                type="text"
                value={form.announcementText || ''}
                onChange={e => setForm({ ...form, announcementText: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Free Shipping Threshold Amount (NPR)</label>
              <input
                type="number"
                value={form.freeShippingThreshold || 3000}
                onChange={e => setForm({ ...form, freeShippingThreshold: parseInt(e.target.value, 10) || 0 })}
              />
              <small style={{ color: 'var(--text-muted)' }}>
                Orders meeting or exceeding this amount automatically receive free delivery across Nepal.
              </small>
            </div>
          </div>
        )}

        {/* ── 3. SPOTLIGHT FEATURE TAB ── */}
        {activeTab === 'spotlight' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.25rem', marginBottom: '18px' }}>
              Signature Centerpiece Spotlight
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label>Spotlight Eyebrow Badge</label>
                <input
                  type="text"
                  value={form.spotlightBadge || ''}
                  onChange={e => setForm({ ...form, spotlightBadge: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Featured Kurtha Product</label>
                <select
                  value={form.spotlightProductId || ''}
                  onChange={e => setForm({ ...form, spotlightProductId: e.target.value })}
                  style={{ background: 'var(--night-surface)', color: '#fff', border: '1px solid var(--marigold)' }}
                >
                  <option value="">-- Select Featured Kurtha --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id} - Rs. {p.price?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Spotlight Title</label>
                <input
                  type="text"
                  value={form.spotlightTitle || ''}
                  onChange={e => setForm({ ...form, spotlightTitle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Spotlight Subtitle / Edit Tag</label>
                <input
                  type="text"
                  value={form.spotlightNepali || ''}
                  onChange={e => setForm({ ...form, spotlightNepali: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Spotlight Story Paragraph</label>
              <textarea
                rows="3"
                value={form.spotlightDesc || ''}
                onChange={e => setForm({ ...form, spotlightDesc: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* ── 4. FOOTER & SOCIALS TAB ── */}
        {activeTab === 'social' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.25rem', marginBottom: '18px' }}>
              Footer Connect &amp; Social Channels
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label>Social Handle (e.g. @lovekod.np)</label>
                <input
                  type="text"
                  value={form.socialHandle || '@lovekod.np'}
                  onChange={e => setForm({ ...form, socialHandle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Official Website Domain</label>
                <input
                  type="text"
                  value={form.websiteUrl || 'https://www.lovekod.com'}
                  onChange={e => setForm({ ...form, websiteUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Instagram Page Link</label>
              <input
                type="text"
                value={form.socialInstagram || 'https://instagram.com/lovekod.np'}
                onChange={e => setForm({ ...form, socialInstagram: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>TikTok Profile Link</label>
              <input
                type="text"
                value={form.socialTiktok || 'https://tiktok.com/@lovekod.np'}
                onChange={e => setForm({ ...form, socialTiktok: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Facebook Page Link</label>
              <input
                type="text"
                value={form.socialFacebook || 'https://facebook.com/lovekod.np'}
                onChange={e => setForm({ ...form, socialFacebook: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* ── 5. CONTACT TAB ── */}
        {activeTab === 'contact' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.25rem', marginBottom: '18px' }}>
              Storefront &amp; Concierge Contacts
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label>Mobile Phone</label>
                <input
                  type="text"
                  value={form.contactPhone || ''}
                  onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>WhatsApp Number</label>
                <input
                  type="text"
                  value={form.contactWhatsapp || ''}
                  onChange={e => setForm({ ...form, contactWhatsapp: e.target.value })}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={form.contactEmail || ''}
                  onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Physical Address / Location</label>
                <input
                  type="text"
                  value={form.contactAddress || ''}
                  onChange={e => setForm({ ...form, contactAddress: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}

                {/* ── 6. FLASH SALE COUNTDOWN TAB (Default: Invisible) ── */}
        {activeTab === 'countdown' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.25rem', marginBottom: '18px' }}>
              Flash Sale Countdown Timer (Default: Invisible)
            </h3>
            
            <div className="form-group" style={{ marginBottom: '20px', background: 'rgba(238, 230, 218, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.saleCountdownEnabled === true}
                  onChange={e => setForm({ ...form, saleCountdownEnabled: e.target.checked })}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--marigold)' }}
                />
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>
                  Make Sale Countdown Visible on Home Page
                </span>
              </label>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px', margin: 0 }}>
                When unchecked (default), the sale banner is completely hidden from the storefront. Check this box when launching a festive flash sale or limited-time drop.
              </p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Sale Expiry Date &amp; Time (YYYY-MM-DDTHH:MM)</label>
                <input
                  type="datetime-local"
                  value={form.saleCountdownTargetDate ? form.saleCountdownTargetDate.slice(0, 16) : '2026-11-10T23:59'}
                  onChange={e => setForm({ ...form, saleCountdownTargetDate: e.target.value })}
                />
                <small style={{ color: 'var(--text-muted)' }}>
                  NumberFlow dynamically computes and displays remaining Days, Hours, Minutes, and Seconds until this exact cutoff.
                </small>
              </div>

              <div className="form-group">
                <label>Call-To-Action (CTA) Button Text</label>
                <input
                  type="text"
                  value={form.saleCountdownCtaText || 'Shop the Flash Sale'}
                  onChange={e => setForm({ ...form, saleCountdownCtaText: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Sale Banner Headline (What is the timer for?)</label>
              <input
                type="text"
                value={form.saleCountdownTitle || 'Flash Sale • Tihar Festive Drop'}
                onChange={e => setForm({ ...form, saleCountdownTitle: e.target.value })}
                placeholder="e.g. Bhai Tika Midnight Drop : 20% Off All Georgettes"
              />
            </div>

            <div className="form-group">
              <label>Sale Terms &amp; Description Note</label>
              <textarea
                rows="3"
                value={form.saleCountdownSubtitle || 'Limited batch festive kurtha sets with hand zari needlework. Offer valid while stocks last.'}
                onChange={e => setForm({ ...form, saleCountdownSubtitle: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>CTA Button Destination</label>
              <input
                type="text"
                value={form.saleCountdownCtaLink || '#collection'}
                onChange={e => setForm({ ...form, saleCountdownCtaLink: e.target.value })}
                placeholder="#collection, /collection, or /occasions"
              />
            </div>
          </div>
        )}

        <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary-marigold">
            Save All Settings to Database
          </button>
        </div>
      </form>
    </div>
  );
}
