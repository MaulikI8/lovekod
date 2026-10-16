import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

export default function AdminDashboard() {
  const { products, orders, updateOrderStatus } = useStore();

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

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2>Tihar Store Overview</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Real-time inventory and customer order tracker</p>
        </div>
        <Link to="/admin/products" className="btn-primary-marigold" style={{ fontSize: '0.85rem', padding: '10px 20px' }}>
          Manage Inventory
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="num tabular-num">Rs. {totalRevenue.toLocaleString()}</div>
          <div className="label">Total Festive Revenue</div>
        </div>
        <div className="stat-card">
          <div className="num tabular-num">{orders.length}</div>
          <div className="label">Total Orders ({totalItemsSold} Kurthas)</div>
        </div>
        <div className="stat-card">
          <div className="num tabular-num">{totalStock}</div>
          <div className="label">Kurthas in Stock</div>
        </div>
        <div className={`stat-card ${lowStockCount > 0 ? 'warn' : ''}`}>
          <div className="num tabular-num">{lowStockCount}</div>
          <div className="label">Sizes Low in Stock (≤ 2 left)</div>
        </div>
      </div>

      {/* Stock Summary Table */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.25rem' }}>
            Current Kurtha Inventory Levels
          </h3>
          <Link to="/admin/products" style={{ color: 'var(--marigold)', fontSize: '0.82rem' }}>
            Edit Stock Numbers →
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Kurtha</th>
                <th>Fabric</th>
                <th>Price</th>
                <th>Size M</th>
                <th>Size L</th>
                <th>Size XL</th>
                <th>Size XXL</th>
                <th>Total Units</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const totalUnits = Object.values(p.sizes || {}).reduce((a, b) => a + b, 0);
                const renderPill = (qty) => {
                  if (qty === 0) return <span className="stock-pill red">0 (Sold Out)</span>;
                  if (qty <= 2) return <span className="stock-pill red">{qty} left</span>;
                  if (qty <= 4) return <span className="stock-pill yellow">{qty} left</span>;
                  return <span className="stock-pill green">{qty} in stock</span>;
                };

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={p.image} alt={p.name} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.nepaliName}</div>
                        </div>
                      </div>
                    </td>
                    <td>{p.fabricType}</td>
                    <td style={{ fontWeight: 600, color: 'var(--marigold)' }} className="tabular-num">Rs. {p.price.toLocaleString()}</td>
                    <td>{renderPill(p.sizes?.M || 0)}</td>
                    <td>{renderPill(p.sizes?.L || 0)}</td>
                    <td>{renderPill(p.sizes?.XL || 0)}</td>
                    <td>{renderPill(p.sizes?.XXL || 0)}</td>
                    <td style={{ fontWeight: 700, color: totalUnits < 5 ? 'var(--danger)' : '#fff' }} className="tabular-num">
                      {totalUnits} units
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.25rem' }}>
            Recent Orders
          </h3>
          <Link to="/admin/orders" style={{ color: 'var(--marigold)', fontSize: '0.82rem' }}>
            View All Orders ({orders.length}) →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: 'var(--night-card)', padding: '36px', textAlign: 'center', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', border: '1px solid var(--night-border)' }}>
            No orders placed yet. Place a test order from the storefront!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Phone / District</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--marigold)' }}>{order.id}</td>
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
                    <td>{order.customer?.paymentMethod}</td>
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
