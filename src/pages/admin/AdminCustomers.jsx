import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { WhatsAppIcon } from '../../components/Icons';
import { Link } from 'react-router-dom';

export default function AdminCustomers() {
  const { orders } = useStore();
  const [search, setSearch] = useState('');

  // Group orders by phone (or fullName if phone missing)
  const customerMap = {};
  orders.forEach(order => {
    const cust = order.customer || {};
    const key = (cust.phone || cust.fullName || 'unknown').trim();
    if (!customerMap[key]) {
      customerMap[key] = {
        fullName: cust.fullName || 'Valued Customer',
        phone: cust.phone || '',
        whatsapp: cust.whatsapp || cust.phone || '',
        district: cust.district || '',
        city: cust.city || '',
        address: cust.address || '',
        ordersCount: 0,
        totalSpent: 0,
        orders: [],
        lastOrderDate: order.createdAt || null,
      };
    }
    customerMap[key].ordersCount += 1;
    customerMap[key].totalSpent += (order.total || 0);
    customerMap[key].orders.push(order);
    if (order.createdAt && (!customerMap[key].lastOrderDate || new Date(order.createdAt) > new Date(customerMap[key].lastOrderDate))) {
      customerMap[key].lastOrderDate = order.createdAt;
      customerMap[key].district = cust.district || customerMap[key].district;
      customerMap[key].city = cust.city || customerMap[key].city;
      customerMap[key].address = cust.address || customerMap[key].address;
    }
  });

  const customerList = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);

  const filtered = customerList.filter(c => {
    const q = search.toLowerCase();
    return c.fullName.toLowerCase().includes(q) ||
           c.phone.includes(q) ||
           c.district.toLowerCase().includes(q) ||
           c.city.toLowerCase().includes(q);
  });

  const getWaLink = (customer) => {
    const raw = customer.whatsapp || customer.phone;
    const clean = raw.replace(/[^\d]/g, '').replace(/^0+/, '').replace(/^977/, '');
    const text = encodeURIComponent(
      `Namaste ${customer.fullName}! This is LoveKod Boutique reaching out to you. Thank you for celebrating with us!`
    );
    return `https://wa.me/977${clean}?text=${text}`;
  };

  return (
    <div>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>Customer Directory ({customerList.length})</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            All verified boutique clients with order frequency, cumulative spending, and one-click WhatsApp concierge.
          </p>
        </div>
        <Link to="/admin/orders" className="admin-btn" style={{ background: 'var(--marigold)', color: '#1a0d08', fontWeight: 700 }}>
          View All Orders
        </Link>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search by customer name, mobile number, district, city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            maxWidth: '380px', width: '100%', background: 'var(--night-surface)',
            border: '1px solid var(--night-border)', color: '#fff', padding: '10px 14px',
            borderRadius: 'var(--radius-sm)', fontSize: '0.88rem'
          }}
        />
      </div>

      {/* Customer Table */}
      {filtered.length === 0 ? (
        <div style={{ background: 'var(--night-card)', padding: '48px', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--night-border)', color: 'var(--text-muted)' }}>
          No customer records found matching your search.
        </div>
      ) : (
        <div style={{ background: 'var(--night-card)', border: '1px solid var(--night-border)', borderRadius: 'var(--radius-md)', overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact Phone</th>
                <th>Primary Location</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Latest Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr key={idx}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{c.fullName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {c.address ? c.address.slice(0, 30) + (c.address.length > 30 ? '...' : '') : 'Nepal'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text-body)' }}>{c.phone || 'N/A'}</span>
                  </td>
                  <td>
                    <span style={{ color: '#fff', fontWeight: 500 }}>{c.city || c.district}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{c.district}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--marigold)' }}>
                    {c.ordersCount} {c.ordersCount === 1 ? 'order' : 'orders'}
                  </td>
                  <td style={{ fontWeight: 700, color: '#fff' }} className="tabular-num">
                    Rs. {c.totalSpent.toLocaleString()}
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Recent'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <a
                        href={getWaLink(c)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp-square"
                        style={{ height: '32px', width: '32px' }}
                        title="Chat with customer on WhatsApp"
                      >
                        <WhatsAppIcon size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
