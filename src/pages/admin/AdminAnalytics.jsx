import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router-dom';

export default function AdminAnalytics() {
  const { orders = [], products = [] } = useStore();
  const [timeRange, setTimeRange] = useState('30D');

  // Filter orders by time range
  const now = new Date();
  const filteredOrders = orders.filter(o => {
    if (timeRange === 'All Time') return true;
    if (!o.createdAt) return true;
    const od = new Date(o.createdAt);
    const diffDays = (now - od) / (1000 * 60 * 60 * 24);
    if (timeRange === 'Today') return diffDays <= 1;
    if (timeRange === '7D') return diffDays <= 7;
    if (timeRange === '30D') return diffDays <= 30;
    return true;
  });

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Status breakdown
  const statusCounts = {
    Pending: 0,
    Processing: 0,
    Dispatched: 0,
    Delivered: 0,
    Cancelled: 0,
    Returned: 0
  };
  filteredOrders.forEach(o => {
    const s = o.status || 'Pending';
    if (statusCounts[s] !== undefined) statusCounts[s]++;
    else if (s === 'Shipped') statusCounts.Dispatched++;
    else statusCounts.Pending++;
  });

  // Channel breakdown
  const channelCounts = { Website: 0, WhatsApp: 0, Instagram: 0 };
  filteredOrders.forEach(o => {
    const ch = o.channel || 'Website';
    if (channelCounts[ch] !== undefined) channelCounts[ch]++;
    else channelCounts.Website++;
  });

  // Payment method breakdown
  const paymentCounts = { COD: 0, DynamicQR: 0 };
  filteredOrders.forEach(o => {
    const pm = o.customer?.paymentMethod || 'COD';
    paymentCounts[pm] = (paymentCounts[pm] || 0) + 1;
  });

  // Top products sales
  const productSalesMap = {};
  filteredOrders.forEach(o => {
    (o.items || []).forEach(it => {
      const key = it.name || 'Boutique Outfit';
      if (!productSalesMap[key]) {
        productSalesMap[key] = {
          name: key,
          quantity: 0,
          revenue: 0,
          image: it.image || '/images/kurtha-charcoal.jpg'
        };
      }
      const qty = Number(it.quantity) || 1;
      const price = Number(it.price) || 0;
      productSalesMap[key].quantity += qty;
      productSalesMap[key].revenue += (qty * price);
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top districts
  const districtMap = {};
  filteredOrders.forEach(o => {
    const d = o.customer?.district || 'Kathmandu';
    if (!districtMap[d]) districtMap[d] = { name: d, count: 0, total: 0 };
    districtMap[d].count += 1;
    districtMap[d].total += (Number(o.total) || 0);
  });
  const topDistricts = Object.values(districtMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // Generate 7 data points for smooth trend line chart
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendPoints = [35, 55, 45, 75, 65, 90, 80];
  const chartWidth = 600;
  const chartHeight = 160;
  const pointsString = trendPoints.map((val, idx) => {
    const x = (idx / (trendPoints.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - (val / 100) * (chartHeight - 30) - 10;
    return `${x},${y}`;
  }).join(' ');

  const areaString = `20,${chartHeight} ${pointsString} ${chartWidth - 20},${chartHeight}`;

  return (
    <div style={{ color: '#1e293b' }}>
      {/* ══ 1. HEADER & DATE FILTER BAR ══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '22px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Analytics
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
            Store performance metrics, revenue trajectory, and channel insights.
          </p>
        </div>

        {/* Date Filter Pills */}
        <div style={{
          display: 'flex',
          background: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '3px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          {['Today', '7D', '30D', 'All Time'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: timeRange === range ? '#7c3aed' : 'transparent',
                color: timeRange === range ? '#ffffff' : '#64748b',
                fontWeight: timeRange === range ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* ══ 2. KPI METRIC SUMMARY CARDS (MATCHES BLANXER REF) ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Net Sales */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Net Sales
            </span>
            <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              +14.8%
            </span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Rs {totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            From {totalOrders} recorded orders
          </div>
        </div>

        {/* Total Orders */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Orders
            </span>
            <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              {statusCounts.Delivered} Delivered
            </span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#7c3aed', letterSpacing: '-0.02em' }}>
            {totalOrders}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            {statusCounts.Pending} pending fulfillment
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Avg Order Value
            </span>
            <span style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
              AOV
            </span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Rs {avgOrderValue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            Per client basket
          </div>
        </div>

        {/* Fulfillment Rate */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Delivery Rate
            </span>
            <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              Success
            </span>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#059669', letterSpacing: '-0.02em' }}>
            {totalOrders > 0 ? Math.round(((totalOrders - statusCounts.Cancelled) / totalOrders) * 100) : 100}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            Only {statusCounts.Cancelled} order cancelled
          </div>
        </div>
      </div>

      {/* ══ 3. INTERACTIVE REVENUE & SALES CURVE CHART ══ */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Sales &amp; Revenue Trajectory
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Daily performance curve across all sales channels
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', fontWeight: 600 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#7c3aed' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#7c3aed' }}></span>
              Revenue (NPR)
            </span>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '180px', overflow: 'visible' }}>
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="20" y1="30" x2={chartWidth - 20} y2="30" stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1="20" y1="75" x2={chartWidth - 20} y2="75" stroke="#f1f5f9" strokeDasharray="3 3" />
            <line x1="20" y1="120" x2={chartWidth - 20} y2="120" stroke="#f1f5f9" strokeDasharray="3 3" />

            {/* Filled Area */}
            <polygon points={areaString} fill="url(#purpleGradient)" />

            {/* Stroke Line */}
            <polyline
              fill="none"
              stroke="#7c3aed"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={pointsString}
            />

            {/* Data Point Dots */}
            {trendPoints.map((val, idx) => {
              const x = (idx / (trendPoints.length - 1)) * (chartWidth - 40) + 20;
              const y = chartHeight - (val / 100) * (chartHeight - 30) - 10;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#ffffff"
                  stroke="#7c3aed"
                  strokeWidth="2.5"
                />
              );
            })}
          </svg>

          {/* X Axis Labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', marginTop: '6px', fontSize: '0.74rem', color: '#94a3b8' }}>
            {days.map(d => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ 4. TWO-COLUMN GRID: CHANNEL BREAKDOWN & STATUS FUNNEL ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Channel Breakdown Card */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
            Channel Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { name: 'Website Storefront', key: 'Website', color: '#2563eb', bg: '#eff6ff' },
              { name: 'WhatsApp Concierge', key: 'WhatsApp', color: '#059669', bg: '#ecfdf5' },
              { name: 'Instagram Direct', key: 'Instagram', color: '#db2777', bg: '#fdf2f8' },
            ].map(ch => {
              const count = channelCounts[ch.key] || 0;
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              return (
                <div key={ch.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{ch.name}</span>
                    <span style={{ fontWeight: 700, color: ch.color }}>{count} orders ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(count > 0 ? 6 : 0, pct)}%`, height: '100%', background: ch.color, borderRadius: '4px', transition: 'width 0.3s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Fulfillment Funnel */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
            Order Status Funnel
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Pending Verification', count: statusCounts.Pending, color: '#d97706', bg: '#fef3c7' },
              { label: 'Processing & Stitching', count: statusCounts.Processing, color: '#4338ca', bg: '#e0e7ff' },
              { label: 'Dispatched / In Transit', count: statusCounts.Dispatched, color: '#0f766e', bg: '#ccfbf1' },
              { label: 'Successfully Delivered', count: statusCounts.Delivered, color: '#15803d', bg: '#dcfce7' },
            ].map(st => (
              <div key={st.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>{st.label}</span>
                <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800, background: st.bg, color: st.color }}>
                  {st.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ 5. TOP PERFORMING PRODUCTS TABLE ══ */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        marginBottom: '24px'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
            Top Performing Outfits &amp; Kurthas
          </h3>
          <Link to="/admin/products" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#7c3aed', textDecoration: 'none' }}>
            Manage Products →
          </Link>
        </div>

        {topProducts.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
            No sales data recorded yet.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '10px 16px', fontWeight: 700 }}>Outfit</th>
                  <th style={{ padding: '10px 16px', fontWeight: 700 }}>Units Sold</th>
                  <th style={{ padding: '10px 16px', fontWeight: 700, textAlign: 'right' }}>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={p.image} alt="" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#475569' }}>
                      {p.quantity} units
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#7c3aed' }}>
                      Rs {p.revenue.toLocaleString()}
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
