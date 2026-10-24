import { useStore } from '../../context/StoreContext';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { orders } = useStore();

  // Dynamic Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : (hour < 17 ? 'Good Afternoon' : 'Good Evening');
  const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Today's calculations
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter(o => o.createdAt && new Date(o.createdAt) >= todayStart);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const todayAov = todayOrders.length > 0 ? Math.round(todayRevenue / todayOrders.length) : (orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0);

  // Hourly Order Statistics (00:00 through 22:00)
  const hourlyHours = Array.from({ length: 23 }, (_, i) => i);
  const hourlyCounts = Array(23).fill(0);
  todayOrders.forEach(o => {
    if (o.createdAt) {
      const h = new Date(o.createdAt).getHours();
      if (h >= 0 && h < 23) hourlyCounts[h]++;
    }
  });

  const maxHourly = Math.max(4, ...hourlyCounts);
  const hourlyPoints = hourlyCounts.map((count, h) => {
    const cx = 30 + h * 24.5;
    const cy = 110 - (count / maxHourly) * 90;
    return `${cx},${cy}`;
  }).join(' ');

  // Weekly Sales (Sunday to Today)
  const now = new Date();
  const daysSinceSunday = (now.getDay()) % 7;
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysSinceSunday);
  startOfWeek.setHours(0, 0, 0, 0);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Today'];
  let thisWeekTotal = 0;

  const weeklyDays = dayNames.map((dname, idx) => {
    const dStart = new Date(startOfWeek);
    dStart.setDate(startOfWeek.getDate() + idx);
    const dEnd = new Date(dStart);
    dEnd.setDate(dStart.getDate() + 1);

    const dRev = orders
      .filter(o => {
        if (!o.createdAt) return false;
        const od = new Date(o.createdAt);
        return od >= dStart && od < dEnd;
      })
      .reduce((s, o) => s + (Number(o.total) || 0), 0);

    thisWeekTotal += dRev;

    return {
      day: dname,
      isToday: idx === 6,
      rev: dRev,
    };
  });

  const displayWeeklyTotal = thisWeekTotal > 0 ? thisWeekTotal : 0;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', color: '#0f172a' }}>
      
      {/* ══ 1. GREETING & DATE HEADER (CANVA EXACT) ══ */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#0f172a' }}>
          {greeting}, Ashutosh Basnet
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
          Here are your store's today <span style={{ color: '#7952eb', fontWeight: 600 }}>{todayDateStr}</span>
        </p>
      </div>

      {/* ══ 2. THREE STAT CARDS (CANVA EXACT) ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px', marginBottom: '22px' }}>
        
        {/* CARD 1: REVENUE */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Revenue</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '20px' }}>
              Today ▾
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Sales so far today</div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '14px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Rs</span>
            <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {todayRevenue.toLocaleString()}
            </span>
          </div>

          {/* Canva Purple Accent Line with Endpoint Dot */}
          <div style={{ marginTop: '22px' }}>
            <div style={{ position: 'relative', width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '4px' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: todayRevenue > 0 ? '65%' : '35%', background: '#9333ea', borderRadius: '4px' }}>
                <span style={{ position: 'absolute', right: '-4px', top: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px', background: '#9333ea', borderRadius: '50%', border: '2px solid #ffffff' }} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: ORDERS */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Orders</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '20px' }}>
              Today ▾
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Orders placed today</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '14px' }}>
            <span style={{ fontSize: '1.15rem' }}>🛒</span>
            <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {todayOrders.length}
            </span>
          </div>

          {/* Canva Segmented Dashed Light-Blue Pills */}
          <div style={{ marginTop: '22px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ height: '3px', width: '12px', borderRadius: '4px', background: '#e0f2fe' }} />
            <span style={{ height: '3px', width: '12px', borderRadius: '4px', background: '#e0f2fe' }} />
            <span style={{ height: '3px', width: '12px', borderRadius: '4px', background: '#e0f2fe' }} />
            <span style={{ height: '3px', width: '12px', borderRadius: '4px', background: '#e0f2fe' }} />
            <span style={{ height: '3px', width: '12px', borderRadius: '4px', background: '#e0f2fe' }} />
            <span style={{ height: '3px', width: '12px', borderRadius: '4px', background: '#e0f2fe' }} />
            <span style={{ height: '3px', width: '16px', borderRadius: '4px', background: '#38bdf8' }} />
          </div>
        </div>

        {/* CARD 3: AVERAGE ORDER VALUE */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Average Order Value</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '20px' }}>
              Today ▾
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Average Order Value</div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '14px' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Rs</span>
            <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {todayAov.toLocaleString()}
            </span>
          </div>

          {/* Canva Orange Gradient Accent Line */}
          <div style={{ marginTop: '22px' }}>
            <div style={{ width: '100%', height: '3px', background: 'linear-gradient(90deg, #f97316 0%, #fb923c 60%, #fed7aa 100%)', borderRadius: '4px' }} />
          </div>
        </div>
      </div>

      {/* ══ 3. TWO LARGE CHARTS (CANVA EXACT) ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px', marginBottom: '24px' }}>
        
        {/* CHART 1: HOURLY ORDER STATISTICS */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
            Hourly Order Statistics
          </div>

          {/* SVG Hourly Line Graph with dashed lines and purple dots */}
          <div style={{ width: '100%' }}>
            <svg viewBox="0 0 580 125" style={{ width: '100%', height: '140px', overflow: 'visible' }}>
              {/* Dashed Horizontal Grid Lines */}
              <line x1="25" y1="20" x2="570" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="25" y1="50" x2="570" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="25" y1="80" x2="570" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="25" y1="110" x2="570" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />

              {/* Y Axis Labels */}
              <text x="8" y="23" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">4</text>
              <text x="8" y="53" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">3</text>
              <text x="8" y="83" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">2</text>
              <text x="8" y="98" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">1</text>
              <text x="8" y="113" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">0</text>

              {/* Baseline Horizontal Line in Purple */}
              <line x1="25" y1="110" x2="570" y2="110" stroke="#7c3aed" strokeWidth="1.5" />

              {/* Polyline and Dots */}
              <polyline fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={hourlyPoints} />

              {hourlyHours.map(h => {
                const cx = 30 + h * 24.5;
                const cy = 110 - (hourlyCounts[h] / maxHourly) * 90;
                return (
                  <circle
                    key={h}
                    cx={cx}
                    cy={cy}
                    r={hourlyCounts[h] > 0 ? 3.5 : 2}
                    fill={hourlyCounts[h] > 0 ? '#ffffff' : '#7c3aed'}
                    stroke="#7c3aed"
                    strokeWidth={hourlyCounts[h] > 0 ? 2 : 1}
                  />
                );
              })}
            </svg>

            {/* X-Axis Hours Labels (00:00 to 22:00) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#94a3b8', fontFamily: 'monospace', marginTop: '6px', paddingLeft: '8px', paddingRight: '4px' }}>
              {hourlyHours.map(h => (
                <span key={h}>{String(h).padStart(2, '0')}:00</span>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 2: WEEKLY SALES */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #f1f5f9', padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Weekly Sales</div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                Sunday to Today, as per the last 7 days sales trend.
              </div>
            </div>

            {/* Legend: This week & Last week */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#475569', fontWeight: 500 }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7c3aed' }} />
                This week
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontWeight: 500 }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ddd6fe' }} />
                Last week
              </span>
            </div>
          </div>

          {/* Canva Stats Line: Rs 0 | No sales in the same days last week */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Rs</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              {displayWeeklyTotal.toLocaleString()}
            </span>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginLeft: '6px' }}>
              No sales in the same days last week
            </span>
          </div>

          {/* SVG Weekly Grid */}
          <div style={{ width: '100%' }}>
            <svg viewBox="0 0 580 125" style={{ width: '100%', height: '140px', overflow: 'visible' }}>
              {/* Dashed Horizontal Grid Lines */}
              <line x1="25" y1="20" x2="570" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="25" y1="50" x2="570" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="25" y1="80" x2="570" y2="80" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="25" y1="110" x2="570" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3,3" />

              {/* Y Axis Labels */}
              <text x="8" y="23" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">4</text>
              <text x="8" y="53" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">3</text>
              <text x="8" y="83" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">2</text>
              <text x="8" y="98" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">1</text>
              <text x="8" y="113" fontSize="9" fill="#94a3b8" fontFamily="sans-serif">0</text>

              {/* Baseline Horizontal Line */}
              <line x1="25" y1="110" x2="570" y2="110" stroke="#e2e8f0" strokeWidth="1" />

              {/* Weekly Bars / Indicators */}
              {weeklyDays.map((d, i) => {
                const x = 55 + i * 78;
                return (
                  <g key={d.day}>
                    <rect x={x} y="108" width="8" height="2" rx="1" fill="#7c3aed" />
                    <rect x={x + 10} y="108" width="8" height="2" rx="1" fill="#ddd6fe" />
                  </g>
                );
              })}
            </svg>

            {/* X-Axis Days Labels (Sun Mon Tue Wed Thu Fri Today) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', fontWeight: 500, marginTop: '6px', paddingLeft: '45px', paddingRight: '25px' }}>
              {weeklyDays.map(d => (
                <span key={d.day} style={{ fontWeight: d.isToday ? 700 : 500, color: d.isToday ? '#0f172a' : '#94a3b8' }}>
                  {d.day}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
