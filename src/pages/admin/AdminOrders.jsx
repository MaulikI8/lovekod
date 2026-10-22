import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { WhatsAppIcon } from '../../components/Icons';
import { nepalDistricts } from '../../data/districts';

export default function AdminOrders() {
  const { orders, updateOrderStatus, products, createManualOrder, lookupCustomer } = useStore();
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New order form state
  const initialForm = {
    fullName: '',
    phone: '',
    email: '',
    whatsapp: '',
    sameAsPhone: true,
    district: 'Kathmandu',
    city: 'Kathmandu',
    address: '',
    note: '',
    channel: 'Website',
    paymentMethod: 'COD',
    status: 'Pending',
    items: [
      {
        productId: products[0]?.id || '',
        name: products[0]?.name || '',
        size: 'M',
        quantity: 1,
        price: products[0]?.price || 2999,
        image: products[0]?.image || '/images/kurtha-charcoal.jpg',
      }
    ]
  };

  const [formData, setFormData] = useState(initialForm);
  const [customerLookupStatus, setCustomerLookupStatus] = useState(null);

  const handlePhoneLookup = async (val) => {
    setFormData(prev => ({ ...prev, phone: val }));
    const clean = val.replace(/[^0-9]/g, '');
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
          whatsapp: prev.sameAsPhone ? val : (c.whatsapp || prev.whatsapp),
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

  const filteredOrders = orders.filter(o => {
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
      `Namaste ${order.customer?.fullName}! This is LoveKod reaching out regarding your festive order (${order.id}). We are processing your delivery for ${order.customer?.district}!`
    );
    const phone = order.customer?.whatsapp || order.customer?.phone;
    return `https://wa.me/977${phone?.replace(/^0+/, '').replace(/^\+?977/, '')}?text=${text}`;
  };

  const handleProductSelect = (index, prodId) => {
    const prod = products.find(p => p.id === prodId);
    setFormData(prev => {
      const newItems = [...prev.items];
      if (prod) {
        newItems[index] = {
          ...newItems[index],
          productId: prod.id,
          name: prod.name,
          price: prod.price,
          image: prod.image,
        };
      } else {
        newItems[index] = {
          ...newItems[index],
          productId: '',
          name: '',
          price: 0,
        };
      }
      return { ...prev, items: newItems };
    });
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const addItemRow = () => {
    const defProd = products[0];
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: defProd?.id || '',
          name: defProd?.name || '',
          size: 'M',
          quantity: 1,
          price: defProd?.price || 2999,
          image: defProd?.image || '/images/kurtha-charcoal.jpg',
        }
      ]
    }));
  };

  const removeItemRow = (index) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculatedItemsTotal = formData.items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const deliveryFee = calculatedItemsTotal >= 3000 ? 0 : 150;
  const grandTotal = calculatedItemsTotal + deliveryFee;

  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('Please fill in customer full name, contact phone number, and delivery address.');
      return;
    }

    if (formData.items.length === 0 || !formData.items[0].name) {
      alert('Please add at least one garment outfit to this order.');
      return;
    }

    setIsSubmitting(true);
    const orderPayload = {
      channel: formData.channel || 'Website',
      customer: {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: (formData.email || '').trim(),
        whatsapp: formData.sameAsPhone ? formData.phone.trim() : (formData.whatsapp.trim() || formData.phone.trim()),
        district: formData.district,
        city: formData.city.trim() || formData.district,
        address: formData.address.trim(),
        note: formData.note.trim(),
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

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Customer Orders ({orders.length})</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Live customer orders from lovekod.com with real-time Tihar delivery tracking and dispatch status.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="admin-btn"
          style={{
            background: 'var(--marigold)',
            color: '#1a0d08',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '4px',
            boxShadow: '0 4px 14px rgba(230,138,0,0.25)',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
          <span>Create New Order</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by Order ID, name, phone, district..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            maxWidth: '340px', width: '100%', background: 'var(--night-surface)',
            border: '1px solid var(--night-border)', color: '#fff', padding: '10px 14px',
            borderRadius: 'var(--radius-sm)', fontSize: '0.88rem'
          }}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="admin-btn"
              style={{
                background: statusFilter === st ? 'var(--marigold)' : 'var(--night-surface)',
                color: statusFilter === st ? '#1a0d08' : 'var(--text-body)',
                fontWeight: statusFilter === st ? 700 : 500,
                borderColor: statusFilter === st ? 'var(--marigold)' : 'var(--night-border)'
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
                borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex',
                flexDirection: 'column', gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--night-border)', paddingBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--marigold)', fontSize: '1.05rem' }}>
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
                      background: 'var(--night-surface)', border: '1px solid var(--marigold)',
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
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Items Reserved
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <img src={item.image} alt={item.name} style={{ width: '38px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Size: <strong style={{ color: 'var(--marigold)' }}>{item.size}</strong> • Qty: {item.quantity} • Rs. {(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details */}
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Recipient &amp; Delivery Destination
                  </div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{order.customer?.fullName}</div>
                  <div style={{ color: 'var(--text-body)', marginTop: '2px' }}>Phone: {order.customer?.phone}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px' }}>
                    {order.customer?.address}, {order.customer?.city}, <strong>{order.customer?.district}</strong>
                  </div>
                  {order.customer?.note && (
                    <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--marigold-light)', fontStyle: 'italic' }}>
                      Note: "{order.customer?.note}"
                    </div>
                  )}
                </div>

                {/* Payment & Total */}
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Payment &amp; Total
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <strong style={{ color: '#fff' }}>{order.customer?.paymentMethod}</strong>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--marigold)' }} className="tabular-num">
                    Rs. {order.total?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {order.total >= 3000 ? 'Free Delivery Applied' : 'Standard Delivery (Rs. 150)'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CREATE ORDER MODAL ── */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div
            style={{
              background: 'var(--night-surface, #1C120C)',
              border: '1px solid var(--marigold, #C47820)',
              borderRadius: '8px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              color: '#fff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--marigold)' }}>Create Customer Order</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Record a custom order received via WhatsApp, phone call, or boutique walk-in.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrderSubmit}>
              {/* Customer Details */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--marigold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  Customer Details
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Contact Phone * (Primary Key)
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9841XXXXXX"
                      value={formData.phone}
                      onChange={e => handlePhoneLookup(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                    />
                    {customerLookupStatus?.exists && (
                      <div style={{ marginTop: '5px', fontSize: '0.75rem', color: '#10b981', background: 'rgba(16,185,129,0.12)', padding: '3px 8px', borderRadius: '4px' }}>
                        ✓ Existing Customer: <strong>{customerLookupStatus.name}</strong> • {customerLookupStatus.orders} previous orders • Spent: Rs. {customerLookupStatus.spent.toLocaleString()}
                      </div>
                    )}
                    {customerLookupStatus && !customerLookupStatus.exists && (
                      <div style={{ marginTop: '5px', fontSize: '0.75rem', color: '#60a5fa', background: 'rgba(59,130,246,0.12)', padding: '3px 8px', borderRadius: '4px' }}>
                        ℹ New customer will be auto-saved in Customer directory.
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Customer Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alisha Shrestha"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Customer Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. customer@example.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Order Channel / Label (Source)
                    </label>
                    <select
                      value={formData.channel}
                      onChange={e => setFormData({ ...formData, channel: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                    >
                      <option value="Website">Website (Default)</option>
                      <option value="WhatsApp">WhatsApp Order</option>
                      <option value="Instagram">Instagram DM</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      WhatsApp Number
                    </label>
                    <input
                      type="tel"
                      disabled={formData.sameAsPhone}
                      placeholder="98XXXXXXXX"
                      value={formData.sameAsPhone ? formData.phone : formData.whatsapp}
                      onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem', opacity: formData.sameAsPhone ? 0.6 : 1 }}
                    />
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.sameAsPhone}
                        onChange={e => setFormData({ ...formData, sameAsPhone: e.target.checked })}
                      />
                      Same as phone number
                    </label>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      District (77 Districts) *
                    </label>
                    <select
                      value={formData.district}
                      onChange={e => setFormData({ ...formData, district: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                    >
                      {nepalDistricts.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      City / Area *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lalitpur, Pokhara"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      Street Address / Chowk *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Near Bhatbhateni, Pulchowk"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Special Delivery Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Deliver before Bhai Tika afternoon"
                    value={formData.note}
                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              {/* Garment Items Builder */}
              <div style={{ marginBottom: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--marigold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Garment Items ({formData.items.length})
                  </h4>
                  <button
                    type="button"
                    onClick={addItemRow}
                    style={{ background: 'rgba(230,138,0,0.15)', border: '1px solid var(--marigold)', color: 'var(--marigold)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    + Add Another Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {formData.items.map((it, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#261811',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        padding: '12px',
                        display: 'grid',
                        gridTemplateColumns: '2fr 80px 70px 100px 32px',
                        gap: '10px',
                        alignItems: 'center'
                      }}
                    >
                      {/* Product select or custom name */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          Product / Outfit
                        </label>
                        <select
                          value={it.productId}
                          onChange={e => handleProductSelect(idx, e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', background: '#1c120c', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.82rem' }}
                        >
                          <option value="">Custom Outfit Name</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Rs. {p.price})
                            </option>
                          ))}
                        </select>
                        {!it.productId && (
                          <input
                            type="text"
                            placeholder="Type garment name"
                            value={it.name}
                            onChange={e => handleItemChange(idx, 'name', e.target.value)}
                            style={{ width: '100%', marginTop: '4px', padding: '4px 8px', background: '#1c120c', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem' }}
                          />
                        )}
                      </div>

                      {/* Size */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          Size
                        </label>
                        <select
                          value={it.size}
                          onChange={e => handleItemChange(idx, 'size', e.target.value)}
                          style={{ width: '100%', padding: '6px 4px', background: '#1c120c', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.82rem' }}
                        >
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                        </select>
                      </div>

                      {/* Qty */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={it.quantity}
                          onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                          style={{ width: '100%', padding: '6px 4px', background: '#1c120c', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.82rem' }}
                        />
                      </div>

                      {/* Price */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          Unit Rs.
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={it.price}
                          onChange={e => handleItemChange(idx, 'price', parseInt(e.target.value, 10) || 0)}
                          style={{ width: '100%', padding: '6px 4px', background: '#1c120c', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.82rem' }}
                        />
                      </div>

                      {/* Remove Button */}
                      <div>
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          disabled={formData.items.length <= 1}
                          style={{ marginTop: '14px', background: 'transparent', border: 'none', color: formData.items.length <= 1 ? '#555' : '#e57373', fontSize: '1.1rem', cursor: formData.items.length <= 1 ? 'not-allowed' : 'pointer' }}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment & Order Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                  >
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="DynamicQR">Dynamic QR Pay</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Initial Order Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Total Summary */}
              <div style={{ background: '#261811', padding: '14px 18px', borderRadius: '6px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Subtotal: Rs. {calculatedItemsTotal.toLocaleString()} + Delivery: {deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee}`}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--marigold)' }}>
                    Total: Rs. {grandTotal.toLocaleString()}
                  </div>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  Auto-synced to DB &amp; Django Admin
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '10px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '10px 24px',
                    background: 'var(--marigold)',
                    color: '#1a0d08',
                    border: 'none',
                    fontWeight: 700,
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Creating Order...' : 'Confirm & Save Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
