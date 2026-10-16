import { useState } from 'react';
import { useStore } from '../../context/StoreContext';

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '', order: 1 });

  const handleStartEdit = (cat) => {
    setEditingId(cat.id);
    setEditForm({ ...cat });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm.name) return;
    updateCategory(editingId, editForm);
    setEditingId(null);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newCat.name) return;
    addCategory({
      ...newCat,
      slug: newCat.slug || newCat.name.toLowerCase().replace(/\s+/g, '-'),
    });
    setNewCat({ name: '', slug: '', order: categories.length + 1 });
    setShowAddModal(false);
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2>Product Categories</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage storefront filter tabs and product classifications
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-primary-marigold"
          style={{ fontSize: '0.85rem', padding: '10px 20px' }}
        >
          + Add Category
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Category Name</th>
              <th>URL Slug</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => {
              const isEditing = editingId === cat.id;

              if (isEditing) {
                return (
                  <tr key={cat.id}>
                    <td>
                      <input
                        type="number"
                        value={editForm.order}
                        onChange={e => setEditForm({ ...editForm, order: parseInt(e.target.value, 10) || 1 })}
                        style={{ width: '60px', padding: '4px', background: 'var(--night-surface)', color: '#fff', border: '1px solid var(--marigold)' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        style={{ width: '100%', padding: '4px', background: 'var(--night-surface)', color: '#fff', border: '1px solid var(--marigold)' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editForm.slug}
                        onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                        style={{ width: '100%', padding: '4px', background: 'var(--night-surface)', color: '#fff', border: '1px solid var(--marigold)' }}
                      />
                    </td>
                    <td>
                      <span className="stock-pill green">Active</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="admin-btn" onClick={handleSaveEdit}>Save</button>
                        <button className="admin-btn" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={cat.id}>
                  <td style={{ fontWeight: 700, color: 'var(--marigold)' }}>{cat.order}</td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>{cat.name}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{cat.slug}</td>
                  <td>
                    <span className={`stock-pill ${cat.isActive !== false ? 'green' : 'red'}`}>
                      {cat.isActive !== false ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="admin-btn" onClick={() => handleStartEdit(cat)}>Edit</button>
                      <button
                        className="admin-btn"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => {
                          if (confirm(`Delete category "${cat.name}"?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
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

      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--kaalo-card)', border: '1px solid var(--marigold)',
            borderRadius: 'var(--radius-md)', padding: '28px', maxWidth: '480px', width: '100%'
          }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.3rem', marginBottom: '16px' }}>
              Add New Category
            </h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silk Blend Kurthas"
                  value={newCat.name}
                  onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Slug</label>
                  <input
                    type="text"
                    placeholder="silk-blend"
                    value={newCat.slug}
                    onChange={e => setNewCat({ ...newCat, slug: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={newCat.order}
                    onChange={e => setNewCat({ ...newCat, order: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="submit" className="btn-primary-marigold" style={{ flexGrow: 1, justifyContent: 'center' }}>
                  Create Category
                </button>
                <button type="button" className="btn-secondary-outline" onClick={() => setShowAddModal(false)}>
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
