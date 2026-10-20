import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router-dom';
import { WhatsAppIcon } from '../../components/Icons';

export default function AdminDashboard() {
  const { products, orders, updateOrderStatus, siteSettings } = useStore();

  // Compute greeting based on local time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : (hour < 17 ? 'Good Afternoon' : 'Good Evening');
  const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Today's orders & revenue calculation
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(o => o.createdAt && new Date(o.createdAt) >= todayStart);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + i.quantity, 0) || 0), 0);

  // Total stock across all products and sizes
  let totalStock = 0;
  let lowStockCount = 0;

  products.forEach(p => {
    Object.values(p.sizes || {}).forEach(qty => {
      totalStock += qty;
      if (qty > 0 && qty <= 2) lowStockCount++;
    });
  });

  // Milestone target (100 confirmed orders)
  const confirmedCount = orders.filter(o => o.status === 'Confirmed' || o.status === 'Delivered' || o.status === 'Shipped').length;
  const milestoneTarget = 100;
  const milestonePct = Math.min(100, Math.round((confirmedCount / milestoneTarget) * 100));

  const getWaLink = (order) => {
    const raw = order.customer?.whatsapp || order.customer?.phone || '';
    const clean = raw.replace(/[^\d]/g, '').replace(/^0+/, '').replace(/^977/, '');
    const text = encodeURIComponent(
      `Namaste ${order.customer?.fullName}! This is LoveKod regarding your festive order (${order.id}).`
    );
    return `https://wa.me/977${clean}?text=${text}`;
  };

  return (
    <div>
      {/* ── TOP GREETING & DATE HEADER (Styled like modern dashboard) ── */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.85rem', margin: 0, fontWeight: 700 }}>
          {greeting}, {siteSettings?.contactPhone ? 'LoveKod Store' : 'Store Concierge'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>
          Here are your boutique stats for today <strong style={{ color: 'var(--marigold)', fontWeight: 600 }}>{todayDateStr}</strong>
        </p>
      </div>

      {/* ── TOP METRIC CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Sales Today Card (inspired by Blanxer Revenue card) */}
        <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>Revenue</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Sales so far today</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', marginTop: '12px' }} className="tabular-num">
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginRight: '4px' }}>Rs</span>
              {todayRevenue.toLocaleString()}
            </div>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', marginTop: '20px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(5, (todayRevenue > 0 ? 100 : 0))}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, var(--marigold))' }} />
          </div>
        </div>

        {/* All-time Revenue */}
        <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>Total Sales</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>All-time festival revenue</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--marigold)', marginTop: '12px' }} className="tabular-num">
            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginRight: '4px' }}>Rs</span>
            {totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '16px' }}>
            Across {orders.length} total orders ({totalItemsSold} kurtha sets)
          </div>
        </div>

        {/* Orders In Pipeline */}
        <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>Orders Pipeline</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Awaiting dispatch &amp; delivery</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', marginTop: '12px' }}>
            {orders.filter(o => o.status === 'Pending').length}
            <span style={{ fontSize: '0.88rem', color: '#eab308', marginLeft: '8px', fontWeight: 600 }}>pending</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '16px' }}>
            <Link to="/admin/orders" style={{ color: 'var(--marigold)' }}>Manage Dispatch →</Link>
          </div>
        </div>

        {/* Inventory Stock Count */}
        <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>Stock Health</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Total garments in boutique</div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', marginTop: '12px' }}>
            {totalStock} <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>units</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: lowStockCount > 0 ? '#ff7979' : '#38a169', marginTop: '16px', fontWeight: 600 }}>
            {lowStockCount > 0 ? `${lowStockCount} sizes running low (≤ 2 left)` : 'All sizes well stocked'}
          </div>
        </div>
      </div>

      {/* ── MILESTONE / LEADERBOARD & ORDER STATS ROW (inspired by screenshot) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Milestone Goal Widget */}
        <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Festive Order Target</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
                Where your store stands toward 100 confirmed orders
              </div>
            </div>
            <span style={{ background: 'rgba(230,138,0,0.15)', color: 'var(--marigold)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
              TIHAR 2083
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 8px 20px rgba(124,58,237,0.3)' }}>
              🏆
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <strong style={{ color: '#fff', fontSize: '0.92rem' }}>
                  {confirmedCount} / {milestoneTarget} confirmed orders
                </strong>
                <span style={{ color: 'var(--marigold)', fontWeight: 700 }}>{milestonePct}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(4, milestonePct)}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, var(--marigold))', borderRadius: '4px' }} />
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                {Math.max(0, milestoneTarget - confirmedCount)} more orders needed to achieve milestone!
              </div>
            </div>
          </div>
        </div>

        {/* Hourly / Recent Order Activity Visual */}
        <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem' }}>Order Activity Trends</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
                Distribution of recent customer bookings
              </div>
            </div>
            <Link to="/admin/analytics" style={{ color: 'var(--marigold)', fontSize: '0.82rem', fontWeight: 600 }}>
              Deep Analytics →
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '90px', paddingBottom: '6px' }}>
            {['COD Orders', 'Dynamic QR', 'Express Dispatch', 'Delivered'].map((label, idx) => {
              const heights = [
                orders.filter(o => o.customer?.paymentMethod === 'COD').length * 25 + 20,
                orders.filter(o => o.customer?.paymentMethod === 'DynamicQR').length * 25 + 15,
                orders.filter(o => o.status === 'Shipped').length * 25 + 10,
                orders.filter(o => o.status === 'Delivered').length * 25 + 30,
              ];
              const h = Math.min(80, Math.max(15, heights[idx]));
              return (
                <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '100%', height: `${h}px`, background: idx === 0 ? 'var(--marigold)' : (idx === 1 ? '#7c3aed' : '#38a169'), borderRadius: '4px 4px 0 0', opacity: 0.9 }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap' }}>{label.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS BAR ── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
        <Link to="/admin/orders" className="admin-btn" style={{ background: 'var(--marigold)', color: '#1a0d08', fontWeight: 700 }}>
          + Manage Orders ({orders.length})
        </Link>
        <Link to="/admin/products" className="admin-btn" style={{ background: 'var(--night-card)', borderColor: 'var(--night-border)', color: '#fff' }}>
          Catalog &amp; Pricing
        </Link>
        <Link to="/admin/inventory" className="admin-btn" style={{ background: 'var(--night-card)', borderColor: 'var(--night-border)', color: '#fff' }}>
          Size Stock Matrix
        </Link>
        <Link to="/admin/customers" className="admin-btn" style={{ background: 'var(--night-card)', borderColor: 'var(--night-border)', color: '#fff' }}>
          Customer Contacts
        </Link>
      </div>

      {/* ── RECENT ORDERS OVERVIEW TABLE ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.25rem', margin: 0 }}>
            Recent Orders
          </h3>
          <Link to="/admin/orders" style={{ color: 'var(--marigold)', fontSize: '0.82rem', fontWeight: 600 }}>
            View All ({orders.length}) →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: 'var(--night-card)', padding: '36px', textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', border: '1px solid var(--night-border)' }}>
            No orders placed yet. Place a test order from the storefront!
          </div>
        ) : (
          <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Phone / District</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update</th>
                  <th>WhatsApp</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map(order => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--marigold)', fontWeight: 700 }}>{order.id}</td>
                    <td style={{ fontWeight: 600, color: '#fff' }}>{order.customer?.fullName}</td>
                    <td>
                      <div>{order.customer?.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customer?.district}</div>
                    </td>
                    <td>
                      {order.items?.map((it, idx) => (
                        <div key={idx} style={{ fontSize: '0.78rem' }}>
                          {it.name} ({it.size}) × {it.quantity}
                        </div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 700, color: '#fff' }} className="tabular-num">Rs. {order.total?.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${order.status?.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value)}
                        style={{
                          background: 'var(--night-surface)', border: '1px solid var(--night-border)',
                          color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td>
                      <a
                        href={getWaLink(order)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp-square"
                        style={{ height: '32px', width: '32px' }}
                        title="Chat with customer on WhatsApp"
                      >
                        <WhatsAppIcon size={16} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
