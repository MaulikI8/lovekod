import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { WhatsAppIcon } from '../../components/Icons';
import LocationAutocomplete from '../../components/common/LocationAutocomplete';

export default function AdminOrders() {
  const { orders, updateOrderStatus, products, createManualOrder, lookupCustomer } = useStore();
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);

  // New order form state matching Blanxer compact layout
  const initialForm = {
    phone: '',
    fullName: '',
    email: '',
    whatsapp: '',
    district: 'Kathmandu Inside Ring Road',
    address: '',
    landmark: '',
    altPhone: '',
    note: '',
    discount: 0,
    deliveryCharge: 150,
    paymentMethod: 'COD',
    status: 'Pending',
    channel: 'WhatsApp',
    items: [],
  };

  const [formData, setFormData] = useState(initialForm);
  const [customerLookupStatus, setCustomerLookupStatus] = useState(null);

  // State for the inline product selector
  const [pendingProduct, setPendingProduct] = useState({
    productId: products[0]?.id || '',
    name: products[0]?.name || '',
    size: 'M',
    quantity: 1,
    price: products[0]?.price || 2999,
    image: products[0]?.image || '/images/kurtha-charcoal.jpg',
  });

  const handlePhoneLookup = async (val) => {
    const rawVal = val || '';
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
          spent: c.totalSpent || 0,
        });
        setFormData(prev => ({
          ...prev,
          fullName: prev.fullName || c.name || '',
          email: prev.email || c.email || '',
          whatsapp: prev.whatsapp || c.whatsapp || clean,
          district: c.district || prev.district,
          address: prev.address || c.address || '',
        }));
      } else {
        setCustomerLookupStatus({ exists: false, phone: clean });
      }
    } else if (clean.length < 7) {
      setCustomerLookupStatus(null);
    }
  };

  const handleAddProductToOrder = () => {
    if (!pendingProduct.name) return;
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: pendingProduct.productId || '',
          name: pendingProduct.name,
          size: pendingProduct.size || 'M',
          quantity: Math.max(1, parseInt(pendingProduct.quantity, 10) || 1),
          price: Math.max(0, parseInt(pendingProduct.price, 10) || 0),
          image: pendingProduct.image || '/images/kurtha-charcoal.jpg',
        }
      ]
    }));
    setShowProductPicker(false);
  };

  const handleAddCustomItem = () => {
    const customName = prompt('Enter custom outfit / garment name:');
    if (!customName || !customName.trim()) return;
    const priceStr = prompt('Enter unit price (in Rs.):', '2999');
    const priceNum = parseInt(priceStr, 10) || 0;
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          name: customName.trim(),
          size: 'M',
          quantity: 1,
          price: priceNum,
          image: '/images/kurtha-charcoal.jpg',
        }
      ]
    }));
  };

  const removeItemRow = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculatedItemsTotal = formData.items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const discountVal = Math.max(0, parseInt(formData.discount, 10) || 0);
  const deliveryChargeVal = Math.max(0, parseInt(formData.deliveryCharge, 10) || 0);
  const grandTotal = Math.max(0, calculatedItemsTotal - discountVal) + deliveryChargeVal;

  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone.trim()) {
      alert('Please enter customer contact phone number (Primary Key).');
      return;
    }
    if (!formData.fullName.trim()) {
      alert('Please enter customer full name.');
      return;
    }
    if (!formData.address.trim()) {
      alert('Please enter street delivery address.');
      return;
    }
    if (formData.items.length === 0) {
      alert('Please add at least one garment product to create this order.');
      return;
    }

    setIsSubmitting(true);
    const orderPayload = {
      channel: formData.channel || 'Website',
      customer: {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: (formData.email || '').trim(),
        whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
        district: formData.district || 'Kathmandu Inside Ring Road',
        city: formData.district || 'Kathmandu',
        address: formData.address.trim() + (formData.landmark.trim() ? ` (Near: ${formData.landmark.trim()})` : ''),
        note: formData.note.trim() + (formData.altPhone.trim() ? ` [Alt Phone: ${formData.altPhone.trim()}]` : ''),
        paymentMethod: formData.paymentMethod,
      },
      items: formData.items.map(it => ({
        productId: it.productId || '',
        name: it.name || 'Festive Kurtha Set',
        size: it.size || 'M',
        quantity: Math.max(1, parseInt(it.quantity, 10) || 1),
        price: Math.max(0, parseInt(it.price, 10) || 0),
        image: it.image || '/images/kurtha-charcoal.jpg',
      })),
      discountAmount: discountVal,
      total: grandTotal,
      status: formData.status,
    };

    try {
      await createManualOrder(orderPayload);
      setIsSubmitting(false);
      setShowCreateModal(false);
      setFormData(initialForm);
      setCustomerLookupStatus(null);
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
    }
  };

  // Strictly sorted newest first (Every new order on top)
  const filteredOrders = orders
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .filter(o => {
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = o.id?.toLowerCase().includes(q);
        const matchName = o.customer?.fullName?.toLowerCase().includes(q);
        const matchPhone = o.customer?.phone?.includes(q);
        const matchDistrict = o.customer?.district?.toLowerCase().includes(q);
        return matchId || matchName || matchPhone || matchDistrict;
      }
      return true;
    });

  const getWaMessageLink = (order) => {
    const text = encodeURIComponent(
      `Namaste ${order.customer?.fullName}! This is LoveKod reaching out regarding your order (${order.id}). We are processing your delivery for ${order.customer?.district}!`
    );
    const phone = order.customer?.whatsapp || order.customer?.phone;
    return `https://wa.me/977${phone?.replace(/^0+/, '').replace(/^\+?977/, '')}?text=${text}`;
  };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Customer Orders ({orders.length})</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Live customer orders with sequential IDs (#1001, #1002...), real-time customer linkage, and status tracking.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData(initialForm);
            setCustomerLookupStatus(null);
            setShowCreateModal(true);
          }}
          className="admin-btn"
          style={{
            background: '#7c3aed',
            color: '#fff',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
          }}
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
          <span>Create Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by Order ID, customer name, mobile phone, district..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            maxWidth: '360px', width: '100%', background: 'var(--night-surface)',
            border: '1px solid var(--night-border)', color: '#fff', padding: '10px 14px',
            borderRadius: 'var(--radius-sm)', fontSize: '0.88rem'
          }}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="admin-btn"
              style={{
                background: statusFilter === st ? '#7c3aed' : 'var(--night-surface)',
                color: statusFilter === st ? '#fff' : 'var(--text-body)',
                fontWeight: statusFilter === st ? 700 : 500,
                borderColor: statusFilter === st ? '#7c3aed' : 'var(--night-border)'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ background: 'var(--night-card)', padding: '48px', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--night-border)', color: 'var(--text-muted)' }}>
          No orders found matching your filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map(order => (
            <div
              key={order.id}
              style={{
                background: 'var(--night-card)', border: '1px solid var(--night-border)',
                borderRadius: 'var(--radius-md)', padding: '22px', display: 'flex',
                flexDirection: 'column', gap: '14px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--night-border)', paddingBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#c084fc', fontSize: '1.1rem' }}>
                      {order.id}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      background: order.channel === 'WhatsApp' ? 'rgba(37, 211, 102, 0.15)' : order.channel === 'Instagram' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: order.channel === 'WhatsApp' ? '#25D366' : order.channel === 'Instagram' ? '#f472b6' : '#60a5fa',
                      border: `1px solid ${order.channel === 'WhatsApp' ? 'rgba(37, 211, 102, 0.3)' : order.channel === 'Instagram' ? 'rgba(236, 72, 153, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                    }}>
                      {order.channel || 'Website'}
                    </span>
                    <span className={`status-badge ${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Placed on: {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
                  <select
                    value={order.status}
                    onChange={e => updateOrderStatus(order.id, e.target.value)}
                    style={{
                      background: 'var(--night-surface)', border: '1px solid #7c3aed',
                      color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <a
                    href={getWaMessageLink(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-square"
                    style={{ height: '36px', width: '36px' }}
                    title="Send WhatsApp message to customer"
                  >
                    <WhatsAppIcon size={18} />
                  </a>
                </div>
              </div>

              {/* Order Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px', fontSize: '0.88rem' }}>
                {/* Items */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Items Reserved ({order.items?.length || 0})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <img src={item.image} alt={item.name} style={{ width: '36px', height: '46px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Size: <strong style={{ color: '#c084fc' }}>{item.size}</strong> • Qty: {item.quantity} • Rs. {(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Customer &amp; Location
                  </div>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{order.customer?.fullName}</div>
                  <div style={{ fontSize: '0.82rem', color: '#c084fc', fontFamily: 'monospace', marginTop: '2px' }}>
                    {order.customer?.phone}
                  </div>
                  {order.customer?.email && (
                    <div style={{ fontSize: '0.78rem', color: '#93c5fd' }}>{order.customer.email}</div>
                  )}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {order.customer?.address}, {order.customer?.district}
                  </div>
                  {order.customer?.note && (
                    <div style={{ marginTop: '6px', fontSize: '0.78rem', color: '#fde047', fontStyle: 'italic' }}>
                      "{order.customer.note}"
                    </div>
                  )}
                </div>

                {/* Payment & Total */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Payment &amp; Total
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <strong style={{ color: '#fff' }}>{order.customer?.paymentMethod}</strong>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }} className="tabular-num">
                    Rs. {order.total?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {order.discountAmount > 0 && <span style={{ color: '#34d399', marginRight: '6px' }}>Discount: Rs. {order.discountAmount}</span>}
                    {order.total >= 3000 ? 'Free Delivery' : 'Standard Delivery'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── BLANXER-STYLE COMPACT CREATE ORDER MODAL ── */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div
            style={{
              background: '#18110c',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '94vh',
              overflowY: 'auto',
              padding: '22px 24px',
              boxShadow: '0 24px 50px rgba(0,0,0,0.8)',
              color: '#fff'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                Create Order
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit}>
              {/* 1. Customer Section */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: '6px' }}>
                  Customer
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="tel"
                    required
                    placeholder="Search by phone (e.g. 9841XXXXXX)"
                    value={formData.phone}
                    onChange={e => handlePhoneLookup(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', background: '#221610', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', color: '#fff', fontSize: '0.88rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => handlePhoneLookup(formData.phone)}
                    style={{
                      padding: '8px 14px',
                      background: 'rgba(124, 58, 237, 0.15)',
                      border: '1px solid #7c3aed',
                      color: '#c084fc',
                      borderRadius: '6px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    🔍 Search Customer
                  </button>
                </div>

                {customerLookupStatus?.exists && (
                  <div style={{ marginTop: '6px', padding: '6px 10px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '5px', fontSize: '0.78rem', color: '#34d399' }}>
                    ✓ <strong>{customerLookupStatus.name}</strong> • {customerLookupStatus.orders} previous orders • Spent: Rs. {customerLookupStatus.spent.toLocaleString()}
                  </div>
                )}

                {/* Name & Email Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alisha Shrestha"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', background: '#221610', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '5px', color: '#fff', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. alisha@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', background: '#221610', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '5px', color: '#fff', fontSize: '0.84rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Products Section */}
              <div style={{ marginBottom: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                    Products ({formData.items.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    style={{
                      background: 'transparent',
                      border: '1px solid #7c3aed',
                      color: '#c084fc',
                      padding: '3px 9px',
                      borderRadius: '5px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + Add Custom Item
                  </button>
                </div>

                {/* Items Box / Empty State */}
                <div style={{ background: '#221610', border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '6px', padding: '12px', minHeight: '60px' }}>
                  {formData.items.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        No products selected
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowProductPicker(true)}
                        style={{
                          background: '#7c3aed',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 14px',
                          borderRadius: '5px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        ➕ Add Products
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {formData.items.map((it, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 8px',
                            background: '#19100a',
                            borderRadius: '5px',
                            border: '1px solid rgba(255,255,255,0.06)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src={it.image} alt={it.name} style={{ width: '32px', height: '40px', objectFit: 'cover', borderRadius: '3px' }} />
                            <div>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{it.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                Size: <span style={{ color: '#c084fc', fontWeight: 700 }}>{it.size}</span> • Qty: {it.quantity} • Rs. {it.price.toLocaleString()}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#10b981' }}>
                              Rs. {(it.price * it.quantity).toLocaleString()}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeItemRow(idx)}
                              style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.95rem', cursor: 'pointer', padding: '0 4px' }}
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setShowProductPicker(true)}
                          style={{ background: 'transparent', border: 'none', color: '#c084fc', fontSize: '0.76rem', cursor: 'pointer', fontWeight: 600 }}
                        >
                          + Add More Products
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Inline Product Picker */}
                  {showProductPicker && (
                    <div style={{ marginTop: '10px', padding: '10px', background: '#19100a', border: '1px solid #7c3aed', borderRadius: '6px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#c084fc', marginBottom: '8px' }}>
                        Select Product &amp; Size
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 60px', gap: '8px', marginBottom: '8px' }}>
                        <select
                          value={pendingProduct.productId}
                          onChange={e => {
                            const p = products.find(pr => pr.id === e.target.value);
                            if (p) {
                              setPendingProduct(prev => ({
                                ...prev,
                                productId: p.id,
                                name: p.name,
                                price: p.price,
                                image: p.image,
                              }));
                            }
                          }}
                          style={{ width: '100%', padding: '6px 8px', background: '#221610', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Rs. {p.price.toLocaleString()})
                            </option>
                          ))}
                        </select>

                        <select
                          value={pendingProduct.size}
                          onChange={e => setPendingProduct(prev => ({ ...prev, size: e.target.value }))}
                          style={{ width: '100%', padding: '6px 6px', background: '#221610', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                        >
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>

                        <input
                          type="number"
                          min="1"
                          value={pendingProduct.quantity}
                          onChange={e => setPendingProduct(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) || 1 }))}
                          style={{ width: '100%', padding: '6px 6px', background: '#221610', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setShowProductPicker(false)}
                          style={{ padding: '4px 10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', fontSize: '0.76rem', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddProductToOrder}
                          style={{ padding: '4px 14px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Add to Order
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Compact Two-Column Form */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    City / District * (Type to Search)
                  </label>
                  <LocationAutocomplete
                    required
                    value={formData.district}
                    onChange={val => setFormData({ ...formData, district: val })}
                    placeholder="e.g. Sunsari, Kathmandu..."
                    inputStyle={{
                      padding: '7px 10px',
                      background: '#221610',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '5px',
                      color: '#fff',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    Address * (Manually typed)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Main Road, Ward 4"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', background: '#221610', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '5px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Bhatbhateni"
                    value={formData.landmark}
                    onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', background: '#221610', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '5px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    Alternative Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={formData.altPhone}
                    onChange={e => setFormData({ ...formData, altPhone: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', background: '#221610', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '5px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    Order Note
                  </label>
                  <input
                    type="text"
                    placeholder="Special delivery notes"
                    value={formData.note}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', background: '#221610', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '5px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    Discount (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.discount}
                    onChange={e => setFormData({ ...formData, discount: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', background: '#221610', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '5px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    Delivery Charge (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deliveryCharge}
                    onChange={e => setFormData({ ...formData, deliveryCharge: e.target.value })}
                    style={{ width: '100%', padding: '7px 10px', background: '#221610', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '5px', color: '#fff', fontSize: '0.84rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    style={{ width: '100%', padding: '7px 8px', background: '#221610', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '5px', color: '#fff', fontSize: '0.84rem' }}
                  >
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="DynamicQR">Dynamic QR Pay</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                    Channel / Label
                  </label>
                  <select
                    value={formData.channel}
                    onChange={e => setFormData({ ...formData, channel: e.target.value })}
                    style={{ width: '100%', padding: '7px 8px', background: '#221610', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '5px', color: '#fff', fontSize: '0.84rem' }}
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Website">Website</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
                <div style={{ fontSize: '0.8rem', color: formData.items.length > 0 ? '#10b981' : 'var(--text-muted)' }}>
                  {formData.items.length > 0 ? (
                    <span>Grand Total: <strong>Rs. {grandTotal.toLocaleString()}</strong></span>
                  ) : (
                    <span>Add a customer and at least one product to create the order.</span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '5px', fontSize: '0.84rem', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || formData.items.length === 0}
                    style={{
                      padding: '8px 22px',
                      background: '#7c3aed',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 700,
                      borderRadius: '5px',
                      fontSize: '0.84rem',
                      cursor: (isSubmitting || formData.items.length === 0) ? 'not-allowed' : 'pointer',
                      opacity: (isSubmitting || formData.items.length === 0) ? 0.6 : 1,
                    }}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Order'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
