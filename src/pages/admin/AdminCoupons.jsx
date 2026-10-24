import { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';

export default function AdminCoupons() {
  const {
    coupons = [],
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    showToast,
  } = useStore();

  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('All'); // 'All' | 'Active' | 'Inactive' | 'Percentage' | 'Fixed'
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Form State
  const initialForm = {
    code: '',
    discountType: 'percent', // 'percent' | 'fixed'
    discountValue: 10,
    minOrderAmount: '',
    maxDiscountAmount: '',
    description: '',
    active: true,
  };
  const [formData, setFormData] = useState(initialForm);
  const [formError, setFormError] = useState('');

  // Generate random code helper
  const handleGenerateCode = () => {
    const prefixes = ['FESTIVE', 'TIHAR', 'LOVEKOD', 'ROYAL', 'UTSAV', 'SPECIAL'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = [10, 15, 20, 25, 50, 100, 200, 500][Math.floor(Math.random() * 8)];
    setFormData(prev => ({ ...prev, code: `${p}${num}` }));
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData(initialForm);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (coup) => {
    setEditingCoupon(coup);
    setFormData({
      code: coup.code,
      discountType: coup.discountType || 'percent',
      discountValue: coup.discountValue,
      minOrderAmount: coup.minOrderAmount || '',
      maxDiscountAmount: coup.maxDiscountAmount || '',
      description: coup.description || '',
      active: coup.active !== undefined ? coup.active : true,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Code "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const code = formData.code.trim().toUpperCase();
    if (!code) {
      setFormError('Please enter a coupon code.');
      return;
    }
    const val = Number(formData.discountValue);
    if (isNaN(val) || val <= 0) {
      setFormError('Please enter a valid discount value greater than 0.');
      return;
    }
    if (formData.discountType === 'percent' && val > 100) {
      setFormError('Percentage discount cannot exceed 100%.');
      return;
    }

    try {
      if (editingCoupon) {
        updateCoupon(editingCoupon.id, {
          code,
          discountType: formData.discountType,
          discountValue: val,
          minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
          maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
          description: formData.description,
          active: formData.active,
        });
      } else {
        createCoupon({
          code,
          discountType: formData.discountType,
          discountValue: val,
          minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
          maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
          description: formData.description,
          active: formData.active,
        });
      }
      setShowModal(false);
    } catch (err) {
      setFormError(err.message || 'Error saving coupon');
    }
  };

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    const q = search.toLowerCase().trim();
    return coupons.filter(c => {
      const matchSearch =
        c.code.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q));
      if (!matchSearch) return false;

      if (filterTab === 'Active') return c.active;
      if (filterTab === 'Inactive') return !c.active;
      if (filterTab === 'Percentage') return c.discountType === 'percent';
      if (filterTab === 'Fixed') return c.discountType === 'fixed';
      return true;
    });
  }, [coupons, search, filterTab]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(c => c.active).length;
    const fixed = coupons.filter(c => c.discountType === 'fixed').length;
    const percent = coupons.filter(c => c.discountType === 'percent').length;
    const totalUses = coupons.reduce((sum, c) => sum + (c.usesCount || 0), 0);
    return { total, active, fixed, percent, totalUses };
  }, [coupons]);

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 28px', color: '#0f172a' }}>
      {/* ── 1. HEADER BAR ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '1.2rem',
              boxShadow: '0 4px 10px rgba(124, 58, 237, 0.25)'
            }}>
              🏷️
            </div>
            <div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Discount Coupons
              </h1>
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                Create promotional discount codes for your online store and manual orders
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
            transition: 'all 0.15s ease'
          }}
        >
          <span>+</span>
          <span>Create Coupon</span>
        </button>
      </div>

      {/* ── 2. METRIC STATS ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700 }}>
            Total Coupons
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            {stats.total}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
            {stats.percent} percentage • {stats.fixed} flat
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#16a34a', fontWeight: 700 }}>
            Active Coupons
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
            {stats.active}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
            Available for customer checkout
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#7c3aed', fontWeight: 700 }}>
            Total Redemptions
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
            {stats.totalUses}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
            Redeemed by shoppers
          </div>
        </div>
      </div>

      {/* ── 3. FILTER & SEARCH TOOLBAR ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '420px' }}>
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.84rem',
              background: '#f8fafc',
              outline: 'none',
              transition: 'border-color 0.15s'
            }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem' }}>
            🔍
          </span>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          {['All', 'Active', 'Inactive', 'Percentage', 'Fixed'].map(tab => {
            const isSel = filterTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                style={{
                  background: isSel ? '#ffffff' : 'transparent',
                  color: isSel ? '#7c3aed' : '#64748b',
                  fontWeight: isSel ? 700 : 500,
                  fontSize: '0.78rem',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  boxShadow: isSel ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab === 'Percentage' ? 'Percentage (%)' : tab === 'Fixed' ? 'Fixed (Rs.)' : tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 4. COUPONS TABLE ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '12px 18px', width: '220px' }}>Coupon Code</th>
                <th style={{ padding: '12px 16px' }}>Discount</th>
                <th style={{ padding: '12px 16px' }}>Min. Purchase</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Uses</th>
                <th style={{ padding: '12px 16px' }}>Created</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏷️</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#334155' }}>No coupons found</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
                      {search ? 'Try adjusting your search query or filter tab.' : 'Click "+ Create Coupon" above to add your first promotional code.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map(coup => {
                  const isPercent = coup.discountType === 'percent';
                  return (
                    <tr
                      key={coup.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s',
                        background: coup.active ? 'transparent' : '#fafafa'
                      }}
                    >
                      {/* Code */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            fontSize: '0.88rem',
                            fontWeight: 800,
                            letterSpacing: '0.06em',
                            background: '#f5f3ff',
                            color: '#7c3aed',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            border: '1px solid #ddd6fe'
                          }}>
                            {coup.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(coup.code)}
                            title="Copy code"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: copiedCode === coup.code ? '#16a34a' : '#94a3b8',
                              cursor: 'pointer',
                              padding: '2px 4px',
                              fontSize: '0.85rem'
                            }}
                          >
                            {copiedCode === coup.code ? '✓' : '📋'}
                          </button>
                        </div>
                        {coup.description && (
                          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', maxWidth: '240px', lineHeight: 1.3 }}>
                            {coup.description}
                          </div>
                        )}
                      </td>

                      {/* Discount Value */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          padding: '3px 10px',
                          borderRadius: '6px',
                          background: isPercent ? '#ede9fe' : '#dcfce7',
                          color: isPercent ? '#6d28d9' : '#15803d'
                        }}>
                          {isPercent ? `${coup.discountValue}% OFF` : `Rs. ${Number(coup.discountValue).toLocaleString()} OFF`}
                        </span>
                        {isPercent && coup.maxDiscountAmount && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                            Max: Rs. {Number(coup.maxDiscountAmount).toLocaleString()}
                          </div>
                        )}
                      </td>

                      {/* Min Purchase */}
                      <td style={{ padding: '14px 16px', color: '#334155' }}>
                        {coup.minOrderAmount > 0 ? (
                          <span style={{ fontWeight: 600 }}>
                            Rs. {Number(coup.minOrderAmount).toLocaleString()}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>None (Any amount)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          type="button"
                          onClick={() => toggleCouponStatus(coup.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: coup.active ? '#dcfce7' : '#f1f5f9',
                            color: coup.active ? '#15803d' : '#64748b',
                            border: 'none',
                            borderRadius: '14px',
                            padding: '3px 10px',
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                          title="Click to toggle status"
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: coup.active ? '#16a34a' : '#94a3b8' }} />
                          {coup.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Uses */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: '0.84rem',
                          background: '#f8fafc',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          color: '#334155'
                        }}>
                          {coup.usesCount || 0}
                        </span>
                      </td>

                      {/* Created */}
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.76rem' }}>
                        {coup.createdAt ? new Date(coup.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(coup)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              color: '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete coupon "${coup.code}"?`)) {
                                deleteCoupon(coup.id);
                              }
                            }}
                            style={{
                              background: '#fff1f2',
                              border: '1px solid #fecdd3',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              color: '#e11d48',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. CREATE / EDIT COUPON MODAL ── */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 22px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {editingCoupon ? 'Edit Discount Coupon' : 'Create Discount Coupon'}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#64748b' }}>
                  Set promo code, percentage or fixed discount, and minimum spend
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  color: '#475569'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '20px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {formError && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  color: '#e11d48',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  ⚠️ {formError}
                </div>
              )}

              {/* Coupon Code Input */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>
                    Coupon Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#7c3aed',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    🎲 Generate Code
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. TIHAR2083, FESTIVE10"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.92rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    background: '#f8fafc'
                  }}
                />
              </div>

              {/* Discount Type Toggle */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Discount Type *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, discountType: 'percent' })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: formData.discountType === 'percent' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                      background: formData.discountType === 'percent' ? '#f5f3ff' : '#ffffff',
                      color: formData.discountType === 'percent' ? '#7c3aed' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>%</span> Percentage Discount
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, discountType: 'fixed' })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: formData.discountType === 'fixed' ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                      background: formData.discountType === 'fixed' ? '#f5f3ff' : '#ffffff',
                      color: formData.discountType === 'fixed' ? '#7c3aed' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Rs.</span> Fixed Cash Discount
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  {formData.discountType === 'percent' ? 'Discount Percentage (%) *' : 'Discount Amount (Rs.) *'}
                </label>
                <input
                  type="number"
                  min="1"
                  max={formData.discountType === 'percent' ? '100' : '50000'}
                  required
                  placeholder={formData.discountType === 'percent' ? '10' : '200'}
                  value={formData.discountValue}
                  onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    fontWeight: 700
                  }}
                />
              </div>

              {/* Min Spend & Max Cap (Grid) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Min. Order Subtotal (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1500 (0 for none)"
                    value={formData.minOrderAmount}
                    onChange={e => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem'
                    }}
                  />
                </div>

                {formData.discountType === 'percent' && (
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Max Discount Cap (Rs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 1000 (Optional)"
                      value={formData.maxDiscountAmount}
                      onChange={e => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Coupon Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tihar Festive Offer - 10% OFF on all Kurthas"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem'
                  }}
                />
              </div>

              {/* Active Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <input
                  type="checkbox"
                  id="couponActiveCheck"
                  checked={formData.active}
                  onChange={e => setFormData({ ...formData, active: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: '#7c3aed', cursor: 'pointer' }}
                />
                <label htmlFor="couponActiveCheck" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                  Enable this coupon immediately on website checkout
                </label>
              </div>

              {/* Preview Banner */}
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: '#faf5ff',
                border: '1px dashed #d8b4fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#7c3aed', fontWeight: 700 }}>
                    Storefront Live Preview
                  </div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#6d28d9', fontSize: '0.92rem', marginTop: '2px' }}>
                    {formData.code || 'COUPON_CODE'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 800, color: '#7c3aed', fontSize: '0.86rem' }}>
                    {formData.discountType === 'percent' ? `${formData.discountValue || 10}% OFF` : `Rs. ${formData.discountValue || 200} OFF`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '9px 18px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#475569'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '9px 22px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
