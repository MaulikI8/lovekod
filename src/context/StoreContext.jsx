import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { defaultProducts } from '../data/products';

const StoreContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: 'lovekod_products',
  CART: 'lovekod_cart',
  ORDERS: 'lovekod_orders',
  CUSTOMERS: 'lovekod_customers',
  ADMIN_AUTH: 'lovekod_admin',
  LIGHTS: 'lovekod_tihar_lights',
  SITE_SETTINGS: 'lovekod_site_settings',
  CATEGORIES: 'lovekod_categories',
  FESTIVALS: 'lovekod_festivals',
  TESTIMONIALS: 'lovekod_testimonials',
  COUPONS: 'lovekod_coupons',
};

const DEFAULT_COUPONS = [
  {
    id: 'coup_tihar2083',
    code: 'TIHAR2083',
    discountType: 'fixed',
    discountValue: 200,
    minOrderAmount: 1500,
    description: 'Tihar Festive Special - Flat Rs. 200 OFF on orders above Rs. 1,500',
    active: true,
    usesCount: 8,
    createdAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'coup_welcome10',
    code: 'WELCOME10',
    discountType: 'percent',
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscountAmount: 500,
    description: '10% Welcome Discount for handcrafted kurthas',
    active: true,
    usesCount: 15,
    createdAt: '2026-10-21T11:00:00Z',
  },
  {
    id: 'coup_festive15',
    code: 'FESTIVE15',
    discountType: 'percent',
    discountValue: 15,
    minOrderAmount: 3000,
    maxDiscountAmount: 1000,
    description: '15% Royal Festive Discount on orders over Rs. 3,000',
    active: true,
    usesCount: 3,
    createdAt: '2026-10-23T14:30:00Z',
  },
];

// Auto-purge stale localStorage cache so all visitors and friends immediately get live catalog data
const LIVE_CACHE_VERSION = 'lovekod_v5_live';
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('lovekod_cache_ver') !== LIVE_CACHE_VERSION) {
      [
        'lovekod_products',
        'lovekod_categories',
        'lovekod_site_settings',
        'lovekod_festivals',
        'lovekod_testimonials',
        'lovekod_orders',
      ].forEach((key) => {
        try { localStorage.removeItem(key); } catch {}
      });
      localStorage.setItem('lovekod_cache_ver', LIVE_CACHE_VERSION);
    }
  } catch { /* ignore */ }
}

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const DEFAULT_SETTINGS = {
  announcementNepali: 'TIHAR FESTIVE EDIT',
  announcementText: 'Delivering Across All 77 Districts of Nepal for Tihar 2083',
  freeShippingThreshold: 3000,
  contactPhone: '+977 9717567133',
  contactWhatsapp: '+977 9717567133',
  contactEmail: 'concierge@lovekod.com',
  contactAddress: 'Kathmandu Valley, Nepal',
  socialHandle: '@lovekod.np',
  socialInstagram: 'https://instagram.com/lovekod.np',
  socialTiktok: 'https://tiktok.com/@lovekod.np',
  socialFacebook: 'https://facebook.com/lovekod.np',
  websiteUrl: 'https://www.lovekod.com',
  heroBadgeNepali: 'Tihar 2083',
  heroBadgeText: 'Tihar Festive Edit',
  heroTitleLine1: 'Draped in Light,',
  heroTitleAccent: 'Crafted for Celebration',
  heroSubtitle: 'Intricately embroidered georgettes, pure chanderi silks, and regal zari borders. Consciously curated for Laxmi Puja, Bhai Tika, and cherished gatherings across Nepal.',
  heroWatermark: 'LOVEKOD',
  heroImage: '/images/hero-banner.jpg',
  heroTrustItem1: 'Delivering Across All 77 Districts',
  heroTrustItem2: 'Pure Georgette & Silk',
  heroTrustItem3: 'Ready for Bhai Tika',
  spotlightBadge: 'Signature Tihar Set',
  spotlightTitle: 'Charcoal Embroidered Georgette Set',
  spotlightNepali: 'Signature Georgette Set',
  spotlightDesc: 'Cut from gossamer georgette with silver zari needlework framing the neckline, scalloped palazzo cuffs, and a translucent dupatta that catches the warm amber glow of every diya.',
  spotlightProductId: 'lk-001',
  storyTag: 'Our Story • The LoveKod Ethos',
  storyTitle: 'Rooted in the Valley, Lit for the Nation',
  storyP1: 'LoveKod was born out of a simple observation: Nepali women deserve festive attire that looks regal under the evening lights of Tihar without sacrificing comfort during day-long Bhai Tika ceremonies.',
  storyP2: 'We work exclusively with small batches of pure georgette, tissue chanderi, and silk blends. Each garment is measured against Nepali standard fits with generous seam allowances, so you can celebrate without worries.',
  storyQuote: 'When you welcome Laxmi into your home, let your attire celebrate both tradition and modern ease.',
  storyQuoteAuthor: 'The LoveKod Studio, Kathmandu',
  diyasLitCount: 108,
  saleCountdownEnabled: false,
  saleCountdownTitle: 'Flash Sale • Tihar Festive Drop',
  saleCountdownSubtitle: 'Limited batch festive kurtha sets in pure georgette and silk blends. Offer expires when the timer hits zero.',
  saleCountdownTargetDate: '2026-11-10T23:59:59',
  saleCountdownCtaText: 'Shop the Flash Sale',
  saleCountdownCtaLink: '#collection',
  heroHotspots: [],
};

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'All Sets', slug: 'all', nepaliName: '', order: 1, isActive: true },
  { id: 2, name: 'Georgette Sets', slug: 'georgette', nepaliName: '', order: 2, isActive: true },
  { id: 3, name: 'Silk Blend', slug: 'silk', nepaliName: '', order: 3, isActive: true },
  { id: 4, name: '3-Piece Sets', slug: '3-piece', nepaliName: '', order: 4, isActive: true },
];

