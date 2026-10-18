import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import Toast from '../../components/Toast';

export default function AdminLayout() {
  const { isAdmin, adminLogout, resetInventory } = useStore();
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

  const navItems = [
    { path: '/admin', label: 'Overview', exact: true },
    { path: '/admin/products', label: 'Kurthas & Stock' },
    { path: '/admin/categories', label: 'Categories' },
    { path: '/admin/content', label: 'Site Content & Hero' },
    { path: '/admin/testimonials', label: 'Testimonials' },
    { path: '/admin/orders', label: 'Customer Orders' },
  ];

  return (
    <div className="admin-layout">
      <Toast />
      <aside className="admin-sidebar">
        <div className="logo">
          <img src="/images/logo.jpg" alt="LoveKod" style={{ height: '42px', borderRadius: '4px' }} />
          <div className="logo-text-group">
            <span className="logo-text" style={{ fontSize: '1.3rem' }}>LoveKod</span>
            <span className="logo-sub">ADMIN PORTAL</span>
          </div>
        </div>

        <ul className="admin-nav">
          {navItems.map(item => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <li key={item.path}>
                <Link to={item.path} className={isActive ? 'active' : ''}>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a
            href="/django-admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', background: '#251218', color: 'var(--amber-light)', borderColor: 'var(--marigold)' }}
            title="Open native Django Admin dashboard in new tab"
          >
            Django Database Admin
          </a>

          <button
            type="button"
            onClick={resetInventory}
            className="admin-btn"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', color: 'var(--marigold)' }}
            title="Reset kurtha quantities to initial default state"
          >
            Reset Catalog
          </button>

          <Link
            to="/"
            className="admin-btn"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
          >
            View Storefront
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="admin-btn"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem', color: 'var(--danger)' }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
