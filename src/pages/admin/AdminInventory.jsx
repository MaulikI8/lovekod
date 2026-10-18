import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router-dom';

export default function AdminInventory() {
  const { products, updateProduct, showToast } = useStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, low, out
  const [savingId, setSavingId] = useState(null);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.id.toLowerCase().includes(search.toLowerCase()) ||
                        p.fabricType?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;

    const totalStock = Object.values(p.sizes || {}).reduce((a, b) => a + b, 0);
    const hasLow = Object.values(p.sizes || {}).some(q => q > 0 && q <= 2);
    const isOut = totalStock === 0;

    if (filter === 'low') return hasLow && !isOut;
    if (filter === 'out') return isOut;
    return true;
  });

  const handleStockChange = (productId, size, value) => {
    const val = Math.max(0, parseInt(value, 10) || 0);
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newSizes = { ...product.sizes, [size]: val };
    updateProduct(productId, { sizes: newSizes });
  };

  const quickSetAll = async (productId, delta) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    setSavingId(productId);

    const newSizes = {
      M: Math.max(0, (product.sizes?.M || 0) + delta),
      L: Math.max(0, (product.sizes?.L || 0) + delta),
      XL: Math.max(0, (product.sizes?.XL || 0) + delta),
      XXL: Math.max(0, (product.sizes?.XXL || 0) + delta),
    };

    await updateProduct(productId, { sizes: newSizes });
    setSavingId(null);
    showToast(`Inventory updated for ${product.name}`);
  };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Garment Inventory &amp; Size Matrix</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Live stock counts across Nepali standard sizes (M, L, XL, XXL) with instant sync to storefront.
          </p>
        </div>
        <Link to="/admin/products" className="admin-btn" style={{ background: 'var(--marigold)', color: '#1a0d08', fontWeight: 700 }}>
          Manage Full Catalog
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by outfit name, code, fabric..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            maxWidth: '340px', width: '100%', background: 'var(--night-surface)',
            border: '1px solid var(--night-border)', color: '#fff', padding: '10px 14px',
            borderRadius: 'var(--radius-sm)', fontSize: '0.88rem'
          }}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Garments' },
            { id: 'low', label: 'Low Stock (≤ 2 left)' },
            { id: 'out', label: 'Sold Out' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="admin-btn"
              style={{
                background: filter === f.id ? 'var(--marigold)' : 'var(--night-surface)',
                color: filter === f.id ? '#1a0d08' : 'var(--text-body)',
                fontWeight: filter === f.id ? 700 : 500,
                borderColor: filter === f.id ? 'var(--marigold)' : 'var(--night-border)'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Garment / Outfit</th>
              <th>Price</th>
              <th style={{ textAlign: 'center' }}>Size M</th>
              <th style={{ textAlign: 'center' }}>Size L</th>
              <th style={{ textAlign: 'center' }}>Size XL</th>
              <th style={{ textAlign: 'center' }}>Size XXL</th>
              <th style={{ textAlign: 'center' }}>Total Units</th>
              <th>Quick Adjust</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const totalUnits = Object.values(p.sizes || {}).reduce((a, b) => a + b, 0);

              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={p.image} alt={p.name} style={{ width: '44px', height: '54px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Code: {p.id} • {p.fabricType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--marigold)' }} className="tabular-num">
                    Rs. {p.price?.toLocaleString()}
                  </td>

                  {['M', 'L', 'XL', 'XXL'].map(sz => {
                    const qty = p.sizes?.[sz] || 0;
                    return (
                      <td key={sz} style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          value={qty}
                          onChange={e => handleStockChange(p.id, sz, e.target.value)}
                          style={{
                            width: '56px',
                            textAlign: 'center',
                            background: qty === 0 ? 'rgba(231,76,60,0.15)' : (qty <= 2 ? 'rgba(230,138,0,0.15)' : 'var(--night-surface)'),
                            border: `1px solid ${qty === 0 ? '#e74c3c' : (qty <= 2 ? 'var(--marigold)' : 'var(--night-border)')}`,
                            color: qty === 0 ? '#ff7979' : (qty <= 2 ? 'var(--marigold)' : '#fff'),
                            padding: '6px 4px',
                            borderRadius: '4px',
                            fontWeight: 700
                          }}
                        />
                      </td>
                    );
                  })}

                  <td style={{ textAlign: 'center', fontWeight: 700, color: totalUnits === 0 ? '#e74c3c' : (totalUnits <= 5 ? 'var(--marigold)' : '#fff') }}>
                    {totalUnits} units
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => quickSetAll(p.id, 5)}
                        disabled={savingId === p.id}
                        className="admin-btn"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)' }}
                        title="Add +5 to all sizes"
                      >
                        +5 all
                      </button>
                      <button
                        type="button"
                        onClick={() => quickSetAll(p.id, -1)}
                        disabled={savingId === p.id}
                        className="admin-btn"
                        style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.06)' }}
                        title="Deduct 1 from all sizes"
                      >
                        -1 all
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
