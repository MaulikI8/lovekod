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
    setNewCat({ name: '', slug: '', order: (categories?.length || 0) + 1 });
    setShowAddModal(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#111827' }}>
      
      {/* ══ HEADER ══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px 0', letterSpacing: '-0.01em', color: '#0f172a' }}>
            Product Categories
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            Manage storefront filter tabs and product classifications
          </p>
        </div>
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
            padding: '9px 18px',
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
          <span>Add Category</span>
        </button>
      </div>

      {/* ══ CATEGORIES TABLE ══ */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '11px', fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 16px', width: '60px' }}>Order</th>
              <th style={{ padding: '12px 16px' }}>Category Name</th>
              <th style={{ padding: '12px 16px' }}>URL Slug</th>
              <th style={{ padding: '12px 16px', width: '100px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', width: '140px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!categories || categories.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '48px 20px', textAlign: 'center', color: '#9ca3af' }}>
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map(cat => {
                const isEditing = editingId === cat.id;

                if (isEditing) {
                  return (
                    <tr key={cat.id} style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <input
                          type="number"
                          value={editForm.order}
                          onChange={e => setEditForm({ ...editForm, order: parseInt(e.target.value, 10) || 1 })}
                          style={{ width: '50px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #7952eb', fontSize: '13px', outline: 'none' }}
                        />
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          style={{ width: '100%', maxWidth: '280px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #7952eb', fontSize: '13px', outline: 'none', color: '#0f172a', fontWeight: 600 }}
                        />
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <input
                          type="text"
                          value={editForm.slug}
                          onChange={e => setEditForm({ ...editForm, slug: e.target.value })}
                          style={{ width: '100%', maxWidth: '220px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #7952eb', fontSize: '13px', outline: 'none', color: '#64748b' }}
                        />
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '12px', background: '#ecfdf5', color: '#059669' }}>
                          Active
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            style={{ background: '#7952eb', color: '#ffffff', border: 'none', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            style={{ background: '#ffffff', color: '#64748b', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={cat.id} style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                      {cat.order}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
                      {cat.name}
                    </td>
                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#64748b', fontSize: '12px' }}>
                      {cat.slug}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '3px 9px',
                        borderRadius: '12px',
                        background: cat.isActive !== false ? '#ecfdf5' : '#fef2f2',
                        color: cat.isActive !== false ? '#059669' : '#dc2626'
                      }}>
                        {cat.isActive !== false ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '10px', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          style={{ background: 'none', border: 'none', color: '#7952eb', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete category "${cat.name}"?`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
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

      {/* ══ ADD CATEGORY MODAL ══ */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '16px', padding: '24px', maxWidth: '460px', width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
              Add New Category
            </h3>
            <form onSubmit={handleCreate}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silk Blend Kurthas"
                  value={newCat.name}
                  onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13.5px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                    Slug
                  </label>
                  <input
                    type="text"
                    placeholder="silk-blend"
                    value={newCat.slug}
                    onChange={e => setNewCat({ ...newCat, slug: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13.5px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={newCat.order}
                    onChange={e => setNewCat({ ...newCat, order: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13.5px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#7952eb', color: '#ffffff', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
