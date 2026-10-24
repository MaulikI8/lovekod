import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { nepalDistricts } from '../data/districts';
import LocationAutocomplete from '../components/common/LocationAutocomplete';
import { DiyaIcon, ShieldCheckIcon, ArrowRightIcon } from '../components/Icons';

export default function Checkout() {
  const { cart, products, cartTotal, placeOrder, siteSettings, lookupCustomer, validateCoupon } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    whatsapp: '',
    sameAsPhone: true,
    district: 'Kathmandu',
    city: '',
    address: '',
    note: '',
    paymentMethod: 'COD',
  });
  const [customerLookupStatus, setCustomerLookupStatus] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  
  const handlePhoneChange = async (e) => {
    const rawVal = e.target.value;
    setFormData(prev => ({ ...prev, phone: rawVal }));

    const clean = rawVal.replace(/[^0-9]/g, '');
    if (clean.length >= 10 && lookupCustomer) {
      const res = await lookupCustomer(clean);
      if (res && res.exists && res.customer) {
        const c = res.customer;
        setCustomerLookupStatus({
          exists: true,
          name: c.name,
          phone: c.phone,
          orders: c.totalOrders || 0,
        });
        setFormData(prev => ({
          ...prev,
          fullName: prev.fullName || c.name || '',
          email: prev.email || c.email || '',
          whatsapp: prev.sameAsPhone ? rawVal : (c.whatsapp || prev.whatsapp),
          district: c.district || prev.district,
          city: (prev.city && prev.city !== 'Kathmandu') ? prev.city : (c.city || prev.city),
          address: prev.address || c.address || '',
        }));
      } else {
        setCustomerLookupStatus({ exists: false, phone: clean });
      }
    } else if (clean.length < 7) {
      setCustomerLookupStatus(null);
    }
  };

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponFeedback, setCouponFeedback] = useState(null);

  const handleApplyCoupon = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponLoading(true);
    setCouponFeedback(null);
    try {
      // 1. Instant validation against StoreContext (supports all admin-created coupons)
      if (typeof validateCoupon === 'function') {
        const localRes = validateCoupon(code, cartTotal);
        if (localRes.valid) {
          setAppliedCoupon({
            code: localRes.code,
            discountType: localRes.discountType === 'percent' ? 'percentage' : 'fixed',
            discountValue: localRes.discountValue,
            discountAmount: localRes.discountAmount,
            message: localRes.message,
          });
          setCouponFeedback({ type: 'success', message: localRes.message });
          setCouponLoading(false);
          return;
        } else {
          setAppliedCoupon(null);
          setCouponFeedback({ type: 'error', message: localRes.message });
          setCouponLoading(false);
          return;
        }
      }

      // 2. Fallback to API endpoint
      const res = await fetch(`/api/coupons/validate/?code=${encodeURIComponent(code)}&subtotal=${cartTotal}`);
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedCoupon(data);
        setCouponFeedback({ type: 'success', message: data.message });
      } else {
        setAppliedCoupon(null);
        setCouponFeedback({ type: 'error', message: data.message || 'Invalid coupon code.' });
      }
    } catch {
      setAppliedCoupon(null);
      setCouponFeedback({ type: 'error', message: 'Could not validate coupon. Please try again.' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponFeedback(null);
  };

  if (cart.length === 0) {
    return (
      <div className="section not-found-section" style={{ textAlign: 'center', padding: '100px 24px' }}>
        <h2>Your Shopping Bag is Empty</h2>
        <p>Choose an exquisite kurtha set to celebrate Tihar in royal splendor.</p>
        <Link to="/" className="btn-primary-marigold">Explore Collection</Link>
      </div>
    );
  }

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const deliveryFee = 150;
  const grandTotal = Math.max(0, cartTotal - discountAmount) + deliveryFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert('Please fill in your name, phone number, and delivery address.');
      return;
    }

    setSubmitting(true);
    const orderData = {
      ...formData,
      email: (formData.email || '').trim(),
      channel: 'Website',
      whatsapp: formData.sameAsPhone ? formData.phone : formData.whatsapp,
      couponCode: appliedCoupon?.code || '',
      discountAmount: discountAmount,
      total: grandTotal,
    };

    try {
      const newOrder = await placeOrder(orderData);
      setSubmitting(false);
      const targetId = newOrder?.id || ('ORD-' + Date.now().toString(36).toUpperCase());
      navigate(`/order-success/${targetId}`);
    } catch (err) {
      console.error('Order placement failed:', err);
      setSubmitting(false);
      alert('Unable to process order. Please try again or message our WhatsApp concierge directly.');
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-header-title">
        <DiyaIcon size={24} active={true} />
        <h2>Tihar Order Checkout</h2>
      </div>

      {/* Order Items Preview */}
      <div className="order-summary-box">
        <h3>Order Summary ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h3>
        <div className="summary-items-list">
          {cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            return (
              <div key={`${item.productId}-${item.size}`} className="summary-item-row">
                <img src={product.image} alt={product.name} />
                <div className="summary-item-details">
                  <div className="summary-item-name">{product.name}</div>
                  <div className="summary-item-meta">
                    Size: <strong>{item.size}</strong> • Qty: {item.quantity}
                  </div>
                </div>
                <div className="summary-item-price tabular-num">
                  Rs. {(product.price * item.quantity).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Discount Coupon Box */}
        <div className="checkout-coupon-section" style={{ margin: '16px 0', padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--marigold-gold, #f59e0b)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🏷️</span> Have a Discount Coupon?
            </span>
            {appliedCoupon && (
              <button
                type="button"
                onClick={handleRemoveCoupon}
                style={{ background: 'none', border: 'none', color: '#f87171', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: '2px 6px' }}
              >
                ✕ Remove
              </button>
            )}
          </div>

          {appliedCoupon ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}>
              <div>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#34d399', fontSize: '0.9rem' }}>
                  {appliedCoupon.code}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginLeft: '8px' }}>
                  ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% OFF` : `Rs. ${appliedCoupon.discountValue} OFF`})
                </span>
              </div>
              <span style={{ fontWeight: 700, color: '#34d399', fontSize: '0.85rem' }}>
                - Rs. {appliedCoupon.discountAmount.toLocaleString()}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. TIHAR10, LOVEKOD200"
                value={couponInput}
                onChange={e => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
              <button
                type="button"
                disabled={couponLoading || !couponInput.trim()}
                onClick={handleApplyCoupon}
                style={{ padding: '8px 16px', borderRadius: '8px', background: '#7C3AED', color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', opacity: couponLoading || !couponInput.trim() ? 0.6 : 1 }}
              >
                {couponLoading ? '...' : 'Apply'}
              </button>
            </div>
          )}

          {couponFeedback && (
            <div style={{ marginTop: '8px', fontSize: '0.78rem', color: couponFeedback.type === 'success' ? '#34d399' : '#f87171' }}>
              {couponFeedback.message}
            </div>
          )}
        </div>

        <div className="summary-calc-rows">
          <div className="calc-row">
            <span>Subtotal</span>
            <span className="tabular-num">Rs. {cartTotal.toLocaleString()}</span>
          </div>
          {discountAmount > 0 && (
            <div className="calc-row" style={{ color: '#34d399', fontWeight: 600 }}>
              <span>Coupon Discount ({appliedCoupon.code})</span>
              <span className="tabular-num">- Rs. {discountAmount.toLocaleString()}</span>
            </div>
          )}
          <div className="calc-row">
            <span>Standard Delivery</span>
            <span className="tabular-num">Rs. {deliveryFee}</span>
          </div>
          <div className="calc-total-row">
            <span>Grand Total</span>
            <span className="calc-total-num tabular-num">Rs. {grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Customer & Delivery Form */}
      <form onSubmit={handleSubmit} className="checkout-form-card">
        <h3 className="form-card-title">Delivery &amp; Contact Details</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Alisha Shrestha"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Email Address (Optional)</label>
            <input
              type="email"
              placeholder="e.g. alisha@example.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Mobile Contact Number *</label>
            <input
              type="tel"
              required
              placeholder="e.g. 9841XXXXXX"
              value={formData.phone}
              onChange={handlePhoneChange}
            />
            {customerLookupStatus?.exists && (
              <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>✓</span> Welcome back <strong>{customerLookupStatus.name}</strong>! Details auto-filled.
              </div>
            )}
            {customerLookupStatus && !customerLookupStatus.exists && (
              <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#60a5fa' }}>
                ℹ New customer account will be linked to this number.
              </div>
            )}
          </div>

          <div className="form-group">
            <label>WhatsApp Number</label>
            <input
              type="tel"
              placeholder="98XXXXXXXX"
              disabled={formData.sameAsPhone}
              value={formData.sameAsPhone ? formData.phone : formData.whatsapp}
              onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
            />
            <label className="checkbox-sublabel">
              <input
                type="checkbox"
                checked={formData.sameAsPhone}
                onChange={e => setFormData({ ...formData, sameAsPhone: e.target.checked })}
              />
              Same as mobile contact
            </label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City / District (Type to search) *</label>
            <LocationAutocomplete
              required
              value={formData.district}
              onChange={val => setFormData({ ...formData, district: val })}
              placeholder="e.g. Sunsari, Pokhara, Kathmandu..."
              inputStyle={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(0, 0, 0, 0.25)',
                color: '#fff',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div className="form-group">
            <label>City / Municipality *</label>
            <input
              type="text"
              required
              placeholder="e.g. Lalitpur, Pokhara, Butwal"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Street Address / Chowk / Landmark *</label>
          <textarea
            rows="2"
            required
            placeholder="e.g. Near Bhatbhateni Supermarket, Pulchowk"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Special Note for Tihar Delivery (Optional)</label>
          <input
            type="text"
            placeholder="e.g. Please deliver before Laxmi Puja evening"
            value={formData.note}
            onChange={e => setFormData({ ...formData, note: e.target.value })}
          />
        </div>

        {/* Payment Method Selection */}
        <div className="form-group payment-method-group">
          <label className="payment-select-label">Payment Method *</label>
          <div className="payment-grid" style={{ gridTemplateColumns: '1fr' }}>
            <label className="pay-option selected">
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={true}
                readOnly
              />
              <span className="pay-opt-title">Cash on Delivery (COD)</span>
              <span className="pay-opt-desc">Pay cash or mobile banking when your parcel arrives</span>
            </label>
          </div>

          <div className="payment-notice-banner">
            <ShieldCheckIcon size={16} />
            <span>
              Pay conveniently upon delivery across Nepal. No advance payment required.
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary-marigold btn-place-order"
        >
          <span>{submitting ? 'Placing Order...' : `Confirm Festive Order (Rs. ${grandTotal.toLocaleString()})`}</span>
          <ArrowRightIcon size={18} />
        </button>
      </form>
    </div>
  );
}
