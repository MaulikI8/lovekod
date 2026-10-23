import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { products, orders } = useStore();

  // Dynamic Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : (hour < 17 ? 'Good Afternoon' : 'Good Evening');
  const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Today's orders & revenue calculation
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(o => o.createdAt && new Date(o.createdAt) >= todayStart);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const todayAov = todayOrders.length > 0 ? Math.round(todayRevenue / todayOrders.length) : (orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0);

  // Low stock products (total stock <= 5 units)
  const lowStockItems = [];
  products.forEach(p => {
    let tot = 0;
    Object.values(p.sizes || {}).forEach(qty => { tot += Number(qty) || 0; });
    if (tot <= 5) {
      lowStockItems.push({
        id: p.id,
        name: p.name,
        image: p.image || '/images/kurtha-charcoal.jpg',
        price: p.price,
        stock: tot
      });
    }
  });

  const recentOrders = orders.slice(0, 8);

  return (
    <div style={{ color: '#1e293b' }}>
      {/* ══ 1. TOP GREETING & DATE HEADER (NO POS, NO Agent, NO Do With AI) ══ */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          {greeting}, LoveKod
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
          Here are your stats for today <span style={{ fontWeight: 700, color: '#7c3aed' }}>{todayDateStr}</span>
        </p>
      </div>

      {/* ══ 2. THREE TOP METRIC CARDS ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Card 1: Revenue */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>Revenue</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>
                Today ▾
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Sales so far today</div>
            <div style={{ marginTop: '12px', fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
              <span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>Rs</span>
              {todayRevenue > 0 ? todayRevenue.toLocaleString() : totalRevenue.toLocaleString()}
            </div>
          </div>
          <div style={{ marginTop: '16px', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, #c084fc, #7c3aed)', borderRadius: '2px' }}></div>
          </div>
        </div>

        {/* Card 2: Orders */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>Orders</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>
                Today ▾
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Orders placed today</div>
            <div style={{ marginTop: '12px', fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
              {todayOrders.length > 0 ? todayOrders.length : orders.length}
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', gap: '3px' }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i < (orders.length || 1) ? '#7c3aed' : '#e2e8f0' }} />
            ))}
          </div>
        </div>

        {/* Card 3: Average Order Value */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#334155' }}>Average Order Value</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '10px' }}>
                Today ▾
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Average basket today</div>
            <div style={{ marginTop: '12px', fontSize: '1.85rem', fontWeight: 800, color: '#0f172a' }}>
              <span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>Rs</span>
              {todayAov.toLocaleString()}
            </div>
          </div>
          <div style={{ marginTop: '16px', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #d97706)', borderRadius: '2px' }}></div>
          </div>
        </div>
      </div>

      {/* ══ 3. TWO CHARTS (HOURLY ORDER STATS + WEEKLY SALES) ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Chart 1: Hourly Order Statistics */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Hourly Order Statistics</h3>
          </div>

          <div style={{ width: '100%', height: '150px' }}>
            <svg viewBox="0 0 540 120" style={{ width: '100%', height: '120px', overflow: 'visible' }}>
              <line x1="25" y1="15" x2="530" y2="15" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="25" y1="45" x2="530" y2="45" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="25" y1="75" x2="530" y2="75" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="25" y1="105" x2="530" y2="105" stroke="#e2e8f0" strokeWidth="1" />

              <text x="8" y="18" fontSize="9" fill="#94a3b8">4</text>
              <text x="8" y="48" fontSize="9" fill="#94a3b8">3</text>
              <text x="8" y="78" fontSize="9" fill="#94a3b8">2</text>
              <text x="8" y="108" fontSize="9" fill="#94a3b8">0</text>

              <line x1="25" y1="105" x2="530" y2="105" stroke="#7c3aed" strokeWidth="2" />
              {[...Array(24)].map((_, i) => (
                <circle key={i} cx={25 + i * 21.5} cy={105} r="3" fill="#7c3aed" />
              ))}
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: 'monospace', color: '#94a3b8', padding: '0 10px', marginTop: '4px' }}>
              <span>00:00</span>
              <span>04:00</span>
              <span>08:00</span>
              <span>12:00</span>
              <span>16:00</span>
              <span>20:00</span>
              <span>23:00</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Weekly Sales */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Weekly Sales</h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>Sunday to today, against the same days last week</p>
              <div style={{ marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Rs</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>91,250</span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginLeft: '6px' }}>No sales in same days last week</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#7c3aed' }}></span>
                This week
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#e2e8f0' }}></span>
                Last week
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <svg viewBox="0 0 520 100" style={{ width: '100%', height: '100px', overflow: 'visible' }}>
              <line x1="20" y1="90" x2="500" y2="90" stroke="#e2e8f0" strokeWidth="1" />
              {/* Sun */}
              <rect x="50" y="25" width="14" height="65" rx="3" fill="#7c3aed" />
              {/* Mon */}
              <rect x="118" y="10" width="14" height="80" rx="3" fill="#7c3aed" />
              {/* Tue */}
              <rect x="186" y="60" width="14" height="30" rx="3" fill="#7c3aed" />
              {/* Wed */}
              <rect x="254" y="88" width="14" height="2" rx="1" fill="#e2e8f0" />
              {/* Thu */}
              <rect x="322" y="80" width="14" height="10" rx="2" fill="#7c3aed" />
              {/* Fri (Today) */}
              <rect x="390" y="88" width="14" height="2" rx="1" fill="#e2e8f0" />
              {/* Sat */}
              <rect x="458" y="88" width="14" height="2" rx="1" fill="#e2e8f0" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b', padding: '0 20px', marginTop: '4px' }}>
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span style={{ fontWeight: 800, color: '#7c3aed' }}>Today</span>
              <span>Sat</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ 4. OPERATIONS & LIVE INVENTORY PANELS (LINKED THROUGHOUT) ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Panel 1: Inventory & Low Stock Watch */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>⚠️</span>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Inventory &amp; Low Stock Watch
                </h3>
              </div>
              <Link to="/admin/products" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>
                View Inventory →
              </Link>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '0.76rem', color: '#64748b' }}>
              Outfits with low remaining units across sizes (XS through 3XL)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {lowStockItems.slice(0, 4).map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={item.image} alt="" style={{ width: '36px', height: '44px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Rs {item.price.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: item.stock === 0 ? '#fee2e2' : '#fef3c7', color: item.stock === 0 ? '#b91c1c' : '#b45309' }}>
                      {item.stock === 0 ? '0 UNITS (OUT)' : `${item.stock} left`}
                    </span>
                    <Link to="/admin/products" style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>
                      Restock
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b' }}>
            <span>{products.length} active boutique outfits</span>
            <Link to="/admin/products" style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'none' }}>
              + Add New Outfit
            </Link>
          </div>
        </div>

        {/* Panel 2: Discount Coupons & Promotions */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏷️</span>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Discount Coupons &amp; Promotions
                </h3>
              </div>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '3px 8px', borderRadius: '6px' }}>
                + New Coupon
              </span>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '0.76rem', color: '#64748b' }}>
              Active checkout promo codes and customer redemption stats
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { code: 'LADOASHUTOSH', discount: '10% OFF', note: 'Valid on all festive orders', redeemed: 0 },
                { code: 'TIHARFESTIVE', discount: '15% OFF', note: 'Exclusive festival launch code', redeemed: 2 },
              ].map(c => (
                <div key={c.code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.8rem', background: '#ede9fe', color: '#6d28d9', padding: '2px 6px', borderRadius: '4px' }}>
                        {c.code}
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569' }}>{c.discount}</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>{c.note}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{c.redeemed} redeemed</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>No min</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b' }}>
            <span>2 active promotions</span>
            <span style={{ color: '#7c3aed', fontWeight: 700, cursor: 'pointer' }}>Manage All Coupons →</span>
          </div>
        </div>
      </div>

      {/* ══ 5. STORE SHORTCUT ACTIONS (MATCHING BLANXER REF) ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <Link to="/admin/products" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', textAlign: 'center', textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>👗</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Add Outfit</div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Upload photo &amp; sizes</div>
        </Link>

        <Link to="/admin/orders" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', textAlign: 'center', textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>📦</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Shipments</div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{orders.length} customer orders</div>
        </Link>

        <Link to="/admin/content" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', textAlign: 'center', textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>🏮</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Festive Edit</div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Hero pins &amp; banners</div>
        </Link>

        <a href="/" target="_blank" rel="noopener noreferrer" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '14px', textAlign: 'center', textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>🛍️</div>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Live Store</div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>lovekod.com</div>
        </a>
      </div>

      {/* ══ 6. RECENT STORE ORDERS QUEUE (LINKED THROUGHOUT) ══ */}
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Recent Store Orders</h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>Latest customer purchases &amp; courier dispatch queue</p>
          </div>
          <Link to="/admin/orders" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>
            View All Orders →
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Order ID</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Customer</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>District / City</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Total</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Payment</th>
                <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 800, color: '#7c3aed' }}>
                    {order.id?.replace(/^ORD-/, '#')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{order.customer?.fullName}</div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'monospace' }}>{order.customer?.phone}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    {order.customer?.district || 'Kathmandu'}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                    Rs {Number(order.total || 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px' }}>
                      {order.customer?.paymentMethod || 'COD'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', padding: '2px 8px', borderRadius: '4px', background: order.status === 'Delivered' ? '#dcfce7' : '#fef3c7', color: order.status === 'Delivered' ? '#15803d' : '#b45309' }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <Link to="/admin/orders" style={{ color: '#7c3aed', fontWeight: 700, textDecoration: 'none' }}>
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
