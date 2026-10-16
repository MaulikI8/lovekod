import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StarIcon } from '../../components/Icons';

export default function AdminTestimonials() {
  const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useStore();
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', location: '', quote: '', rating: 5, order: 1 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newT, setNewT] = useState({ name: '', location: '', quote: '', rating: 5, order: 1 });

  const handleStartEdit = (t) => {
    setEditingId(t.id);
    setEditForm({
      name: t.name,
      location: t.location,
      quote: t.quote,
      rating: t.rating || 5,
      order: t.order || 1,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingId) return;
    updateTestimonial(editingId, editForm);
    setEditingId(null);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newT.name || !newT.quote) return;
    addTestimonial(newT);
    setNewT({ name: '', location: '', quote: '', rating: 5, order: testimonials.length + 1 });
    setShowAddModal(false);
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2>Customer Testimonials &amp; Reviews</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage authentic customer feedback displayed in the staggered reviews section
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-primary-marigold"
          style={{ fontSize: '0.85rem', padding: '10px 20px' }}
        >
          + Add Review
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {testimonials.map(t => {
          const isEditing = editingId === t.id;

          if (isEditing) {
            return (
              <div key={t.id} style={{ background: 'var(--kaalo-card)', border: '1px solid var(--marigold)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
                <form onSubmit={handleSaveEdit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Customer Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Location (City, Nepal)</label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Review Quote</label>
                    <textarea
                      rows="3"
                      value={editForm.quote}
                      onChange={e => setEditForm({ ...editForm, quote: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Star Rating (1 - 5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={editForm.rating}
                        onChange={e => setEditForm({ ...editForm, rating: parseInt(e.target.value, 10) || 5 })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Display Order</label>
                      <input
                        type="number"
                        value={editForm.order}
                        onChange={e => setEditForm({ ...editForm, order: parseInt(e.target.value, 10) || 1 })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button type="submit" className="btn-primary-marigold">Save</button>
                    <button type="button" className="btn-secondary-outline" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            );
          }

          return (
            <div
              key={t.id}
              style={{
                background: 'var(--kaalo-card)', border: '1px solid var(--kaalo-border)',
                borderRadius: 'var(--radius-md)', padding: '20px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px'
              }}
            >
              <div style={{ flexGrow: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div className="person-initials">{t.initials || 'LK'}</div>
                  <div>
                    <strong style={{ color: '#fff' }}>{t.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.location}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '2px', marginLeft: 'auto' }}>
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <StarIcon key={i} size={14} filled={true} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{t.quote}"
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button className="admin-btn" onClick={() => handleStartEdit(t)}>Edit</button>
                <button
                  className="admin-btn"
                  style={{ color: 'var(--danger)' }}
                  onClick={() => {
                    if (confirm(`Delete review from ${t.name}?`)) {
                      deleteTestimonial(t.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--kaalo-card)', border: '1px solid var(--marigold)',
            borderRadius: 'var(--radius-md)', padding: '28px', maxWidth: '520px', width: '100%'
          }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.3rem', marginBottom: '16px' }}>
              Add Customer Testimonial
            </h3>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Binita Thapa"
                    value={newT.name}
                    onChange={e => setNewT({ ...newT, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Location (City, Nepal) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dharan, Sunsari"
                    value={newT.location}
                    onChange={e => setNewT({ ...newT, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Review Quote *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="What did the customer say about the kurtha fabric and delivery?"
                  value={newT.quote}
                  onChange={e => setNewT({ ...newT, quote: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Star Rating (1 - 5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={newT.rating}
                    onChange={e => setNewT({ ...newT, rating: parseInt(e.target.value, 10) || 5 })}
                  />
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input
                    type="number"
                    value={newT.order}
                    onChange={e => setNewT({ ...newT, order: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="submit" className="btn-primary-marigold" style={{ flexGrow: 1, justifyContent: 'center' }}>
                  Create Review
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
