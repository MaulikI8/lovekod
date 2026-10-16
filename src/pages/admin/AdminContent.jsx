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
          { id: 'story', label: 'Our Story & Diya Counter' },
          { id: 'contact', label: 'Concierge Contacts' },
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
                <label>Hero Main Image URL / Path</label>
                <input
                  type="text"
                  value={form.heroImage || ''}
                  onChange={e => setForm({ ...form, heroImage: e.target.value })}
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

        {/* ── 4. OUR STORY TAB ── */}
        {activeTab === 'story' && (
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.25rem', marginBottom: '18px' }}>
              Our Story &amp; Diya Counter Baseline
            </h3>
            <div className="form-row">
              <div className="form-group">
                <label>Section Tag</label>
                <input
                  type="text"
                  value={form.storyTag || ''}
                  onChange={e => setForm({ ...form, storyTag: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Story Main Title</label>
                <input
                  type="text"
                  value={form.storyTitle || ''}
                  onChange={e => setForm({ ...form, storyTitle: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>First Paragraph</label>
              <textarea
                rows="3"
                value={form.storyP1 || ''}
                onChange={e => setForm({ ...form, storyP1: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Second Paragraph</label>
              <textarea
                rows="3"
                value={form.storyP2 || ''}
                onChange={e => setForm({ ...form, storyP2: e.target.value })}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Featured Quote</label>
                <input
                  type="text"
                  value={form.storyQuote || ''}
                  onChange={e => setForm({ ...form, storyQuote: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Quote Attribution</label>
                <input
                  type="text"
                  value={form.storyQuoteAuthor || ''}
                  onChange={e => setForm({ ...form, storyQuoteAuthor: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Base Number of Diyas Lit</label>
              <input
                type="number"
                value={form.diyasLitCount || 108}
                onChange={e => setForm({ ...form, diyasLitCount: parseInt(e.target.value, 10) || 0 })}
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

        <div style={{ marginTop: '28px', display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn-primary-marigold">
            Save All Settings to Database
          </button>
        </div>
      </form>
    </div>
  );
}
