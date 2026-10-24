import { useState } from 'react';
import { useStore } from '../../context/StoreContext';

export default function AdminProducts() {
  const { products, addProduct, deleteProduct } = useStore();
  const [activeTab, setActiveTab] = useState('Active'); // Active, Draft, Archived
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 2999,
    originalPrice: 4499,
    status: 'Active',
    rating: 5,
    inventory: 20,
    image: '/images/kurtha-charcoal.jpg',
    sizes: { M: 5, L: 5, XL: 5, XXL: 5 },
  });

  // Filter products by tab status and search query
  const filteredProducts = (products || []).filter(p => {
    const status = p.status || 'Active';
    if (activeTab === 'Active' && status !== 'Active') return false;
    if (activeTab === 'Draft' && status !== 'Draft') return false;
    if (activeTab === 'Archived' && status !== 'Archived') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = p.name?.toLowerCase().includes(q);
      const idMatch = String(p.id).toLowerCase().includes(q);
      if (!nameMatch && !idMatch) return false;
    }
    return true;
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert('Please fill in product name and price');
      return;
    }
    addProduct({
      ...newProduct,
      status: activeTab,
      createdAt: new Date().toISOString(),
    });
    setShowAddModal(false);
    setNewProduct({
      name: '',
      price: 2999,
      originalPrice: 4499,
      status: 'Active',
      rating: 5,
      inventory: 20,
      image: '/images/kurtha-charcoal.jpg',
      sizes: { M: 5, L: 5, XL: 5, XXL: 5 },
    });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#111827' }}>
      
      {/* ══ 1. TITLE (CANVA EXACT) ══ */}
      <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 16px 0', letterSpacing: '-0.01em', color: '#111827' }}>
        Products
      </h1>

      {/* ══ 2. STATUS TABS (Active, Draft, Archived) ══ */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}>
        {/* Active Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('Active')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: activeTab === 'Active' ? '1px solid #e9d5ff' : '1px solid transparent',
            fontSize: '13px',
            fontWeight: activeTab === 'Active' ? 600 : 500,
            background: activeTab === 'Active' ? '#f3effe' : 'transparent',
            color: activeTab === 'Active' ? '#7952eb' : '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="16 10 11 15 8 12" />
          </svg>
          Active
        </button>

        {/* Draft Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('Draft')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: activeTab === 'Draft' ? '1px solid #e9d5ff' : '1px solid transparent',
            fontSize: '13px',
            fontWeight: activeTab === 'Draft' ? 600 : 500,
            background: activeTab === 'Draft' ? '#f3effe' : 'transparent',
            color: activeTab === 'Draft' ? '#7952eb' : '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Draft
        </button>

        {/* Archived Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('Archived')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: activeTab === 'Archived' ? '1px solid #e9d5ff' : '1px solid transparent',
            fontSize: '13px',
            fontWeight: activeTab === 'Archived' ? 600 : 500,
            background: activeTab === 'Archived' ? '#f3effe' : 'transparent',
            color: activeTab === 'Archived' ? '#7952eb' : '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
          Archived
        </button>
      </div>

      {/* ══ 3. ACTION BAR (Search Input + Add Product + More Options) ══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        {/* Search Bar with Icon */}
        <div style={{ position: 'relative', width: '320px' }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '9px 12px 9px 36px',
              fontSize: '13px',
              color: '#111827',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#7952eb'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
          />
        </div>

        {/* Buttons on right: + Add Product and ··· */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#7952eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(121, 82, 235, 0.2)',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            <span style={{ fontSize: '15px', lineHeight: 1 }}>+</span>
            <span>Add Product</span>
          </button>

          <button
            type="button"
            style={{
              width: '38px',
              height: '38px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            ···
          </button>
        </div>
      </div>

      {/* ══ 4. PRODUCTS TABLE & EMPTY STATE (CANVA EXACT) ══ */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '11px', fontWeight: 600, letterSpacing: '0.03em' }}>
              <th style={{ padding: '12px 16px', width: '38px' }}>
                <input type="checkbox" style={{ accentColor: '#7952eb', borderRadius: '4px', cursor: 'pointer' }} />
              </th>
              <th style={{ padding: '12px 8px', width: '36px' }}>#</th>
              <th style={{ padding: '12px 16px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  NAME <span style={{ fontSize: '11px', color: '#9ca3af' }}>↕</span>
                </span>
              </th>
              <th style={{ padding: '12px 16px' }}>AVG RATING</th>
              <th style={{ padding: '12px 16px' }}>PRICE</th>
              <th style={{ padding: '12px 16px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  INVENTORY <span style={{ fontSize: '11px', color: '#9ca3af' }}>↕</span>
                </span>
              </th>
              <th style={{ padding: '12px 16px' }}>STATUS</th>
              <th style={{ padding: '12px 16px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  CREATED <span style={{ fontSize: '11px', color: '#9ca3af' }}>↕</span>
                </span>
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              /* Canva Empty State: No records */
              <tr>
                <td colSpan="9" style={{ padding: '72px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Circle icon with disabled file/image SVG */}
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', marginBottom: '10px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="2" y1="2" x2="22" y2="22" />
                        <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
                        <line x1="13.5" y1="13.5" x2="6" y2="21" />
                        <line x1="18" y1="12" x2="21" y2="15" />
                        <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.05-.22 1.41-.59" />
                        <path d="M21 15V5a2 2 0 0 0-2-2H9" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>
                      No records
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              /* Product Rows */
              filteredProducts.map((p, idx) => {
                const totalStock = Object.values(p.sizes || {}).reduce((a, b) => a + Number(b || 0), 0);
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input type="checkbox" style={{ accentColor: '#7952eb', borderRadius: '4px' }} />
                    </td>
                    <td style={{ padding: '12px 8px', color: '#9ca3af', fontFamily: 'monospace' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={p.image || '/images/kurtha-charcoal.jpg'} alt={p.name} style={{ width: '38px', height: '46px', objectFit: 'cover', borderRadius: '6px', background: '#f3f4f6' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>Code: {p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: '#f59e0b', fontSize: '13px' }}>★ ★ ★ ★ ★</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#111827' }}>
                      Rs. {Number(p.price || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: totalStock > 0 ? '#10b981' : '#ef4444' }}>
                        {totalStock} in stock
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#ecfdf5', color: '#059669' }}>
                        {p.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '12px' }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Oct 24, 2026'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => deleteProduct(p.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for adding product */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 800, color: '#111827' }}>Add New Product</h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Silk Kurtha"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>Price (NPR)</label>
                <input
                  type="number"
                  required
                  value={newProduct.price}
                  onChange={e => setNewProduct({ ...newProduct, price: parseInt(e.target.value, 10) || 0 })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13.5px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#6b7280', cursor: 'pointer', fontSize: '13px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#7952eb', color: '#ffffff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
