import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import Toast from '../../components/Toast';

export default function AdminLayout() {
  const { isAdmin, adminLogout, resetInventory, orders } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAdmin) {
    navigate('/admin/login');
    return null;
  }

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  const navItems = [
    { path: '/admin', label: 'Home', icon: '🏠', exact: true },
    { path: '/admin/products', label: 'Products', icon: '📦' },
    { path: '/admin/categories', label: 'Categories', icon: '🏷️' },
    { path: '/admin/inventory', label: 'Inventory', icon: '🗄️' },
    { path: '/admin/customers', label: 'Customers', icon: '👥' },
    { path: '/admin/orders', label: 'Orders', icon: '🛍️', badge: pendingCount > 0 ? pendingCount : null },
    { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { path: '/admin/content', label: 'Site Content & Socials', icon: '⚙️' },
    { path: '/admin/testimonials', label: 'Reviews', icon: '💬' },
  ];

  return (
    <div className="admin-layout">
      <Toast />
      <aside className="admin-sidebar">
        {/* Brand Header */}
        <div className="logo" style={{ padding: '20px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <img src="/images/logo.jpg" alt="LoveKod" style={{ height: '40px', borderRadius: '4px' }} />
          <div className="logo-text-group">
            <span className="logo-text" style={{ fontSize: '1.25rem', letterSpacing: '0.04em' }}>LoveKod</span>
            <span className="logo-sub" style={{ fontSize: '0.68rem', letterSpacing: '0.12em', color: 'var(--marigold)' }}>MERCHANT PORTAL</span>
          </div>
        </div>

        {/* Section Title */}
        <div style={{ padding: '16px 24px 6px', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700 }}>
          Main Links
        </div>

        {/* Navigation list */}
        <ul className="admin-nav" style={{ flex: 1, overflowY: 'auto' }}>
          {navItems.map(item => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={isActive ? 'active' : ''}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge && (
                    <span style={{ background: '#eab308', color: '#1a0d08', fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '10px', lineHeight: 1 }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Bottom Actions */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a
            href="/api/django-admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', background: '#251218', color: 'var(--amber-light)', borderColor: 'var(--marigold)' }}
            title="Open native Django Admin dashboard in new tab"
          >
            Django Database Admin ↗
          </a>

          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              to="/"
              className="admin-btn"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.76rem' }}
            >
              Storefront
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="admin-btn"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.76rem', color: 'var(--danger)' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
