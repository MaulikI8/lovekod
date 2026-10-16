import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { nepalDistricts } from '../data/districts';
import { DiyaIcon, ShieldCheckIcon, ArrowRightIcon } from '../components/Icons';

export default function Checkout() {
  const { cart, products, cartTotal, placeOrder, siteSettings } = useStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    whatsapp: '',
    sameAsPhone: true,
    district: 'Kathmandu',
    city: '',
    address: '',
    note: '',
    paymentMethod: 'DynamicQR',
  });

  const [submitting, setSubmitting] = useState(false);

  if (cart.length === 0) {
    return (
      <div className="section not-found-section" style={{ textAlign: 'center', padding: '100px 24px' }}>
        <h2>Your Shopping Bag is Empty</h2>
        <p>Choose an exquisite kurtha set to celebrate Tihar in royal splendor.</p>
        <Link to="/" className="btn-primary-marigold">Explore Collection</Link>
      </div>
    );
  }

  const deliveryFee = 150;
  const grandTotal = cartTotal + deliveryFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.address) {
      alert('Please fill in your name, phone number, and delivery address.');
      return;
    }

    setSubmitting(true);
    const orderData = {
      ...formData,
      whatsapp: formData.sameAsPhone ? formData.phone : formData.whatsapp,
    };

    const newOrder = placeOrder(orderData);
    setSubmitting(false);
    navigate(`/order-success/${newOrder.id}`);
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

        <div className="summary-calc-rows">
          <div className="calc-row">
            <span>Subtotal</span>
            <span className="tabular-num">Rs. {cartTotal.toLocaleString()}</span>
          </div>
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

        <div className="form-row">
          <div className="form-group">
            <label>Mobile Contact Number *</label>
            <input
              type="tel"
              required
              placeholder="e.g. 9841XXXXXX"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
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
            <label>District (Nepal 77 Districts) *</label>
            <select
              value={formData.district}
              onChange={e => setFormData({ ...formData, district: e.target.value })}
            >
              {nepalDistricts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
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
          <div className="payment-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <label className={`pay-option ${formData.paymentMethod === 'DynamicQR' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                value="DynamicQR"
                checked={formData.paymentMethod === 'DynamicQR'}
                onChange={() => setFormData({ ...formData, paymentMethod: 'DynamicQR' })}
              />
              <span className="pay-opt-title">Dynamic QR Pay</span>
              <span className="pay-opt-desc">Instant scan &amp; auto-capture</span>
            </label>

            <label className={`pay-option ${formData.paymentMethod === 'COD' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={formData.paymentMethod === 'COD'}
                onChange={() => setFormData({ ...formData, paymentMethod: 'COD' })}
              />
              <span className="pay-opt-title">Cash on Delivery</span>
              <span className="pay-opt-desc">Pay upon receiving</span>
            </label>
          </div>

          {formData.paymentMethod === 'DynamicQR' && (
            <div className="payment-notice-banner">
              <ShieldCheckIcon size={16} />
              <span>
                Dynamic QR code with instant automated payment acceptance will be presented upon order placement.
              </span>
            </div>
          )}
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
