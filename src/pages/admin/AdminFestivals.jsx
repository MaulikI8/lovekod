import { useState } from 'react';
import { useStore } from '../../context/StoreContext';

export default function AdminFestivals() {
  const { festivalMoments, addFestivalMoment, updateFestivalMoment, deleteFestivalMoment } = useStore();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);

  const [newMoment, setNewMoment] = useState({
    nepaliTitle: '',
    englishSub: '',
    tag: '',
    iconKey: 'kukur',
    order: (festivalMoments?.length || 0) + 1,
  });

  const iconOptions = [
    { value: 'kukur', label: 'Kukur Tihar (Dog / Loyalty)' },
    { value: 'gai', label: 'Gai Tihar (Cow / Sacred)' },
    { value: 'laxmi', label: 'Laxmi Puja (Diya / Wealth)' },
    { value: 'mha', label: 'Mha Puja (Soul Reverence)' },
    { value: 'bhaitika', label: 'Bhai Tika (Seven Colors)' },
  ];

  const handleStartEdit = (m) => {
    setEditingId(m.id);
    setEditForm({ ...m });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm.nepaliTitle && !editForm.englishSub) return;
    updateFestivalMoment(editingId, {
      ...editForm,
      englishSub: editForm.englishSub || editForm.nepaliTitle,
    });
    setEditingId(null);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newMoment.nepaliTitle) return;
    addFestivalMoment({
      ...newMoment,
      englishSub: newMoment.englishSub || newMoment.nepaliTitle,
    });
    setNewMoment({
      nepaliTitle: '',
      englishSub: '',
      tag: '',
      iconKey: 'kukur',
      order: (festivalMoments?.length || 0) + 2,
    });
    setShowAddModal(false);
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2>Tihar Festival Ticker Moments</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Customize the animated marquee ticker celebrating the 5 days of Tihar
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-primary-marigold"
          style={{ fontSize: '0.85rem', padding: '10px 20px' }}
        >
          + Add Festival Moment
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Festival Name</th>
              <th>Theme / Tagline</th>
              <th>Icon Key</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {festivalMoments.map(m => {
              const isEditing = editingId === m.id;

              if (isEditing) {
                return (
                  <tr key={m.id}>
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
                        value={editForm.nepaliTitle}
                        onChange={e => setEditForm({ ...editForm, nepaliTitle: e.target.value, englishSub: e.target.value })}
                        style={{ width: '100%', padding: '4px', background: 'var(--night-surface)', color: '#fff', border: '1px solid var(--marigold)' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={editForm.tag}
                        onChange={e => setEditForm({ ...editForm, tag: e.target.value })}
                        style={{ width: '100%', padding: '4px', background: 'var(--night-surface)', color: '#fff', border: '1px solid var(--marigold)' }}
                      />
                    </td>
                    <td>
                      <select
                        value={editForm.iconKey}
                        onChange={e => setEditForm({ ...editForm, iconKey: e.target.value })}
                        style={{ padding: '4px', background: 'var(--night-surface)', color: '#fff', border: '1px solid var(--marigold)' }}
                      >
                        {iconOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
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

              const displayTitle = m.nepaliTitle && !/[\u0900-\u097f]/.test(m.nepaliTitle)
                ? m.nepaliTitle
                : (m.englishSub || 'Festival Day');

              return (
                <tr key={m.id}>
                  <td style={{ fontWeight: 700, color: 'var(--marigold)' }}>{m.order}</td>
                  <td style={{ color: '#fff', fontWeight: 600 }}>
                    {displayTitle}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{m.tag}</td>
                  <td>
                    <span className="stock-pill green">{m.iconKey}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="admin-btn" onClick={() => handleStartEdit(m)}>Edit</button>
                      <button
                        className="admin-btn"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => {
                          if (confirm(`Remove festival item "${displayTitle}"?`)) {
                            deleteFestivalMoment(m.id);
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
              Add Festival Moment
            </h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Festival Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kukur Tihar"
                  value={newMoment.nepaliTitle}
                  onChange={e => setNewMoment({ ...newMoment, nepaliTitle: e.target.value, englishSub: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Theme / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Guardians of Loyalty"
                  value={newMoment.tag}
                  onChange={e => setNewMoment({ ...newMoment, tag: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Icon Symbol</label>
                  <select
                    value={newMoment.iconKey}
                    onChange={e => setNewMoment({ ...newMoment, iconKey: e.target.value })}
                  >
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={newMoment.order}
                    onChange={e => setNewMoment({ ...newMoment, order: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="submit" className="btn-primary-marigold" style={{ flexGrow: 1, justifyContent: 'center' }}>
                  Create Item
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