const isDummyProduct = (p) => String(p?.id) === 'lk-001' && (p?.name || '').trim() === 'Royal Silk';

function loadCategories() {
  const cached = loadState('lovekod_categories', null);
  if (Array.isArray(cached) && cached.length > 0) {
    return cached.filter(c => c.id !== 5 && c.slug !== 'co-ord');
  }
  return DEFAULT_CATEGORIES;
}

function loadProducts() {
  const cached = loadState('lovekod_products', []);
  if (Array.isArray(cached) && cached.length > 0) {
    return cached.filter(p => !isDummyProduct(p) && !p.isDeleted && !p.is_deleted);
  }
  return [];
}

function loadOrders() {
  const cached = loadState('lovekod_orders', []);
  if (Array.isArray(cached) && cached.length > 0) {
    return cached.filter(o => !o.isDeleted && !o.is_deleted);
  }
  return [];
}

function loadCustomers() {
  const cached = loadState('lovekod_customers', []);
  if (Array.isArray(cached) && cached.length > 0) {
    return cached.filter(c => !c.isDeleted && !c.is_deleted);
  }
  return [];
}

function loadCoupons() {
  const cached = loadState('lovekod_coupons', null);
  if (Array.isArray(cached) && cached.length > 0) {
    return cached;
  }
  return DEFAULT_COUPONS;
}

function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

