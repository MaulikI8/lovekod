import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { WhatsAppIcon } from '../../components/Icons';
import { nepalDistricts } from '../../data/districts';
import { Link } from 'react-router-dom';

export default function AdminCustomers() {
  const { customers = [], orders = [], addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for adding new customer
  const initialNewCustomer = {
    phone: '',
    name: '',
    email: '',
    whatsapp: '',
    sameAsPhone: true,
    district: 'Kathmandu',
    city: 'Kathmandu',
    address: '',
    note: '',
  };
  const [newCustForm, setNewCustForm] = useState(initialNewCustomer);

  // Merge backend customers with any active orders
  const unifiedMap = {};

  // First populate from customers table
  customers.forEach(c => {
    const key = (c.phone || '').trim();
    if (!key) return;
    unifiedMap[key] = {
      phone: c.phone,
      fullName: c.name || 'Valued Customer',
      email: c.email || '',
      whatsapp: c.whatsapp || c.phone,
      district: c.district || 'Kathmandu',
      city: c.city || 'Kathmandu',
      address: c.address || '',
      note: c.note || '',
      ordersCount: c.totalOrders || 0,
      totalSpent: c.totalSpent || 0,
      orders: [],
      createdAt: c.createdAt,
    };
  });

  // Link orders to customer
  orders.forEach(order => {
    const cust = order.customer || {};
    const key = (cust.phone || '').trim();
    if (key) {
      if (!unifiedMap[key]) {
        unifiedMap[key] = {
          phone: key,
          fullName: cust.fullName || 'Valued Customer',
          email: cust.email || '',
          whatsapp: cust.whatsapp || key,
          district: cust.district || 'Kathmandu',
          city: cust.city || 'Kathmandu',
          address: cust.address || '',
          note: cust.note || '',
          ordersCount: 0,
          totalSpent: 0,
          orders: [],
          createdAt: order.createdAt,
        };
      }
      unifiedMap[key].orders.push(order);
      // If customer table had 0 stats, compute from loaded orders
      if (unifiedMap[key].ordersCount === 0) {
        unifiedMap[key].ordersCount = unifiedMap[key].orders.length;
        unifiedMap[key].totalSpent = unifiedMap[key].orders.reduce((sum, o) => sum + (o.total || 0), 0);
      }
    }
  });

  const customerList = Object.values(unifiedMap).sort((a, b) => b.totalSpent - a.totalSpent);

  const filtered = customerList.filter(c => {
    const q = search.toLowerCase();
    return (c.fullName || '').toLowerCase().includes(q) ||
           (c.phone || '').includes(q) ||
           (c.email || '').toLowerCase().includes(q) ||
           (c.district || '').toLowerCase().includes(q) ||
           (c.city || '').toLowerCase().includes(q);
  });

  const getWaLink = (customer) => {
    const raw = customer.whatsapp || customer.phone;
    const clean = raw.replace(/[^\d]/g, '').replace(/^0+/, '').replace(/^977/, '');
    const text = encodeURIComponent(
      `Namaste ${customer.fullName}! This is LoveKod reaching out to you. How can we assist you today?`
    );
    return `https://wa.me/977${clean}?text=${text}`;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = newCustForm.phone.replace(/[^0-9]/g, '').trim();
    if (!cleanPhone) {
      alert('Mobile phone number is required as the unique primary key.');
      return;
    }
    if (!newCustForm.name.trim()) {
      alert('Please enter customer full name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCustomer({
        phone: cleanPhone,
        name: newCustForm.name.trim(),
        email: newCustForm.email.trim(),
        whatsapp: newCustForm.sameAsPhone ? cleanPhone : (newCustForm.whatsapp.trim() || cleanPhone),
        district: newCustForm.district,
        city: newCustForm.city.trim() || newCustForm.district,
        address: newCustForm.address.trim(),
        note: newCustForm.note.trim(),
      });
      setIsSubmitting(false);
      setShowAddModal(false);
      setNewCustForm(initialNewCustomer);
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setIsSubmitting(true);
    try {
      await updateCustomer(editingCustomer.phone, {
        name: editingCustomer.fullName,
        email: editingCustomer.email,
        whatsapp: editingCustomer.whatsapp,
        district: editingCustomer.district,
        city: editingCustomer.city,
        address: editingCustomer.address,
        note: editingCustomer.note,
      });
      setIsSubmitting(false);
      setEditingCustomer(null);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Customer Directory ({customerList.length})</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Standalone customer database with phone number as primary key, live order sync, and WhatsApp concierge.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowAddModal(true)}
            className="admin-btn"
            style={{
              background: 'var(--marigold)',
              color: '#1a0d08',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span>+</span>
            <span>Add New Customer</span>
          </button>
          <Link to="/admin/orders" className="admin-btn" style={{ background: 'var(--night-surface)', color: '#fff', border: '1px solid var(--night-border)' }}>
            View Orders
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search by customer name, mobile phone (primary key), email, district, city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            maxWidth: '440px', width: '100%', background: 'var(--night-surface)',
            border: '1px solid var(--night-border)', color: '#fff', padding: '10px 14px',
            borderRadius: 'var(--radius-sm)', fontSize: '0.88rem'
          }}
        />
      </div>

      {/* Customer Table */}
      {filtered.length === 0 ? (
        <div style={{ background: 'var(--night-card)', padding: '48px', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--night-border)', color: 'var(--text-muted)' }}>
          No customer records found matching your search.
        </div>
      ) : (
        <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone (Primary Key)</th>
                <th>Email Address</th>
                <th>Primary Location</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr key={idx} style={{ cursor: 'pointer' }} onClick={() => setSelectedCustomer(c)}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{c.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {c.address ? c.address.slice(0, 32) + (c.address.length > 32 ? '...' : '') : 'Nepal'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', color: 'var(--marigold-light, #fbbf24)', fontWeight: 600 }}>
                      {c.phone || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: c.email ? '#93c5fd' : 'var(--text-muted)' }}>
                      {c.email || '—'}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{c.city || c.district}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{c.district}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--marigold)' }}>
                    {c.ordersCount} {c.ordersCount === 1 ? 'order' : 'orders'}
                  </td>
                  <td style={{ fontWeight: 700, color: '#10b981' }} className="tabular-num">
                    Rs. {c.totalSpent.toLocaleString()}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <a
                        href={getWaLink(c)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp-square"
                        style={{ height: '32px', width: '32px' }}
                        title="Chat with customer on WhatsApp"
                      >
                        <WhatsAppIcon size={16} />
                      </a>
                      <button
                        type="button"
                        onClick={() => setEditingCustomer({ ...c })}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#fff',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                        title="Edit Customer"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ADD NEW CUSTOMER MODAL ── */}
      {showAddModal && (
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
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div
            style={{
              background: 'var(--night-surface, #1C120C)',
              border: '1px solid var(--marigold, #C47820)',
              borderRadius: '8px',
              maxWidth: '560px',
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
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--marigold)' }}>Add New Customer</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Customer will be saved with their mobile number as the primary key.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--marigold-light, #fbbf24)', fontWeight: 600, marginBottom: '4px' }}>
                  Mobile Phone Number * (Primary Key)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9841234567"
                  value={newCustForm.phone}
                  onChange={e => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', background: '#261811', border: '1px solid var(--marigold)', borderRadius: '4px', color: '#fff', fontSize: '0.92rem', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sita Sharma"
                    value={newCustForm.name}
                    onChange={e => setNewCustForm({ ...newCustForm, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. sita@example.com"
                    value={newCustForm.email}
                    onChange={e => setNewCustForm({ ...newCustForm, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  disabled={newCustForm.sameAsPhone}
                  placeholder="98XXXXXXXX"
                  value={newCustForm.sameAsPhone ? newCustForm.phone : newCustForm.whatsapp}
                  onChange={e => setNewCustForm({ ...newCustForm, whatsapp: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem', opacity: newCustForm.sameAsPhone ? 0.6 : 1 }}
                />
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newCustForm.sameAsPhone}
                    onChange={e => setNewCustForm({ ...newCustForm, sameAsPhone: e.target.checked })}
                  />
                  Same as mobile number
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    District (77 Districts) *
                  </label>
                  <select
                    value={newCustForm.district}
                    onChange={e => setNewCustForm({ ...newCustForm, district: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                  >
                    {nepalDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    City / Area *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kathmandu, Pokhara"
                    value={newCustForm.city}
                    onChange={e => setNewCustForm({ ...newCustForm, city: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. New Road, Ward 22"
                  value={newCustForm.address}
                  onChange={e => setNewCustForm({ ...newCustForm, address: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Internal Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Regular festive kurtha client"
                  value={newCustForm.note}
                  onChange={e => setNewCustForm({ ...newCustForm, note: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '9px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '9px 22px',
                    background: 'var(--marigold)',
                    color: '#1a0d08',
                    border: 'none',
                    fontWeight: 700,
                    borderRadius: '4px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VIEW CUSTOMER & ORDER HISTORY MODAL ── */}
      {selectedCustomer && (
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
            if (e.target === e.currentTarget) setSelectedCustomer(null);
          }}
        >
          <div
            style={{
              background: 'var(--night-surface, #1C120C)',
              border: '1px solid var(--marigold, #C47820)',
              borderRadius: '8px',
              maxWidth: '650px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              color: '#fff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '14px', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>{selectedCustomer.fullName}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                  <span style={{ fontFamily: 'monospace', color: 'var(--marigold-light, #fbbf24)', fontWeight: 600 }}>
                    {selectedCustomer.phone}
                  </span>
                  {selectedCustomer.email && (
                    <span style={{ fontSize: '0.82rem', color: '#93c5fd' }}>
                      • {selectedCustomer.email}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Quick Stat Tiles */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#261811', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Orders</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--marigold)', marginTop: '2px' }}>
                  {selectedCustomer.ordersCount}
                </div>
              </div>

              <div style={{ background: '#261811', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Spent</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                  Rs. {selectedCustomer.totalSpent.toLocaleString()}
                </div>
              </div>

              <div style={{ background: '#261811', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Location</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                  {selectedCustomer.city || selectedCustomer.district}
                </div>
              </div>
            </div>

            {/* Delivery address */}
            <div style={{ background: '#261811', padding: '14px', borderRadius: '6px', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Delivery Address &amp; District
              </div>
              <div style={{ color: '#fff', fontSize: '0.9rem' }}>
                {selectedCustomer.address ? `${selectedCustomer.address}, ` : ''}{selectedCustomer.city}, {selectedCustomer.district}
              </div>
              {selectedCustomer.note && (
                <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--marigold-light)', fontStyle: 'italic' }}>
                  Note: "{selectedCustomer.note}"
                </div>
              )}
            </div>

            {/* Orders Placed by this customer */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--marigold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Order History ({selectedCustomer.orders.length})
              </h4>
              {selectedCustomer.orders.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', background: '#261811', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No orders linked yet for this customer phone.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedCustomer.orders.map((ord, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#261811',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--marigold)' }}>
                            {ord.id}
                          </span>
                          <span style={{
                            padding: '1px 6px',
                            borderRadius: '3px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            background: ord.channel === 'WhatsApp' ? 'rgba(37, 211, 102, 0.15)' : ord.channel === 'Instagram' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                            color: ord.channel === 'WhatsApp' ? '#25D366' : ord.channel === 'Instagram' ? '#f472b6' : '#60a5fa',
                          }}>
                            {ord.channel || 'Website'}
                          </span>
                          <span className={`status-badge ${ord.status?.toLowerCase()}`}>
                            {ord.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'}
                        </div>
                      </div>

                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                        Rs. {(ord.total || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
              <a
                href={getWaLink(selectedCustomer)}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn"
                style={{ background: '#25D366', color: '#fff', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
              >
                <WhatsAppIcon size={16} />
                <span>Chat on WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  setEditingCustomer({ ...selectedCustomer });
                  setSelectedCustomer(null);
                }}
                className="admin-btn"
                style={{ background: 'var(--night-surface)', color: '#fff', border: '1px solid var(--night-border)' }}
              >
                Edit Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT CUSTOMER MODAL ── */}
      {editingCustomer && (
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
            if (e.target === e.currentTarget) setEditingCustomer(null);
          }}
        >
          <div
            style={{
              background: 'var(--night-surface, #1C120C)',
              border: '1px solid var(--marigold, #C47820)',
              borderRadius: '8px',
              maxWidth: '560px',
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
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--marigold)' }}>Edit Customer Profile</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Primary key: <strong style={{ color: '#fff' }}>{editingCustomer.phone}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.fullName}
                    onChange={e => setEditingCustomer({ ...editingCustomer, fullName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingCustomer.email || ''}
                    onChange={e => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  value={editingCustomer.whatsapp || ''}
                  onChange={e => setEditingCustomer({ ...editingCustomer, whatsapp: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    District *
                  </label>
                  <select
                    value={editingCustomer.district}
                    onChange={e => setEditingCustomer({ ...editingCustomer, district: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                  >
                    {nepalDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    City / Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.city}
                    onChange={e => setEditingCustomer({ ...editingCustomer, city: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Street Address
                </label>
                <input
                  type="text"
                  value={editingCustomer.address}
                  onChange={e => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Notes
                </label>
                <input
                  type="text"
                  value={editingCustomer.note}
                  onChange={e => setEditingCustomer({ ...editingCustomer, note: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: '#261811', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#fff', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={async () => {
                    if (confirm(`Are you sure you want to move customer ${editingCustomer.fullName} to trash?`)) {
                      await deleteCustomer(editingCustomer.phone);
                      setEditingCustomer(null);
                    }
                  }}
                  style={{ background: 'transparent', border: 'none', color: '#f87171', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Move to Trash
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingCustomer(null)}
                    style={{ padding: '8px 14px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: '8px 20px',
                      background: 'var(--marigold)',
                      color: '#1a0d08',
                      border: 'none',
                      fontWeight: 700,
                      borderRadius: '4px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isSubmitting ? 'Updating...' : 'Save Changes'}
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
