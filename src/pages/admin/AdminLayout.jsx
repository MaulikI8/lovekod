import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import Toast from '../../components/Toast';

export default function AdminLayout() {
  const { isAdmin, adminLogout, orders } = useStore();
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

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  const mainNavItems = [
    {
      path: '/admin',
      label: 'Home',
      exact: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      path: '/admin/categories',
      label: 'Categories',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      path: '/admin/products',
      label: 'Products',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
    },
    {
      path: '/admin/customers',
      label: 'Customers',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      path: '/admin/orders',
      label: 'Orders',
      badge: pendingCount > 0 ? pendingCount : null,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      path: '/admin/coupons',
      label: 'Discount Coupons',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
    {
      path: '/admin/analytics',
      label: 'Analytics',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
    },
    {
      path: '/admin/media',
      label: 'Media',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
    {
      path: '/admin/finance',
      label: 'Finance',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
    },
  ];

  const customizationNavItems = [
    {
      path: '/admin/content',
      label: 'Content',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      ),
    },
    {
      path: '/admin/users',
      label: 'Admin Users',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      path: '/',
      label: 'Store Front',
      external: true,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
      ),
    },
  ];

  const currentCleanPath = location.pathname.replace(/\/$/, '') || '/admin';

  const renderLink = (item) => {
    const itemCleanPath = item.path.replace(/\/$/, '') || '/admin';
    const isActive = item.exact
      ? (currentCleanPath === itemCleanPath || (itemCleanPath === '/admin' && (currentCleanPath === '/admin' || currentCleanPath === '')))
      : currentCleanPath.startsWith(itemCleanPath);

    if (item.external) {
      return (
        <li key={item.path} style={{ marginBottom: '3px' }}>
          <a
            href={item.path}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '9px 14px',
              borderRadius: '12px',
              color: '#64748b',
              fontSize: '13.5px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.color = '#7952eb';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </a>
        </li>
      );
    }

    return (
      <li key={item.path} style={{ marginBottom: '3px' }}>
        <Link
          to={item.path}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '9px 14px',
            borderRadius: '12px',
            backgroundColor: isActive ? '#f3effe' : 'transparent',
            color: isActive ? '#7952eb' : '#64748b',
            fontSize: '13.5px',
            fontWeight: isActive ? 600 : 500,
            textDecoration: 'none',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.color = '#7952eb';
            }
          }}
          onMouseLeave={e => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#64748b';
            }
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', color: isActive ? '#7952eb' : '#94a3b8' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </span>
          {item.badge && (
            <span style={{ background: '#7952eb', color: '#ffffff', fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px' }}>
              {item.badge}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#fbfbfd', fontFamily: "'Plus Jakarta Sans', Inter, -apple-system, sans-serif" }}>
      <Toast />
      
      <style>{`
        .admin-desktop-sidebar {
          width: 235px;
          background: #ffffff;
          border-right: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .admin-mobile-topbar {
          display: none;
        }
        .admin-main-content {
          flex: 1;
          min-width: 0;
          padding: 28px 36px;
          overflow-y: auto;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 900px) {
          .admin-desktop-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            height: 100vh !important;
            z-index: 1000 !important;
            transform: translateX(-100%);
            box-shadow: 4px 0 24px rgba(0,0,0,0.15) !important;
          }
          .admin-desktop-sidebar.open {
            transform: translateX(0) !important;
          }
          .admin-mobile-topbar {
            display: flex !important;
          }
          .admin-main-content {
            padding: 16px 14px !important;
          }
        }
      `}</style>

      {/* ══ MOBILE TOPBAR (Visible on <= 900px) ══ */}
      <header className="admin-mobile-topbar" style={{
        height: '56px',
        background: '#ffffff',
        borderBottom: '1px solid #f1f5f9',
        padding: '0 16px',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f172a',
              cursor: 'pointer',
            }}
            aria-label="Toggle Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fbf6f0', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="/images/logo.jpg" alt="lovekod" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', textTransform: 'lowercase' }}>lovekod</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
        >
          Sign Out
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(2px)',
            zIndex: 999,
          }}
        />
      )}

      <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 56px)' }}>
        {/* ══ CANVA RECREATED SIDEBAR ══ */}
        <aside className={`admin-desktop-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        
        {/* Brand Logo Header (Matches Canva: Circle Logo + lowercase lovekod) */}
        <div style={{ height: '64px', padding: '0 20px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fbf6f0', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/images/logo.jpg" alt="lovekod" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = '<span style="font-size:11px;font-weight:800;color:#9a3412">lk</span>'; }} />
          </div>
          <span style={{ fontSize: '1.05rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#0f172a', textTransform: 'lowercase' }}>
            lovekod
          </span>
        </div>

        {/* Navigation list */}
        <div style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {mainNavItems.map(renderLink)}
          </ul>

          {/* Section: Customizations */}
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'capitalize', letterSpacing: '0.02em', margin: '18px 0 8px 12px' }}>
            Customizations
          </div>

          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {customizationNavItems.map(renderLink)}
          </ul>
        </div>

        {/* Minimal Bottom Controls */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid #f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <a href="/api/django-admin/" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '11px' }}>
            Django ↗
          </a>
          <button
            type="button"
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ══ MAIN DASHBOARD CONTENT AREA ══ */}
      <main className="admin-main-content">
        <Outlet />
      </main>
      </div>
    </div>
  );
}