export function StoreProvider({ children }) {
  // Dynamic catalog state strictly in-memory (synced live with Django backend)
  const [products, setProducts] = useState(loadProducts);
  const [categories, setCategories] = useState(loadCategories);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SETTINGS);
  const [festivalMoments, setFestivalMoments] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [orders, setOrders] = useState(loadOrders);
  const [customers, setCustomers] = useState(loadCustomers);
  const [coupons, setCoupons] = useState(loadCoupons);

  // Client session state (persisted)
  const [cart, setCart] = useState(() => loadState(STORAGE_KEYS.CART, []));
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [isAdmin, setIsAdmin] = useState(() => loadState(STORAGE_KEYS.ADMIN_AUTH, false));

  // Tihar Lights State
  const [lightsEnabled, setLightsEnabled] = useState(() => loadState(STORAGE_KEYS.LIGHTS, true));
  const [celebrateLights, setCelebrateLights] = useState(false);

  // Sync ONLY client session state to localStorage (never catalog items!)
  useEffect(() => saveState(STORAGE_KEYS.CART, cart), [cart]);
  useEffect(() => saveState(STORAGE_KEYS.ADMIN_AUTH, isAdmin), [isAdmin]);
  useEffect(() => saveState(STORAGE_KEYS.LIGHTS, lightsEnabled), [lightsEnabled]);
  useEffect(() => saveState('lovekod_orders', orders), [orders]);
  useEffect(() => saveState('lovekod_customers', customers), [customers]);
  useEffect(() => saveState('lovekod_coupons', coupons), [coupons]);

  // Anti-cache fetch helper: guarantees fresh responses bypassing browser/proxy cache
  const fetchLive = async (path) => {
    const sep = path.includes('?') ? '&' : '?';
    return fetch(`${API_BASE}${path}${sep}_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  };

  // Fetch all dynamic data from Django Backend
  const refreshFromBackend = useCallback(async () => {
    // 1. Products (Merged with local cache so user products are never wiped on refresh)
    try {
      const res = await fetchLive('/products/');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const activeOnly = data.filter(p => !p.isDeleted && !p.is_deleted && !isDummyProduct(p));
          setProducts(prev => {
            const map = new Map();
            prev.forEach(p => map.set(String(p.id), p));
            activeOnly.forEach(p => map.set(String(p.id), { ...(map.get(String(p.id)) || {}), ...p }));
            const merged = Array.from(map.values());
            saveState('lovekod_products', merged);
            return merged;
          });
        }
      }
    } catch { /* offline fallback */ }

    // 2. Categories (Exclude soft deleted)
    try {
      const catRes = await fetchLive('/categories/');
      if (catRes.ok) {
        const catData = await catRes.json();
        if (Array.isArray(catData)) {
          const activeOnly = catData.filter(c => !c.isDeleted && !c.is_deleted && c.id !== 5 && c.slug !== 'co-ord');
          setCategories(activeOnly);
          saveState('lovekod_categories', activeOnly);
        }
      }
    } catch { /* offline fallback */ }

    // 3. Site Settings
    try {
      const setRes = await fetchLive('/site-settings/');
      if (setRes.ok) {
        const setData = await setRes.json();
        if (setData && !setData.error) {
          setSiteSettings(prev => ({ ...prev, ...setData }));
        }
      }
    } catch { /* offline fallback */ }

    // 4. Festival Moments Marquee
    try {
      const festRes = await fetchLive('/festival-moments/');
      if (festRes.ok) {
        const festData = await festRes.json();
        if (Array.isArray(festData)) {
          const activeOnly = festData.filter(m => !m.isDeleted && !m.is_deleted);
          setFestivalMoments(activeOnly);
        }
      }
    } catch { /* offline fallback */ }

    // 5. Testimonials
    try {
      const testRes = await fetchLive('/testimonials/');
      if (testRes.ok) {
        const testData = await testRes.json();
        if (Array.isArray(testData)) {
          const activeOnly = testData.filter(t => !t.isDeleted && !t.is_deleted);
          setTestimonials(activeOnly);
        }
      }
    } catch { /* offline fallback */ }

    // 6. Orders (Merged with local cache so edits are never wiped)
    try {
      const ordersRes = await fetchLive('/orders/');
      if (ordersRes.ok) {
        const orderData = await ordersRes.json();
        if (Array.isArray(orderData)) {
          const activeOnly = orderData.filter(o => !o.isDeleted && !o.is_deleted);
          setOrders(prev => {
            const map = new Map();
            activeOnly.forEach(o => map.set(String(o.id), o));
            prev.forEach(localO => {
              const remote = map.get(String(localO.id));
              if (remote) {
                map.set(String(localO.id), {
                  ...remote,
                  status: localO.status || remote.status,
                  paymentStatus: localO.paymentStatus || remote.paymentStatus,
                  payment_status: localO.payment_status || remote.payment_status,
                  items: localO.items && localO.items.length > 0 ? localO.items : remote.items,
                });
              } else {
                map.set(String(localO.id), localO);
              }
            });
            const merged = Array.from(map.values());
            merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            saveState('lovekod_orders', merged);
            return merged;
          });
        }
      }
    } catch { /* offline fallback */ }

    // 7. Customers Directory
    try {
      const custRes = await fetchLive('/customers/');
      if (custRes.ok) {
        const custData = await custRes.json();
        if (Array.isArray(custData)) {
          const activeOnly = custData.filter(c => !c.isDeleted && !c.is_deleted);
          setCustomers(activeOnly);
        }
      }
    } catch { /* offline fallback */ }
  }, []);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);

  function toggleLights() {
    setLightsEnabled(prev => !prev);
  }

  function showToast(message, type = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // ── Cart Operations ──
  function addToCart(productId, size) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const stock = product.sizes?.[size] || 0;
    const existing = cart.find(c => c.productId === productId && c.size === size);
    const currentQty = existing ? existing.quantity : 0;
    if (currentQty >= stock) {
      showToast('Out of stock for this size', 'error');
      return;
    }
    if (existing) {
      setCart(cart.map(c =>
        c.productId === productId && c.size === size
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, { productId, size, quantity: 1 }]);
    }

    setCelebrateLights(true);
    setTimeout(() => setCelebrateLights(false), 700);

    showToast(`${product.name} (${size}) added to bag`);
    setCartOpen(true);
  }

  function updateCartQty(productId, size, delta) {
    const product = products.find(p => p.id === productId);
    setCart(prev => prev.map(c => {
      if (c.productId !== productId || c.size !== size) return c;
      const newQty = c.quantity + delta;
      if (newQty <= 0) return null;
      const stock = product?.sizes?.[size] || 0;
      if (newQty > stock) { showToast('Not enough stock', 'error'); return c; }
      return { ...c, quantity: newQty };
    }).filter(Boolean));
  }

  function removeFromCart(productId, size) {
    setCart(prev => prev.filter(c => !(c.productId === productId && c.size === size)));
  }

  function clearCart() { setCart([]); }

  const cartTotal = cart.reduce((sum, item) => {
    const p = products.find(pr => pr.id === item.productId);
    return sum + (p ? p.price * item.quantity : 0);
  }, 0);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  async function placeOrder(customerInfo) {
    const threshold = siteSettings.freeShippingThreshold || 3000;
    const orderId = 'ORD-' + Date.now().toString(36).toUpperCase();
    const orderItems = cart.map(c => {
      const p = products.find(pr => pr.id === c.productId);
      return { ...c, name: p?.name, price: p?.price, image: p?.image };
    });
    const finalTotal = typeof customerInfo.total === 'number'
      ? customerInfo.total
      : cartTotal + (cartTotal >= threshold ? 0 : 150);

    const orderPayload = {
      id: orderId,
      customer: {
        ...customerInfo,
        email: customerInfo.email || '',
      },
      items: orderItems,
      total: finalTotal,
      couponCode: customerInfo.couponCode || '',
      discountAmount: customerInfo.discountAmount || 0,
      channel: customerInfo.channel || 'Website',
      status: customerInfo.status || 'Pending',
      createdAt: new Date().toISOString(),
    };

    // Optimistic local update
    setProducts(prev => prev.map(p => {
      const cartItem = cart.find(c => c.productId === p.id);
      if (!cartItem) return p;
      const newSizes = { ...p.sizes };
      cart.filter(c => c.productId === p.id).forEach(c => {
        newSizes[c.size] = Math.max(0, (newSizes[c.size] || 0) - c.quantity);
      });
      return { ...p, sizes: newSizes };
    }));
    setOrders(prev => [orderPayload, ...prev]);
    clearCart();

    try {
      const res = await fetch(`${API_BASE}/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });
      if (res.ok) {
        const savedOrder = await res.json();
        setOrders(prev => [savedOrder, ...prev.filter(o => o.id !== orderId && o.id !== savedOrder.id)]);
        refreshFromBackend();
        return savedOrder;
      }
    } catch { /* offline fallback */ }

    return orderPayload;
  }

  // ── Site Settings Management ──
  async function updateSiteSettings(newSettings) {
    setSiteSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Site settings updated');
    try {
      const res = await fetch(`${API_BASE}/site-settings/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const updated = await res.json();
        setSiteSettings(prev => ({ ...prev, ...updated }));
      }
    } catch { /* offline fallback */ }
  }

  // ── Category Management ──
  async function addCategory(newCat) {
    showToast('Category added');
    try {
      const res = await fetch(`${API_BASE}/categories/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCat),
      });
      if (res.ok) {
        const saved = await res.json();
        setCategories(prev => {
          const next = [...prev, saved];
          saveState('lovekod_categories', next);
          return next;
        });
        return saved;
      }
    } catch { /* offline fallback */ }
    const fallback = { ...newCat, id: Date.now() };
    setCategories(prev => {
      const next = [...prev, fallback];
      saveState('lovekod_categories', next);
      return next;
    });
    return fallback;
  }

  async function updateCategory(id, updated) {
    showToast('Category updated');
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    try {
      await fetch(`${API_BASE}/categories/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch { /* offline fallback */ }
  }

  async function deleteCategory(id) {
    showToast('Category deleted');
    setCategories(prev => prev.filter(c => c.id !== id));
    try {
      await fetch(`${API_BASE}/categories/${id}/`, { method: 'DELETE' });
    } catch { /* offline fallback */ }
  }

  // ── Festival Moments Marquee Management ──
  async function addFestivalMoment(moment) {
    showToast('Festival moment added');
    try {
      const res = await fetch(`${API_BASE}/festival-moments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moment),
      });
      if (res.ok) {
        const saved = await res.json();
        setFestivalMoments(prev => [...prev, saved]);
      }
    } catch {
      setFestivalMoments(prev => [...prev, { ...moment, id: Date.now() }]);
    }
  }

  async function updateFestivalMoment(id, updated) {
    showToast('Festival moment updated');
    setFestivalMoments(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
    try {
      await fetch(`${API_BASE}/festival-moments/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch { /* offline fallback */ }
  }

  async function deleteFestivalMoment(id) {
    showToast('Festival moment removed');
    setFestivalMoments(prev => prev.filter(m => m.id !== id));
    try {
      await fetch(`${API_BASE}/festival-moments/${id}/`, { method: 'DELETE' });
    } catch { /* offline fallback */ }
  }

  // ── Testimonials Management ──
  async function addTestimonial(t) {
    showToast('Testimonial added');
    try {
      const res = await fetch(`${API_BASE}/testimonials/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(t),
      });
      if (res.ok) {
        const saved = await res.json();
        setTestimonials(prev => [...prev, saved]);
      }
    } catch {
      setTestimonials(prev => [...prev, { ...t, id: Date.now() }]);
    }
  }

  async function updateTestimonial(id, updated) {
    showToast('Testimonial updated');
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
    try {
      await fetch(`${API_BASE}/testimonials/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch { /* offline fallback */ }
  }

  async function deleteTestimonial(id) {
    showToast('Testimonial removed');
    setTestimonials(prev => prev.filter(t => t.id !== id));
    try {
      await fetch(`${API_BASE}/testimonials/${id}/`, { method: 'DELETE' });
    } catch { /* offline fallback */ }
  }

  // ── Product Management (Fully Persisted in LocalStorage & Synced) ──
  async function updateProduct(updatedProduct) {
    setProducts(prev => {
      const next = prev.map(p => String(p.id) === String(updatedProduct.id) ? { ...p, ...updatedProduct } : p);
      saveState('lovekod_products', next);
      return next;
    });
    showToast('Product updated successfully');

    try {
      await fetch(`${API_BASE}/products/${updatedProduct.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
    } catch { /* offline fallback */ }
  }

  async function addProduct(newProduct) {
    const id = newProduct.id || ('prod_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6));
    const productWithId = { ...newProduct, id };
    setProducts(prev => {
      const next = [productWithId, ...prev.filter(p => p.id !== id)];
      saveState('lovekod_products', next);
      return next;
    });
    showToast('Product added successfully');

    try {
      const res = await fetch(`${API_BASE}/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productWithId),
      });
      if (res.ok) {
        const saved = await res.json();
        setProducts(prev => {
          const next = prev.map(p => p.id === id ? { ...p, ...saved } : p);
          saveState('lovekod_products', next);
          return next;
        });
      }
    } catch { /* offline fallback */ }
    return productWithId;
  }

  async function deleteProduct(id) {
    setProducts(prev => {
      const next = prev.filter(p => String(p.id) !== String(id));
      saveState('lovekod_products', next);
      return next;
    });
    showToast('Product deleted');

    try {
      await fetch(`${API_BASE}/products/${id}/`, { method: 'DELETE' });
    } catch { /* offline fallback */ }
  }

  // ── Real-Time Inventory Sync: Deduct from products & variants ──
  const deductItemsInventory = (itemsToDeduct) => {
    if (!Array.isArray(itemsToDeduct) || itemsToDeduct.length === 0) return;
    setProducts(prevProducts => {
      const updated = prevProducts.map(p => {
        let changed = false;
        const newSizes = { ...(p.sizes || {}) };
        const newCombRows = Array.isArray(p.combinationRows) ? p.combinationRows.map(r => ({ ...r })) : [];

        itemsToDeduct.forEach(it => {
          const itId = it.productId || it.product_id || it.id;
          const itName = it.name || it.title || '';
          const itSku = String(it.sku || '').trim().toUpperCase();
          if ((itId && String(itId) === String(p.id)) || (itName && String(itName).trim().toLowerCase() === String(p.name).trim().toLowerCase())) {
            changed = true;
            const sz = String(it.size || it.variant || 'M').trim();
            const szUpper = sz.toUpperCase();
            const qty = Math.max(1, Number(it.quantity || 1));

            // Deduct combination row
            newCombRows.forEach(row => {
              const rName = String(row.name || '').trim().toUpperCase();
              const rSize = String(row.size || '').trim().toUpperCase();
              const rVar = String(row.variant || '').trim().toUpperCase();
              const rSku = String(row.sku || '').trim().toUpperCase();
              if (
                (itSku && rSku === itSku) ||
                rName === szUpper ||
                rSize === szUpper ||
                rVar === szUpper ||
                (rName && szUpper && (szUpper.includes(rName) || rName.includes(szUpper))) ||
                (rSku && szUpper && rSku.includes(szUpper))
              ) {
                const cur = Number(row.quantity !== undefined ? row.quantity : (row.stock || 0));
                row.quantity = Math.max(0, cur - qty);
                row.stock = Math.max(0, cur - qty);
              }
            });

            // Deduct size
            const sizeKey = Object.keys(newSizes).find(k => k.toUpperCase() === szUpper) || sz;
            if (newSizes[sizeKey] !== undefined) {
              newSizes[sizeKey] = Math.max(0, Number(newSizes[sizeKey]) - qty);
            }
          }
        });

        if (changed) {
          // If product has combinationRows, totalStock is the sum of combinationRows
          const totalStock = newCombRows.length > 0
            ? newCombRows.reduce((a, b) => a + Number(b.quantity !== undefined ? b.quantity : (b.stock || 0)), 0)
            : Object.values(newSizes).reduce((a, b) => a + Number(b || 0), 0);

          // Keep sizes and combinationRows in sync
          if (newCombRows.length > 0) {
            newCombRows.forEach(r => {
              const k = r.name || r.size || r.variant;
              if (k) newSizes[k] = Number(r.quantity !== undefined ? r.quantity : (r.stock || 0));
            });
          }

          const updatedProd = {
            ...p,
            sizes: newSizes,
            combinationRows: newCombRows,
            quantity: totalStock,
            inventory: totalStock,
            totalStock: totalStock,
          };

          try {
            fetch(`${API_BASE}/products/${p.id}/`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                combinationRows: newCombRows,
                sizes: newSizes,
                inventory: totalStock,
              }),
            }).catch(() => {});
          } catch {}

          return updatedProd;
        }
        return p;
      });

      saveState('lovekod_products', updated);
      return updated;
    });
  };

  // ── Real-Time Inventory Sync: Restore to products & variants ──
  const restoreItemsInventory = (itemsToRestore) => {
    if (!Array.isArray(itemsToRestore) || itemsToRestore.length === 0) return;
    setProducts(prevProducts => {
      const updated = prevProducts.map(p => {
        let changed = false;
        const newSizes = { ...(p.sizes || {}) };
        const newCombRows = Array.isArray(p.combinationRows) ? p.combinationRows.map(r => ({ ...r })) : [];

        itemsToRestore.forEach(it => {
          const itId = it.productId || it.product_id || it.id;
          const itName = it.name || it.title || '';
          const itSku = String(it.sku || '').trim().toUpperCase();
          if ((itId && String(itId) === String(p.id)) || (itName && String(itName).trim().toLowerCase() === String(p.name).trim().toLowerCase())) {
            changed = true;
            const sz = String(it.size || it.variant || 'M').trim();
            const szUpper = sz.toUpperCase();
            const qty = Math.max(1, Number(it.quantity || 1));

            // Restore combination row
            newCombRows.forEach(row => {
              const rName = String(row.name || '').trim().toUpperCase();
              const rSize = String(row.size || '').trim().toUpperCase();
              const rVar = String(row.variant || '').trim().toUpperCase();
              const rSku = String(row.sku || '').trim().toUpperCase();
              if (
                (itSku && rSku === itSku) ||
                rName === szUpper ||
                rSize === szUpper ||
                rVar === szUpper ||
                (rName && szUpper && (szUpper.includes(rName) || rName.includes(szUpper))) ||
                (rSku && szUpper && rSku.includes(szUpper))
              ) {
                const cur = Number(row.quantity !== undefined ? row.quantity : (row.stock || 0));
                row.quantity = cur + qty;
                row.stock = cur + qty;
              }
            });

            // Restore size
            const sizeKey = Object.keys(newSizes).find(k => k.toUpperCase() === szUpper) || sz;
            newSizes[sizeKey] = (Number(newSizes[sizeKey]) || 0) + qty;
          }
        });

        if (changed) {
          // If product has combinationRows, totalStock is the sum of combinationRows
          const totalStock = newCombRows.length > 0
            ? newCombRows.reduce((a, b) => a + Number(b.quantity !== undefined ? b.quantity : (b.stock || 0)), 0)
            : Object.values(newSizes).reduce((a, b) => a + Number(b || 0), 0);

          // Keep sizes and combinationRows in sync
          if (newCombRows.length > 0) {
            newCombRows.forEach(r => {
              const k = r.name || r.size || r.variant;
              if (k) newSizes[k] = Number(r.quantity !== undefined ? r.quantity : (r.stock || 0));
            });
          }

          const updatedProd = {
            ...p,
            sizes: newSizes,
            combinationRows: newCombRows,
            quantity: totalStock,
            inventory: totalStock,
            totalStock: totalStock,
          };

          try {
            fetch(`${API_BASE}/products/${p.id}/`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                combinationRows: newCombRows,
                sizes: newSizes,
                inventory: totalStock,
              }),
            }).catch(() => {});
          } catch {}

          return updatedProd;
        }
        return p;
      });

      saveState('lovekod_products', updated);
      return updated;
    });
  };

  async function createManualOrder(orderData) {
    const orderId = orderData.id || ('ORD-' + Date.now().toString(36).toUpperCase());
    const finalOrder = {
      ...orderData,
      id: orderId,
      status: orderData.status || 'Pending',
      paymentStatus: orderData.paymentStatus || (orderData.paymentMethod === 'COD' ? 'Unpaid' : 'Full Paid'),
      payment_status: orderData.paymentStatus || (orderData.paymentMethod === 'COD' ? 'Unpaid' : 'Full Paid'),
      createdAt: orderData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct stock in real time
    if (finalOrder.status !== 'Cancelled') {
      deductItemsInventory(finalOrder.items || []);
    }

    setOrders(prev => {
      const next = [finalOrder, ...prev.filter(o => String(o.id) !== String(orderId))];
      saveState('lovekod_orders', next);
      return next;
    });
    showToast(`Order #${String(orderId).replace(/^ORD-/, '')} created successfully!`);

    try {
      const res = await fetch(`${API_BASE}/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalOrder),
      });
      if (res.ok) {
        const saved = await res.json();
        setOrders(prev => {
          const next = [saved, ...prev.filter(o => String(o.id) !== String(orderId) && String(o.id) !== String(saved.id))];
          saveState('lovekod_orders', next);
          return next;
        });
        return saved;
      }
    } catch { /* offline fallback */ }

    return finalOrder;
  }

  async function updateOrderStatus(orderId, statusOrPatch) {
    const patch = typeof statusOrPatch === 'string' ? { status: statusOrPatch } : (statusOrPatch || {});

    // Real-time stock sync on cancellation / restoration
    if (patch.status) {
      const targetOrder = orders.find(o => String(o.id) === String(orderId));
      if (targetOrder && targetOrder.status !== patch.status) {
        if (patch.status === 'Cancelled' && targetOrder.status !== 'Cancelled') {
          restoreItemsInventory(targetOrder.items || []);
        } else if (targetOrder.status === 'Cancelled' && patch.status !== 'Cancelled') {
          deductItemsInventory(targetOrder.items || []);
        }
      }
    }

    setOrders(prev => {
      const next = prev.map(o => String(o.id) === String(orderId) ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o);
      saveState('lovekod_orders', next);
      return next;
    });
    showToast('Order updated successfully');

    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const saved = await res.json();
        setOrders(prev => {
          const next = prev.map(o => String(o.id) === String(orderId) ? { ...o, ...saved } : o);
          saveState('lovekod_orders', next);
          return next;
        });
      }
    } catch { /* offline fallback */ }
  }

  async function updateOrderPaymentStatus(orderId, paymentStatus) {
    return updateOrderStatus(orderId, { paymentStatus, payment_status: paymentStatus });
  }

  async function updateOrder(updatedOrder) {
    const id = updatedOrder.id;
    const oldOrder = orders.find(o => String(o.id) === String(id));

    // Real-time inventory sync on order item changes
    if (oldOrder && updatedOrder.status !== 'Cancelled') {
      restoreItemsInventory(oldOrder.items || []);
      deductItemsInventory(updatedOrder.items || []);
    }

    setOrders(prev => {
      const next = prev.map(o => String(o.id) === String(id) ? { ...o, ...updatedOrder, updatedAt: new Date().toISOString() } : o);
      saveState('lovekod_orders', next);
      return next;
    });
    showToast(`Order #${String(id).replace(/^ORD-/, '').replace(/^#/, '')} updated successfully`);

    try {
      const res = await fetch(`${API_BASE}/orders/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedOrder),
      });
      if (res.ok) {
        const saved = await res.json();
        setOrders(prev => {
          const next = prev.map(o => String(o.id) === String(id) ? { ...o, ...saved } : o);
          saveState('lovekod_orders', next);
          return next;
        });
      }
    } catch { /* offline fallback */ }
  }

  async function deleteOrder(orderId) {
    const targetOrder = orders.find(o => String(o.id) === String(orderId));
    if (targetOrder && targetOrder.status !== 'Cancelled') {
      restoreItemsInventory(targetOrder.items || []);
    }
    setOrders(prev => {
      const next = prev.filter(o => String(o.id) !== String(orderId));
      saveState('lovekod_orders', next);
      return next;
    });
    showToast(`Order #${String(orderId).replace(/^ORD-/, '').replace(/^#/, '')} deleted`);

    try {
      await fetch(`${API_BASE}/orders/${orderId}/`, { method: 'DELETE' });
    } catch { /* offline fallback */ }
  }

  async function adminLogin(password) {
    if (password === 'lovekod2026') {
      setIsAdmin(true);
      return true;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAdmin(true);
        return true;
      }
    } catch { /* ignore */ }
    return false;
  }

  function adminLogout() { setIsAdmin(false); }

  async function resetInventory() {
    setProducts([]);
    saveState('lovekod_products', []);
    showToast('Inventory reset to defaults');

    try {
      const res = await fetch(`${API_BASE}/products/reset/`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.products) setProducts(data.products);
      }
    } catch { /* offline fallback */ }
  }


  // ── Customer Directory Management ──
  async function lookupCustomer(phone) {
    if (!phone) return null;
    try {
      const res = await fetchLive(`/customers/lookup/?phone=${encodeURIComponent(phone)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Customer lookup error:', err);
    }
    return { exists: false, customer: null };
  }

  async function addCustomer(customerData) {
    try {
      const res = await fetch(`${API_BASE}/customers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData),
      });
      if (res.ok) {
        const saved = await res.json();
        await refreshFromBackend();
        showToast(`Customer ${saved.name || saved.phone} saved successfully!`);
        return saved;
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save customer');
      }
    } catch (err) {
      showToast(err.message || 'Error saving customer', 'error');
      throw err;
    }
  }

  async function updateCustomer(phone, updates) {
    try {
      const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(phone)}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        await refreshFromBackend();
        showToast('Customer record updated');
        return updated;
      }
    } catch (err) {
      showToast('Error updating customer', 'error');
    }
  }

  async function deleteCustomer(phone) {
    try {
      const res = await fetch(`${API_BASE}/customers/${encodeURIComponent(phone)}/`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await refreshFromBackend();
        showToast('Customer moved to trash');
      }
    } catch (err) {
      showToast('Error deleting customer', 'error');
    }
  }

  // ── Discount Coupons Management & Validation ──
  const createCoupon = (data) => {
    const code = (data.code || '').trim().toUpperCase();
    if (!code) throw new Error('Coupon code is required.');
    if (coupons.some(c => c.code.toUpperCase() === code)) {
      throw new Error(`Coupon with code "${code}" already exists.`);
    }
    const newCoupon = {
      id: 'coup_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      code,
      discountType: data.discountType || 'percent',
      discountValue: Math.max(1, Number(data.discountValue) || 10),
      minOrderAmount: Math.max(0, Number(data.minOrderAmount) || 0),
      maxDiscountAmount: data.maxDiscountAmount ? Math.max(0, Number(data.maxDiscountAmount)) : null,
      description: (data.description || '').trim(),
      active: data.active !== undefined ? !!data.active : true,
      usesCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCoupons(prev => [newCoupon, ...prev]);
    showToast(`Coupon "${code}" created successfully!`);
    return newCoupon;
  };

  const updateCoupon = (id, updates) => {
    setCoupons(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          ...updates,
          code: updates.code ? updates.code.trim().toUpperCase() : c.code,
          discountValue: updates.discountValue !== undefined ? Math.max(1, Number(updates.discountValue)) : c.discountValue,
          minOrderAmount: updates.minOrderAmount !== undefined ? Math.max(0, Number(updates.minOrderAmount)) : c.minOrderAmount,
        };
      }
      return c;
    }));
    showToast('Coupon updated successfully!');
  };

  const deleteCoupon = (id) => {
    setCoupons(prev => prev.filter(c => c.id !== id));
    showToast('Coupon deleted');
  };

  const toggleCouponStatus = (id) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const validateCoupon = (inputCode, subtotal = 0) => {
    const normCode = (inputCode || '').trim().toUpperCase();
    if (!normCode) return { valid: false, message: 'Please enter a coupon code.' };
    const found = coupons.find(c => c.code.toUpperCase() === normCode);
    if (!found) {
      return { valid: false, message: `Coupon code "${normCode}" is invalid.` };
    }
    if (!found.active) {
      return { valid: false, message: `Coupon "${found.code}" is currently inactive.` };
    }
    const sub = Number(subtotal) || 0;
    if (found.minOrderAmount && sub < found.minOrderAmount) {
      return {
        valid: false,
        message: `Cart subtotal of at least Rs. ${found.minOrderAmount.toLocaleString()} required for "${found.code}".`
      };
    }
    let disc = 0;
    if (found.discountType === 'percent') {
      disc = Math.round(sub * (Number(found.discountValue) / 100));
      if (found.maxDiscountAmount) {
        disc = Math.min(disc, Number(found.maxDiscountAmount));
      }
    } else {
      disc = Number(found.discountValue);
    }
    disc = Math.min(disc, sub);

    return {
      valid: true,
      coupon: found,
      code: found.code,
      discountType: found.discountType,
      discountValue: found.discountValue,
      discountAmount: disc,
      message: `Coupon "${found.code}" applied! You saved Rs. ${disc.toLocaleString()}.`
    };
  };
  const value = {
    products, categories, siteSettings, festivalMoments, testimonials,
    cart, orders, customers, coupons, cartOpen, toast, isAdmin, cartTotal, cartCount,
    lightsEnabled, toggleLights, celebrateLights,
    setCartOpen, addToCart, updateCartQty, removeFromCart, clearCart, placeOrder,
    updateSiteSettings,
    addCategory, updateCategory, deleteCategory,
    addFestivalMoment, updateFestivalMoment, deleteFestivalMoment,
    addTestimonial, updateTestimonial, deleteTestimonial,
    updateProduct, addProduct, deleteProduct, createManualOrder, updateOrderStatus, updateOrderPaymentStatus, updateOrder, deleteOrder,
    lookupCustomer, addCustomer, updateCustomer, deleteCustomer,
    createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus, validateCoupon,
    adminLogin, adminLogout, showToast, resetInventory, refreshFromBackend,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}
