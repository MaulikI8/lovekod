import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { siteConfig } from '../data/site';
import CommandSearchDialog from './CommandSearchDialog';
import TiharLights from './TiharLights';
import { Search, Lightbulb, ShoppingBag, Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { ThemeToggleButton4 } from './ui/skiper-ui/skiper4';

export default function Header() {
  const { cartCount, setCartOpen, lightsEnabled, toggleLights, siteSettings } = useStore();
  const [guideDismissed, setGuideDismissed] = useState(() => {
    try {
      return localStorage.getItem("lovekod_tihar_guide_seen") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleLightsWithDismiss = () => {
    toggleLights();
    if (!guideDismissed) {
      setGuideDismissed(true);
      try {
        localStorage.setItem("lovekod_tihar_guide_seen", "true");
      } catch {}
    }
  };
  const location = useLocation();
  const navigate = useNavigate();

  // Scroll states for dynamic navbar
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastScrollY, setLastScrollY] = useState(0);

  // Mega-menu and search states
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('');

  // Announcement rotation index
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const hoverTimeoutRef = useRef(null);

  const isHome = location.pathname === '/';

  // Rotating Announcement
  const announcements = siteSettings?.announcementText
    ? [siteSettings.announcementText, ...siteConfig.announcements.slice(1)]
    : siteConfig.announcements;

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementIdx(prev => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [announcements.length]);

  // Scroll detection: Shrink after 80px + hide on fast scroll down / show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 80);

      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY + 6) {
          setScrollDirection('down');
        } else if (currentScrollY < lastScrollY - 6) {
          setScrollDirection('up');
        }
      } else {
        setScrollDirection('up');
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Global Cmd/Ctrl + K shortcut for search
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMegaMenuOpen(false);
    setMobileDrawerOpen(false);
  }, [location.pathname]);

  // Hover intent for mega-menu (120ms debounce to prevent flicker)
  const handleMouseEnterCollection = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(true);
      setActiveTab('collection');
    }, 120);
  };

  const handleMouseLeaveCollection = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setMegaMenuOpen(false);
      setActiveTab('');
    }, 150);
  };

  return (
    <>
      <header
        className={`luxury-header-wrapper ${isScrolled ? 'is-scrolled' : ''} ${!isHome ? 'not-home' : ''} ${scrollDirection === 'down' && isScrolled ? 'nav-hidden' : ''}`}
      >
        {/* ── ROW 1: Announcement Band (36px, --night dark cocoa) ── */}
        <div className="announcement-band-row">
          <div className="announcement-band-inner">
            <span
              key={announcementIdx}
              className="announcement-fade-text"
            >
              {announcements[announcementIdx]}
            </span>
          </div>
          {/* Tihar Lights Hanging from Announcement Band */}
          <TiharLights />
        </div>

        {/* ── ROW 2: Main Bar (72px default -> 56px scrolled) ── */}
        <div className="main-navbar-bar">
          <div className="main-navbar-inner">

            {/* LEFT GROUP: Collection, Occasions, Lookbook */}
            <nav className="nav-left-group" aria-label="Catalog Navigation">
              {/* Collection with Mega-Menu Trigger */}
              <div
                className="mega-trigger-wrap"
                onMouseEnter={handleMouseEnterCollection}
                onMouseLeave={handleMouseLeaveCollection}
              >
                <button
                  type="button"
                  className={`nav-text-link ${megaMenuOpen || activeTab === 'collection' ? 'is-active' : ''}`}
                  onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                  aria-expanded={megaMenuOpen}
                >
                  <span>Collection</span>
                  <ChevronDown size={14} className={`nav-chevron ${megaMenuOpen ? 'rotated' : ''}`} />
                </button>
              </div>

              <a
                href="/#collection"
                className={`nav-text-link ${activeTab === 'occasions' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('occasions')}
              >
                <span>Occasions</span>
              </a>

              <a
                href="/#collection"
                className={`nav-text-link ${activeTab === 'lookbook' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('lookbook')}
              >
                <span>Lookbook</span>
              </a>
            </nav>

            {/* CENTER: Transparent Logo (Monogram + Wordmark + Devanagari) */}
            <Link to="/" className="center-brand-logo" aria-label="LoveKod Home">
              <div className="logo-monogram-symbol">
                {/* Handcrafted Rose-Gold LK Monogram SVG */}
                <svg viewBox="0 0 48 48" fill="none" className="lk-monogram-svg" xmlns="http://www.w3.org/2000/svg">
                  {/* Stem of L */}
                  <path d="M14 8 H20 V38 H34 V42 H14 Z" fill="currentColor" />
                  {/* Swoosh of K in Rose-Gold Accent */}
                  <path d="M26 26 L38 8 H44 L30 28 L44 42 H37 L24 29 Z" fill="currentColor" />
                  <path d="M19 28 C26 23 32 16 38 12 C32 20 28 28 24 35 Z" fill="var(--rose-gold-logo)" opacity="0.9" />
                </svg>
              </div>

              <div className={`logo-text-details ${isScrolled ? 'collapsed' : ''}`}>
                <span className="brand-wordmark">LoveKod</span>
                <span className="brand-devanagari">लभकोण</span>
              </div>
            </Link>

            {/* RIGHT GROUP: Reviews + Icon Buttons */}
            <div className="nav-right-group">
              <nav className="nav-right-links" aria-label="Store Information">

                <a
                  href="/#reviews"
                  className={`nav-text-link ${activeTab === 'reviews' ? 'is-active' : ''}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  <span>Reviews</span>
                </a>
              </nav>

              {/* Action Icons (44x44 hit areas, unboxed, hover --rose-gold) */}
              <div className="nav-action-icons">
                {/* Search Dialog Trigger */}
                <button
                  type="button"
                  className="nav-icon-action-btn"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open Search"
                  title="Search catalog (Cmd+K)"
                >
                  <Search size={20} />
                </button>

                {/* Lights Toggle with One-Time Guide Tooltip */}
                <div className="tihar-lights-toggle-wrapper">
                  <ThemeToggleButton4
                    className={`nav-icon-action-btn w-9 h-9 p-1.5 ${lightsEnabled ? 'lights-lit' : ''}`}
                    checked={lightsEnabled}
                    onChange={handleToggleLightsWithDismiss}
                    aria-label={lightsEnabled ? "Turn off festive lights" : "Turn on festive lights"}
                    title={lightsEnabled ? "Turn off festive lights" : "Turn on festive lights"}
                  />
                  {!guideDismissed && (
                    <div 
                      className="tihar-lights-guide-tooltip" 
                      role="note"
                      onClick={() => {
                        setGuideDismissed(true);
                        try {
                          localStorage.setItem("lovekod_tihar_guide_seen", "true");
                        } catch {}
                      }}
                    >
                      <span className="guide-sparkle">✨</span>
                      <span className="guide-text">Let&apos;s celebrate Tihar!</span>
                    </div>
                  )}
                </div>

                {/* Shopping Bag Button with Notification Count Dot */}
                <button
                  type="button"
                  className="nav-icon-action-btn bag-btn"
                  onClick={() => setCartOpen(true)}
                  aria-label={`Open bag with ${cartCount} items`}
                  title="Shopping Bag"
                >
                  <ShoppingBag size={20} />
                  {cartCount > 0 && <span className="bag-count-dot">{cartCount}</span>}
                </button>

                {/* Mobile Menu Hamburger */}
                <button
                  type="button"
                  className="mobile-hamburger-btn"
                  onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
                  aria-label="Toggle Navigation Drawer"
                >
                  {mobileDrawerOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ── COLLECTION MEGA-MENU PANEL (Full-width, --surface, hairline border) ── */}
        <div
          className={`mega-menu-panel ${megaMenuOpen ? 'is-open' : ''}`}
          onMouseEnter={handleMouseEnterCollection}
          onMouseLeave={handleMouseLeaveCollection}
        >
          <div className="mega-menu-inner">
            {/* Left 3 Text Columns */}
            <div className="mega-columns-grid">
              {/* Column 1: By Fabric */}
              <div className="mega-column">
                <span className="mega-column-title">BY FABRIC</span>
                <ul className="mega-links-list">
                  {siteConfig.megaMenu.fabrics.map((item, idx) => (
                    <li key={idx} style={{ animationDelay: `${idx * 0.04}s` }} className="mega-link-item">
                      <a href="/#collection" onClick={() => setMegaMenuOpen(false)}>
                        <span className="link-name">{item.name}</span>
                        <span className="link-sub">{item.count}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: By Set Cut */}
              <div className="mega-column">
                <span className="mega-column-title">BY SET SILHOUETTE</span>
                <ul className="mega-links-list">
                  {siteConfig.megaMenu.sets.map((item, idx) => (
                    <li key={idx} style={{ animationDelay: `${(idx + 3) * 0.04}s` }} className="mega-link-item">
                      <a href="/#collection" onClick={() => setMegaMenuOpen(false)}>
                        <span className="link-name">{item.name}</span>
                        <span className="link-desc">{item.desc}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: By Occasion */}
              <div className="mega-column">
                <span className="mega-column-title">BY TIHAR OCCASION</span>
                <ul className="mega-links-list">
                  {siteConfig.megaMenu.occasions.map((item, idx) => (
                    <li key={idx} style={{ animationDelay: `${(idx + 6) * 0.04}s` }} className="mega-link-item">
                      <a href="/#collection" onClick={() => setMegaMenuOpen(false)}>
                        <span className="link-name">{item.name}</span>
                        <span className="link-tag">{item.tag}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: Featured Look Card with Photo & Caption */}
            <div className="mega-featured-card">
              <div className="mega-featured-media">
                <img
                  src={siteConfig.megaMenu.featured.image}
                  alt={siteConfig.megaMenu.featured.title}
                />
                <span className="featured-flag">Tihar Signature</span>
              </div>
              <div className="mega-featured-meta">
                <span className="featured-title">{siteConfig.megaMenu.featured.title}</span>
                <span className="featured-caption">{siteConfig.megaMenu.featured.caption}</span>
                <div className="featured-price-row">
                  <span className="featured-price">{siteConfig.megaMenu.featured.price}</span>
                  <Link
                    to={siteConfig.megaMenu.featured.link}
                    className="featured-shop-link"
                    onClick={() => setMegaMenuOpen(false)}
                  >
                    <span>Shop this look</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ── COMMAND SEARCH DIALOG ── */}
      <CommandSearchDialog
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* ── MOBILE SLIDE-OVER SHEET ── */}
      {mobileDrawerOpen && (
        <div className="mobile-sheet-overlay" onClick={() => setMobileDrawerOpen(false)}>
          <div className="mobile-sheet-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-sheet-header">
              <span className="brand-wordmark">LoveKod</span>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-sheet-links">
              <a href="/#collection" onClick={() => setMobileDrawerOpen(false)}>
                Festive Kurtha Collection
              </a>
              <a href="/#collection" onClick={() => setMobileDrawerOpen(false)}>
                3-Piece Georgette Sets
              </a>
              <a href="/#collection" onClick={() => setMobileDrawerOpen(false)}>
                Bhai Tika Specials
              </a>

              <a href="/#reviews" onClick={() => setMobileDrawerOpen(false)}>
                Customer Reviews
              </a>
            </div>

            <div className="mobile-sheet-footer">
              <button
                type="button"
                className="mobile-sheet-search-btn"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setSearchOpen(true);
                }}
              >
                <Search size={16} />
                <span>Search catalog...</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
