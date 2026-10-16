import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { WhatsAppIcon } from '../../components/Icons';

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useStore();
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = o.id?.toLowerCase().includes(q);
      const matchName = o.customer?.fullName?.toLowerCase().includes(q);
      const matchPhone = o.customer?.phone?.includes(q);
      const matchDistrict = o.customer?.district?.toLowerCase().includes(q);
      return matchId || matchName || matchPhone || matchDistrict;
    }
    return true;
  });

  const getWaMessageLink = (order) => {
    const text = encodeURIComponent(
      `Namaste ${order.customer?.fullName}! This is LoveKod reaching out regarding your Tihar order (${order.id}). We are processing your delivery for ${order.customer?.district}!`
    );
    const phone = order.customer?.whatsapp || order.customer?.phone;
    return `https://wa.me/977${phone?.replace(/^0+/, '').replace(/^\+?977/, '')}?text=${text}`;
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2>Customer Orders ({orders.length})</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage Tihar deliveries, payment verification &amp; status updates
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by Order ID, name, phone, district..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            maxWidth: '340px', width: '100%', background: 'var(--night-surface)',
            border: '1px solid var(--night-border)', color: '#fff', padding: '10px 14px',
            borderRadius: 'var(--radius-sm)', fontSize: '0.88rem'
          }}
        />

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className="admin-btn"
              style={{
                background: statusFilter === st ? 'var(--marigold)' : 'var(--night-surface)',
                color: statusFilter === st ? '#1a0d08' : 'var(--text-body)',
                fontWeight: statusFilter === st ? 700 : 500,
                borderColor: statusFilter === st ? 'var(--marigold)' : 'var(--night-border)'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div style={{ background: 'var(--night-card)', padding: '48px', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--night-border)', color: 'var(--text-muted)' }}>
          No orders found matching your filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredOrders.map(order => (
            <div
              key={order.id}
              style={{
                background: 'var(--night-card)', border: '1px solid var(--night-border)',
                borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex',
                flexDirection: 'column', gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--night-border)', paddingBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--marigold)', fontSize: '1.05rem' }}>
                      {order.id}
                    </span>
                    <span className={`status-badge ${order.status?.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Placed on: {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
                  <select
                    value={order.status}
                    onChange={e => updateOrderStatus(order.id, e.target.value)}
                    style={{
                      background: 'var(--night-surface)', border: '1px solid var(--marigold)',
                      color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>

                  <a
                    href={getWaMessageLink(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-square"
                    style={{ height: '36px', width: '36px' }}
                    title="Send WhatsApp message to customer"
                  >
                    <WhatsAppIcon size={18} />
                  </a>
                </div>
              </div>

              {/* Order Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px', fontSize: '0.88rem' }}>
                {/* Items */}
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Items Reserved
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <img src={item.image} alt={item.name} style={{ width: '38px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Size: <strong style={{ color: 'var(--marigold)' }}>{item.size}</strong> • Qty: {item.quantity} • Rs. {(item.price * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Details */}
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Recipient &amp; Delivery Destination
                  </div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{order.customer?.fullName}</div>
                  <div style={{ color: 'var(--text-body)', marginTop: '2px' }}>Phone: {order.customer?.phone}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '6px' }}>
                    {order.customer?.address}, {order.customer?.city}, <strong>{order.customer?.district}</strong>
                  </div>
                  {order.customer?.note && (
                    <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--marigold-light)', fontStyle: 'italic' }}>
                      Note: "{order.customer?.note}"
                    </div>
                  )}
                </div>

                {/* Payment & Total */}
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Payment &amp; Total
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <strong style={{ color: '#fff' }}>{order.customer?.paymentMethod}</strong>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--marigold)' }} className="tabular-num">
                    Rs. {order.total?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {order.total >= 3000 ? 'Free Delivery Applied' : 'Standard Delivery'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
