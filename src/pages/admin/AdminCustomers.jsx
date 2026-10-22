import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { WhatsAppIcon } from '../../components/Icons';
import LocationAutocomplete from '../../components/common/LocationAutocomplete';
import { Link } from 'react-router-dom';

export default function AdminCustomers() {
  const { customers = [], orders = [], addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhones, setSelectedPhones] = useState([]);

  // Form for adding new customer
  const initialNewCustomer = {
    phone: '',
    name: '',
    email: '',
    whatsapp: '',
    sameAsPhone: true,
    district: 'Kathmandu Inside Ring Road',
    city: 'Kathmandu Inside Ring Road',
    address: '',
    landmark: '',
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
      district: c.district || 'Kathmandu Inside Ring Road',
      city: c.city || 'Kathmandu Inside Ring Road',
      address: c.address || '',
      landmark: c.landmark || '',
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
          district: cust.district || 'Kathmandu Inside Ring Road',
          city: cust.city || 'Kathmandu Inside Ring Road',
          address: cust.address || '',
          landmark: cust.landmark || '',
          note: cust.note || '',
          ordersCount: 0,
          totalSpent: 0,
          orders: [],
          createdAt: order.createdAt,
        };
      }
      unifiedMap[key].orders.push(order);
      if (unifiedMap[key].ordersCount === 0) {
        unifiedMap[key].ordersCount = unifiedMap[key].orders.length;
        unifiedMap[key].totalSpent = unifiedMap[key].orders.reduce((sum, o) => sum + (o.total || 0), 0);
      }
    }
  });

  const customerList = Object.values(unifiedMap).sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  const filtered = customerList.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert('No customer records to export.');
      return;
    }
    const headers = ['#', 'Customer Name', 'Email', 'Phone Number', 'City/District', 'Address', 'Total Orders', 'Total Spent (Rs)', 'Created'];
    const rows = filtered.map((c, i) => [
      i + 1,
      `"${c.fullName.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.district.replace(/"/g, '""')}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      c.ordersCount,
      c.totalSpent,
      `"${new Date(c.createdAt || Date.now()).toLocaleDateString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LoveKod_Customers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustForm.phone.trim() || !newCustForm.name.trim()) {
      alert('Customer Name and Phone Number are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addCustomer({
        phone: newCustForm.phone.trim(),
        name: newCustForm.name.trim(),
        email: newCustForm.email.trim(),
        whatsapp: newCustForm.sameAsPhone ? newCustForm.phone.trim() : newCustForm.whatsapp.trim(),
        district: newCustForm.district,
        city: newCustForm.district,
        address: newCustForm.address.trim(),
        landmark: newCustForm.landmark.trim(),
        note: newCustForm.note.trim(),
      });
      setIsSubmitting(false);
      setShowAddModal(false);
      setNewCustForm(initialNewCustomer);
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setIsSubmitting(true);
    try {
      await updateCustomer(editingCustomer.phone, {
        name: editingCustomer.fullName,
        email: editingCustomer.email,
        whatsapp: editingCustomer.whatsapp,
        district: editingCustomer.district,
        city: editingCustomer.district,
        address: editingCustomer.address,
        landmark: editingCustomer.landmark,
        note: editingCustomer.note,
      });
      setIsSubmitting(false);
      setEditingCustomer(null);
      if (selectedCustomer && selectedCustomer.phone === editingCustomer.phone) {
        setSelectedCustomer(prev => ({ ...prev, ...editingCustomer }));
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ color: '#1e293b' }}>
      {/* ══ 1. TOP HEADER & ACTION BAR (MATCHES BLANXER REF) ══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Customers
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
            Everyone from orders and leads, uniquely identified by phone number.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="admin-btn"
            style={{
              background: '#8b5cf6',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
            }}
          >
            <span>✨</span>
            <span>Do with AI</span>
            <span style={{ fontSize: '0.75rem' }}>▼</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <span>📥</span>
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              background: '#7c3aed',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(124,58,237,0.3)'
            }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* ══ 2. SEARCH BAR MATCHING BLANXER ══ */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ position: 'relative', maxWidth: '380px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem' }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px 8px 36px',
              fontSize: '0.86rem',
              color: '#1e293b',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* ══ 3. CUSTOMER TABLE MATCHING BLANXER REF ══ */}
      {filtered.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>👥</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>No customer records found</h3>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>Create a new customer or search using another keyword.</p>
        </div>
      ) : (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 700, width: '48px' }}>#</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Customer Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Phone Number</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Delivery record</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Total Orders</th>
                  <th style={{ padding: '12px 16px', fontWeight: 700 }}>Created</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, index) => {
                  const isNew = c.ordersCount <= 1;
                  return (
                    <tr
                      key={c.phone}
                      onClick={() => setSelectedCustomer(c)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: '#ffffff',
                        transition: 'background 0.12s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* Row Index */}
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#64748b' }}>
                        {index + 1}
                      </td>

                      {/* Customer Name + Email */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {c.fullName}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                          {c.email || `${c.phone}@client.lovekod.com`}
                        </div>
                      </td>

                      {/* Phone Number (Primary Key) */}
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#7c3aed' }}>
                        {c.phone}
                      </td>

                      {/* Delivery Record Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        {isNew ? (
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            letterSpacing: '0.04em'
                          }}>
                            NEW
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0',
                            letterSpacing: '0.04em'
                          }}>
                            LOYAL ({c.ordersCount})
                          </span>
                        )}
                      </td>

                      {/* Total Orders */}
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                        {c.ordersCount || 1}
                      </td>

                      {/* Created */}
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {new Date(c.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {new Date(c.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <a
                            href={`https://wa.me/977${c.whatsapp?.replace(/^0+/, '').replace(/^\+?977/, '')}?text=${encodeURIComponent(`Namaste ${c.fullName}! This is LoveKod boutique. How may we assist you today?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            style={{
                              padding: '5px 7px',
                              borderRadius: '6px',
                              background: '#25D366',
                              color: '#fff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none'
                            }}
                          >
                            <WhatsAppIcon size={14} />
                          </a>
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(c)}
                            title="Customer Details"
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: '#334155'
                            }}
                          >
                            •••
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ══ 4. BOTTOM PAGINATION BAR (MATCHES REF: 1 - 10 / 10 < 1 >) ══ */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#64748b' }}>
            <div>
              1 - {filtered.length} / {filtered.length}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button disabled style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'not-allowed', color: '#94a3b8' }}>
                ‹
              </button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#7c3aed', color: '#ffffff', fontWeight: 700 }}>
                1
              </button>
              <button disabled style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'not-allowed', color: '#94a3b8' }}>
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ 5. CUSTOMER DETAIL DRAWER / MODAL ══ */}
      {selectedCustomer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  {selectedCustomer.fullName}
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#7c3aed', fontWeight: 700, fontFamily: 'monospace', marginTop: '2px' }}>
                  Phone (Primary Key): {selectedCustomer.phone}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditingCustomer(selectedCustomer);
                    setSelectedCustomer(null);
                  }}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', color: '#334155' }}
                >
                  ✏️ Edit
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Profile Card */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Email:</span>
                <span style={{ color: '#0f172a' }}>{selectedCustomer.email || '-'}</span>

                <span style={{ color: '#64748b', fontWeight: 600 }}>WhatsApp:</span>
                <span style={{ color: '#0f172a', fontFamily: 'monospace' }}>{selectedCustomer.whatsapp || selectedCustomer.phone}</span>

                <span style={{ color: '#64748b', fontWeight: 600 }}>District/City:</span>
                <span style={{ color: '#0f172a', fontWeight: 600 }}>{selectedCustomer.district || 'Kathmandu'}</span>

                <span style={{ color: '#64748b', fontWeight: 600 }}>Delivery Address:</span>
                <span style={{ color: '#334155' }}>{selectedCustomer.address || '-'}</span>

                <span style={{ color: '#64748b', fontWeight: 600 }}>Landmark:</span>
                <span style={{ color: '#334155' }}>{selectedCustomer.landmark || '-'}</span>

                <span style={{ color: '#64748b', fontWeight: 600 }}>Notes:</span>
                <span style={{ color: '#334155', fontStyle: 'italic' }}>{selectedCustomer.note || 'None'}</span>
              </div>

              {/* Order History */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  Order History ({selectedCustomer.orders?.length || 0})
                </h4>
                {(selectedCustomer.orders || []).length === 0 ? (
                  <div style={{ padding: '16px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center' }}>
                    No prior orders recorded for this phone number.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedCustomer.orders.map(order => (
                      <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '0.84rem' }}>
                        <div>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#7c3aed' }}>
                            {order.id?.replace(/^ORD-/, '#')}
                          </span>
                          <span style={{ marginLeft: '10px', color: '#64748b', fontSize: '0.78rem' }}>
                            {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>
                            Rs {Number(order.total || 0).toLocaleString()}
                          </span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: '#dcfce7',
                            color: '#15803d'
                          }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <a
                  href={`https://wa.me/977${selectedCustomer.whatsapp?.replace(/^0+/, '').replace(/^\+?977/, '')}?text=${encodeURIComponent(`Namaste ${selectedCustomer.fullName}! Reaching out from LoveKod boutique.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px',
                    background: '#25D366',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.86rem',
                    borderRadius: '8px',
                    textDecoration: 'none'
                  }}
                >
                  <WhatsAppIcon size={16} />
                  <span>Message on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ 6. ADD CUSTOMER MODAL ══ */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Add New Customer</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Phone Number (Customer Primary Key) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9819377122"
                  value={newCustForm.phone}
                  onChange={e => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                  style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Customer Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pursottam Timalsena"
                    value={newCustForm.name}
                    onChange={e => setNewCustForm({ ...newCustForm, name: e.target.value })}
                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '0.86rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. customer@gmail.com"
                    value={newCustForm.email}
                    onChange={e => setNewCustForm({ ...newCustForm, email: e.target.value })}
                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div>
                <LocationAutocomplete
                  value={newCustForm.district}
                  onChange={val => setNewCustForm({ ...newCustForm, district: val, city: val })}
                  label="City / District"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Divya Marg, Ward 4"
                    value={newCustForm.address}
                    onChange={e => setNewCustForm({ ...newCustForm, address: e.target.value })}
                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dai building"
                    value={newCustForm.landmark}
                    onChange={e => setNewCustForm({ ...newCustForm, landmark: e.target.value })}
                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 16px', fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ 7. EDIT CUSTOMER MODAL ══ */}
      {editingCustomer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>Edit Customer</h3>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ padding: '18px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Phone Number (Primary Key - Unchangeable)
                </label>
                <input
                  type="tel"
                  disabled
                  value={editingCustomer.phone}
                  style={{ width: '100%', background: '#e2e8f0', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '0.86rem', color: '#64748b', cursor: 'not-allowed' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCustomer.fullName}
                    onChange={e => setEditingCustomer({ ...editingCustomer, fullName: e.target.value })}
                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '0.86rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingCustomer.email}
                    onChange={e => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '0.86rem' }}
                  />
                </div>
              </div>

              <div>
                <LocationAutocomplete
                  value={editingCustomer.district}
                  onChange={val => setEditingCustomer({ ...editingCustomer, district: val, city: val })}
                  label="City / District"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Delivery Address
                </label>
                <input
                  type="text"
                  value={editingCustomer.address}
                  onChange={e => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                  style={{ width: '100%', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', fontSize: '0.86rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 16px', fontSize: '0.84rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 20px', fontSize: '0.86rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Update Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
