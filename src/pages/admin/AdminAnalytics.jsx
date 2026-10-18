import { useStore } from '../../context/StoreContext';

export default function AdminAnalytics() {
  const { orders, products } = useStore();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Status breakdown
  const statusCounts = { Pending: 0, Confirmed: 0, Shipped: 0, Delivered: 0 };
  orders.forEach(o => {
    if (statusCounts[o.status] !== undefined) statusCounts[o.status]++;
  });

  // Payment breakdown
  const paymentCounts = { COD: 0, DynamicQR: 0 };
  orders.forEach(o => {
    const pm = o.customer?.paymentMethod || 'COD';
    paymentCounts[pm] = (paymentCounts[pm] || 0) + 1;
  });

  // District breakdown
  const districtMap = {};
  orders.forEach(o => {
    const dist = o.customer?.district || 'Unknown';
    if (!districtMap[dist]) districtMap[dist] = { count: 0, total: 0 };
    districtMap[dist].count += 1;
    districtMap[dist].total += (o.total || 0);
  });
  const topDistricts = Object.entries(districtMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  // Size distribution
  const sizeCounts = { M: 0, L: 0, XL: 0, XXL: 0 };
  let totalItemsOrdered = 0;
  orders.forEach(o => {
    (o.items || []).forEach(it => {
      const sz = it.size || 'M';
      sizeCounts[sz] = (sizeCounts[sz] || 0) + (it.quantity || 1);
      totalItemsOrdered += (it.quantity || 1);
    });
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h2>Store Analytics &amp; Sales Insights</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Live performance analytics, customer geographic distribution, and sizing metrics.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stat-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="num tabular-num">Rs. {totalRevenue.toLocaleString()}</div>
          <div className="label">Total Boutique Revenue</div>
        </div>
        <div className="stat-card">
          <div className="num tabular-num">{totalOrders}</div>
          <div className="label">Total Orders Placed</div>
        </div>
        <div className="stat-card">
          <div className="num tabular-num">Rs. {avgOrderValue.toLocaleString()}</div>
          <div className="label">Average Order Value (AOV)</div>
        </div>
        <div className="stat-card">
          <div className="num tabular-num">{totalItemsOrdered}</div>
          <div className="label">Garments Ordered</div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        {/* District Distribution */}
        <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.15rem', marginBottom: '16px' }}>
            Top Delivery Districts in Nepal
          </h3>
          {topDistricts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No orders recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {topDistricts.map(d => {
                const pct = totalRevenue > 0 ? Math.round((d.total / totalRevenue) * 100) : 0;
                return (
                  <div key={d.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ color: '#fff', fontWeight: 600 }}>{d.name} ({d.count} {d.count === 1 ? 'order' : 'orders'})</span>
                      <span style={{ color: 'var(--marigold)', fontWeight: 700 }}>Rs. {d.total.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(5, pct)}%`, height: '100%', background: 'linear-gradient(90deg, var(--marigold), #ffb84d)', borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Size Distribution */}
        <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.15rem', marginBottom: '16px' }}>
            Demand by Size (Units Sold)
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['M', 'L', 'XL', 'XXL'].map(sz => {
              const count = sizeCounts[sz] || 0;
              const pct = totalItemsOrdered > 0 ? Math.round((count / totalItemsOrdered) * 100) : 0;
              return (
                <div key={sz}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ color: '#fff', fontWeight: 600 }}>Size {sz}</span>
                    <span style={{ color: 'var(--marigold)', fontWeight: 700 }}>{count} units ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(count > 0 ? 5 : 0, pct)}%`, height: '100%', background: 'var(--marigold)', borderRadius: '3px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.15rem', marginBottom: '16px' }}>
            Payment Method Split
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>Cash on Delivery (COD)</span>
                <span style={{ color: 'var(--marigold)', fontWeight: 700 }}>{paymentCounts.COD || 0} orders</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${totalOrders > 0 ? Math.round(((paymentCounts.COD || 0) / totalOrders) * 100) : 0}%`, height: '100%', background: '#38a169', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>Dynamic QR Pay (Fonepay/eSewa)</span>
                <span style={{ color: 'var(--marigold)', fontWeight: 700 }}>{paymentCounts.DynamicQR || 0} orders</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${totalOrders > 0 ? Math.round(((paymentCounts.DynamicQR || 0) / totalOrders) * 100) : 0}%`, height: '100%', background: 'var(--marigold)', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Fulfillment Pipeline */}
        <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontSize: '1.15rem', marginBottom: '16px' }}>
            Order Fulfillment Pipeline
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[
              { label: 'Pending', count: statusCounts.Pending, color: '#ca8a04' },
              { label: 'Confirmed', count: statusCounts.Confirmed, color: '#2563eb' },
              { label: 'Shipped', count: statusCounts.Shipped, color: '#7c3aed' },
              { label: 'Delivered', count: statusCounts.Delivered, color: '#059669' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--night-surface)', padding: '14px', borderRadius: '6px', border: '1px solid var(--night-border)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.label}</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: s.color, marginTop: '4px' }}>
                  {s.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
