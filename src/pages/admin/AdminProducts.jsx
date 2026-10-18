import { useState } from 'react';
import { useStore } from '../../context/StoreContext';

export default function AdminProducts() {
  const { products, categories, updateProduct, addProduct, deleteProduct } = useStore();
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    nepaliName: '',
    categoryId: '',
    fabricType: 'Georgette',
    pieces: '3 Piece Set',
    price: 2999,
    originalPrice: 4499,
    description: '',
    image: '/images/kurtha-charcoal.jpg',
    sizes: { XS: 0, S: 0, M: 5, L: 5, XL: 5, XXL: 5, XXXL: 0 },
    badge: 'Tihar Special',
    isFeatured: true,
  });

  const handleStockChange = (product, size, delta) => {
    const currentStock = product.sizes?.[size] || 0;
    const newStock = Math.max(0, currentStock + delta);
    const updated = {
      ...product,
      sizes: {
        ...product.sizes,
        [size]: newStock,
      },
    };
    updateProduct(updated);
  };

  const handlePriceChange = (product, newPrice) => {
    const priceNum = parseInt(newPrice, 10);
    if (isNaN(priceNum) || priceNum <= 0) return;
    updateProduct({ ...product, price: priceNum });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      alert('Please provide product name and price');
      return;
    }
    addProduct(newProduct);
    setShowAddModal(false);
    setNewProduct({
      name: '',
      nepaliName: '',
      categoryId: '',
      fabricType: 'Georgette',
      pieces: '3 Piece Set',
      price: 2999,
      originalPrice: 4499,
      description: '',
      image: '/images/kurtha-charcoal.jpg',
      sizes: { XS: 0, S: 0, M: 5, L: 5, XL: 5, XXL: 5, XXXL: 0 },
      badge: 'Tihar Special',
      isFeatured: true,
    });
  };

  // Filter products by category and search
  const filteredProducts = products.filter(p => {
    if (selectedCatFilter !== 'all') {
      const catMatch = p.categoryId === parseInt(selectedCatFilter, 10) ||
                       p.categoryId === selectedCatFilter ||
                       p.categoryName?.toLowerCase() === selectedCatFilter.toLowerCase();
      if (!catMatch) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = p.name?.toLowerCase().includes(q);
      const fabricMatch = p.fabricType?.toLowerCase().includes(q);
      const nepaliMatch = p.nepaliName?.toLowerCase().includes(q);
      const idMatch = p.id?.toLowerCase().includes(q);
      if (!nameMatch && !fabricMatch && !nepaliMatch && !idMatch) return false;
    }
    return true;
  });

  const presetImages = [
    { label: 'Charcoal Kurtha', value: '/images/kurtha-charcoal.jpg' },
    { label: 'Rani Pink Silk', value: '/images/kurtha-rani-pink.png' },
    { label: 'Royal Red Brocade', value: '/images/kurtha-red-gold.png' },
    { label: 'Olive Green Georgette', value: '/images/kurtha-olive-green.png' },
    { label: 'Sage Green Co-ord', value: '/images/kurtha-sage-coord.jpg' },
  ];

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2>Kurtha Inventory &amp; Stock Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage festive kurtha catalog, categories, pricing, and live per-size stock
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-primary-marigold"
          style={{ fontSize: '0.85rem', padding: '10px 20px' }}
        >
          + Add New Kurtha
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search kurthas by name, fabric, ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            maxWidth: '300px', width: '100%', background: 'var(--night-surface)',
            border: '1px solid var(--night-border)', color: '#fff', padding: '9px 12px',
            borderRadius: 'var(--radius-sm)', fontSize: '0.88rem'
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category:</span>
          <select
            value={selectedCatFilter}
            onChange={e => setSelectedCatFilter(e.target.value)}
            style={{
              background: 'var(--night-surface)', border: '1px solid var(--night-border)',
              color: '#fff', padding: '8px 12px', borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem'
            }}
          >
            <option value="all">All Categories ({products.length})</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Details</th>
              <th>Category</th>
              <th>Price (NPR)</th>
              <th>M Stock</th>
              <th>L Stock</th>
              <th>XL Stock</th>
              <th>XXL Stock</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => {
              const total = Object.values(p.sizes || {}).reduce((a, b) => a + b, 0);
              const matchedCat = categories.find(c => c.id === p.categoryId || c.slug === p.category?.slug);

              return (
                <tr key={p.id}>
                  <td>
                    <img src={p.image} alt={p.name} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--marigold)' }}>{p.fabricType} • {p.pieces}</div>
                    
                    {p.badge && (
                      <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--wine-border)', color: 'var(--marigold-light)', borderRadius: '3px', marginTop: '4px', display: 'inline-block' }}>
                        {p.badge}
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '4px', background: 'rgba(230,138,0,0.12)', color: 'var(--marigold-light)', border: '1px solid rgba(230,138,0,0.25)' }}>
                      {matchedCat ? matchedCat.name : (p.categoryName || 'General')}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Rs.</span>
                      <input
                        type="number"
                        value={p.price}
                        onChange={e => handlePriceChange(p, e.target.value)}
                        style={{
                          width: '80px', background: 'var(--night-surface)', border: '1px solid var(--night-border)',
                          color: 'var(--marigold)', fontWeight: 700, padding: '4px 6px', borderRadius: '4px',
                          fontSize: '0.88rem'
                        }}
                      />
                    </div>
                  </td>

                  {/* Size M */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        className="admin-btn"
                        style={{ padding: '2px 6px' }}
                        onClick={() => handleStockChange(p, 'M', -1)}
                      >-</button>
                      <span style={{ width: '24px', textAlign: 'center', fontWeight: 700, color: (p.sizes?.M || 0) <= 1 ? 'var(--danger)' : '#fff' }}>
                        {p.sizes?.M || 0}
                      </span>
                      <button
                        className="admin-btn"
                        style={{ padding: '2px 6px' }}
                        onClick={() => handleStockChange(p, 'M', 1)}
                      >+</button>
                    </div>
                  </td>

                  {/* Size L */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        className="admin-btn"
                        style={{ padding: '2px 6px' }}
                        onClick={() => handleStockChange(p, 'L', -1)}
                      >-</button>
                      <span style={{ width: '24px', textAlign: 'center', fontWeight: 700, color: (p.sizes?.L || 0) <= 1 ? 'var(--danger)' : '#fff' }}>
                        {p.sizes?.L || 0}
                      </span>
                      <button
                        className="admin-btn"
                        style={{ padding: '2px 6px' }}
                        onClick={() => handleStockChange(p, 'L', 1)}
                      >+</button>
                    </div>
                  </td>

                  {/* Size XL */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        className="admin-btn"
                        style={{ padding: '2px 6px' }}
                        onClick={() => handleStockChange(p, 'XL', -1)}
                      >-</button>
                      <span style={{ width: '24px', textAlign: 'center', fontWeight: 700, color: (p.sizes?.XL || 0) <= 1 ? 'var(--danger)' : '#fff' }}>
                        {p.sizes?.XL || 0}
                      </span>
                      <button
                        className="admin-btn"
                        style={{ padding: '2px 6px' }}
                        onClick={() => handleStockChange(p, 'XL', 1)}
                      >+</button>
                    </div>
                  </td>

                  {/* Size XXL */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        className="admin-btn"
                        style={{ padding: '2px 6px' }}
                        onClick={() => handleStockChange(p, 'XXL', -1)}
                      >-</button>
                      <span style={{ width: '24px', textAlign: 'center', fontWeight: 700, color: (p.sizes?.XXL || 0) <= 1 ? 'var(--danger)' : '#fff' }}>
                        {p.sizes?.XXL || 0}
                      </span>
                      <button
                        className="admin-btn"
                        style={{ padding: '2px 6px' }}
                        onClick={() => handleStockChange(p, 'XXL', 1)}
                      >+</button>
                    </div>
                  </td>

                  <td style={{ fontWeight: 700, color: total < 4 ? 'var(--danger)' : '#fff' }}>
                    {total}
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="admin-btn"
                        onClick={() => setEditingProduct({ ...p, sizes: { ...p.sizes } })}
                        title="Edit full product details"
                      >
                        Edit
                      </button>
                      <button
                        className="admin-btn"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        style={{ color: 'var(--danger)' }}
                        title="Delete product"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Kurtha Modal */}
      {editingProduct && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--kaalo-card)', border: '1px solid var(--marigold)',
            borderRadius: 'var(--radius-md)', padding: '28px', maxWidth: '580px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.3rem' }}>
                Edit Kurtha Listing
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}
              >&times;</button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Kurtha Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                />
              </div>



              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editingProduct.categoryId || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value ? parseInt(e.target.value, 10) : '' })}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. Tihar Special, Bestseller"
                    value={editingProduct.badge || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fabric</label>
                  <input
                    type="text"
                    value={editingProduct.fabricType}
                    onChange={e => setEditingProduct({ ...editingProduct, fabricType: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Pieces / Cut</label>
                  <input
                    type="text"
                    value={editingProduct.pieces}
                    onChange={e => setEditingProduct({ ...editingProduct, pieces: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (NPR)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: parseInt(e.target.value, 10) || 0 })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Original / MRP (NPR)</label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || 0}
                    onChange={e => setEditingProduct({ ...editingProduct, originalPrice: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>

              {/* Sizes In Stock Editor */}
              <div style={{ margin: '14px 0' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--marigold-light)', marginBottom: '8px', fontWeight: 600 }}>
                  Per-Size Stock Inventory:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(75px, 1fr))', gap: '10px' }}>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(sz => (
                    <div key={sz} className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Size {sz}</label>
                      <input
                        type="number"
                        min="0"
                        value={editingProduct.sizes?.[sz] ?? 0}
                        onChange={e => setEditingProduct({
                          ...editingProduct,
                          sizes: {
                            ...editingProduct.sizes,
                            [sz]: Math.max(0, parseInt(e.target.value, 10) || 0)
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Image URL / Preset</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={editingProduct.image}
                    onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                    style={{ flexGrow: 1 }}
                  />
                  <select
                    onChange={e => { if (e.target.value) setEditingProduct({ ...editingProduct, image: e.target.value }); }}
                    style={{ background: 'var(--night-surface)', color: '#fff', border: '1px solid var(--marigold)', borderRadius: '4px', padding: '6px' }}
                  >
                    <option value="">Presets...</option>
                    {presetImages.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={editingProduct.description || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn-primary-marigold" style={{ flexGrow: 1, justifyContent: 'center' }}>
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn-secondary-outline"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Kurtha Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--kaalo-card)', border: '1px solid var(--marigold)',
            borderRadius: 'var(--radius-md)', padding: '28px', maxWidth: '580px', width: '100%',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.3rem' }}>
                Add New Festive Kurtha
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}
              >&times;</button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label>Kurtha Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maroon Silk Embroidered Kurtha Set"
                  value={newProduct.name}
                  onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>



              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newProduct.categoryId}
                    onChange={e => setNewProduct({ ...newProduct, categoryId: e.target.value ? parseInt(e.target.value, 10) : '' })}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Badge</label>
                  <input
                    type="text"
                    placeholder="e.g. Tihar Special, Limited Edition"
                    value={newProduct.badge}
                    onChange={e => setNewProduct({ ...newProduct, badge: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Fabric</label>
                  <input
                    type="text"
                    value={newProduct.fabricType}
                    onChange={e => setNewProduct({ ...newProduct, fabricType: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Pieces / Cut</label>
                  <input
                    type="text"
                    value={newProduct.pieces}
                    onChange={e => setNewProduct({ ...newProduct, pieces: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (NPR) *</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={e => setNewProduct({ ...newProduct, price: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div className="form-group">
                  <label>MRP / Strikethrough Price</label>
                  <input
                    type="number"
                    value={newProduct.originalPrice}
                    onChange={e => setNewProduct({ ...newProduct, originalPrice: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>

              {/* Sizes In Stock Editor */}
              <div style={{ margin: '14px 0' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--marigold-light)', marginBottom: '8px', fontWeight: 600 }}>
                  Initial Stock Per Size:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(75px, 1fr))', gap: '10px' }}>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(sz => (
                    <div key={sz} className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem' }}>Size {sz}</label>
                      <input
                        type="number"
                        min="0"
                        value={newProduct.sizes?.[sz] ?? 5}
                        onChange={e => setNewProduct({
                          ...newProduct,
                          sizes: {
                            ...newProduct.sizes,
                            [sz]: Math.max(0, parseInt(e.target.value, 10) || 0)
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Image URL / Preset</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={newProduct.image}
                    onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                    style={{ flexGrow: 1 }}
                  />
                  <select
                    onChange={e => { if (e.target.value) setNewProduct({ ...newProduct, image: e.target.value }); }}
                    style={{ background: 'var(--night-surface)', color: '#fff', border: '1px solid var(--marigold)', borderRadius: '4px', padding: '6px' }}
                  >
                    <option value="">Presets...</option>
                    {presetImages.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Artisanal description of embroidery, silhouette, and dupatta details..."
                  value={newProduct.description}
                  onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button type="submit" className="btn-primary-marigold" style={{ flexGrow: 1, justifyContent: 'center' }}>
                  Create Listing
                </button>
                <button
                  type="button"
                  className="btn-secondary-outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
