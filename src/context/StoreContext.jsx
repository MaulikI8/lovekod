import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { defaultProducts } from '../data/products';

const StoreContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: 'lovekod_products',
  CART: 'lovekod_cart',
  ORDERS: 'lovekod_orders',
  ADMIN_AUTH: 'lovekod_admin',
  LIGHTS: 'lovekod_tihar_lights',
  SITE_SETTINGS: 'lovekod_site_settings',
  CATEGORIES: 'lovekod_categories',
  FESTIVALS: 'lovekod_festivals',
  TESTIMONIALS: 'lovekod_testimonials',
};

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
  contactPhone: '+977 9719567133',
  contactWhatsapp: '+977 9719567133',
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
  { id: 5, name: 'Co-ord Sets', slug: 'co-ord', nepaliName: '', order: 5, isActive: true },
];

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
  const [products, setProducts] = useState(() => defaultProducts);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SETTINGS);
  const [festivalMoments, setFestivalMoments] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

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
    // 1. Products (Exclude soft deleted)
    try {
      const res = await fetchLive('/products/');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const activeOnly = data.filter(p => !p.isDeleted && !p.is_deleted);
          setProducts(activeOnly);
        }
      } else {
        // Fallback to default products if server returns error or 500
        setProducts(prev => prev.length ? prev : defaultProducts);
      }
    } catch {
      setProducts(prev => prev.length ? prev : defaultProducts);
    }

    // 2. Categories (Exclude soft deleted)
    try {
      const catRes = await fetchLive('/categories/');
      if (catRes.ok) {
        const catData = await catRes.json();
        if (Array.isArray(catData)) {
          const activeOnly = catData.filter(c => !c.isDeleted && !c.is_deleted);
          setCategories(activeOnly);
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

    // 6. Orders (Always sorted with newest on top)
    try {
      const ordersRes = await fetchLive('/orders/');
      if (ordersRes.ok) {
        const orderData = await ordersRes.json();
        if (Array.isArray(orderData)) {
          const activeOnly = orderData.filter(o => !o.isDeleted && !o.is_deleted);
          activeOnly.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setOrders(activeOnly);
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
        setCategories(prev => [...prev, saved]);
      }
    } catch {
      setCategories(prev => [...prev, { ...newCat, id: Date.now() }]);
    }
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

  // ── Product Management ──
  async function updateProduct(updatedProduct) {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    showToast('Product updated');

    try {
      await fetch(`${API_BASE}/products/${updatedProduct.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct),
      });
      refreshFromBackend();
    } catch { /* offline fallback */ }
  }

  async function addProduct(newProduct) {
    const tempId = 'lk-' + Date.now().toString(36);
    const productWithId = { ...newProduct, id: tempId };
    setProducts(prev => [...prev, productWithId]);
    showToast('Product added');

    try {
      const res = await fetch(`${API_BASE}/products/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      });
      if (res.ok) refreshFromBackend();
    } catch { /* offline fallback */ }
  }

  async function deleteProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product deleted');

    try {
      await fetch(`${API_BASE}/products/${id}/`, { method: 'DELETE' });
      refreshFromBackend();
    } catch { /* offline fallback */ }
  }

  async function createManualOrder(orderData) {
    try {
      const res = await fetch(`${API_BASE}/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (res.ok) {
        const saved = await res.json();
        setOrders(prev => [saved, ...prev.filter(o => o.id !== saved.id)]);
        await refreshFromBackend();
        showToast(`Order ${saved.id} created successfully!`);
        return saved;
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create order');
      }
    } catch (err) {
      showToast(err.message || 'Error creating order', 'error');
      throw err;
    }
  }

  async function updateOrderStatus(orderId, status) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    showToast('Order status updated');

    try {
      await fetch(`${API_BASE}/orders/${orderId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
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
    setProducts(defaultProducts);
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
  const value = {
    products, categories, siteSettings, festivalMoments, testimonials,
    cart, orders, customers, cartOpen, toast, isAdmin, cartTotal, cartCount,
    lightsEnabled, toggleLights, celebrateLights,
    setCartOpen, addToCart, updateCartQty, removeFromCart, clearCart, placeOrder,
    updateSiteSettings,
    addCategory, updateCategory, deleteCategory,
    addFestivalMoment, updateFestivalMoment, deleteFestivalMoment,
    addTestimonial, updateTestimonial, deleteTestimonial,
    updateProduct, addProduct, deleteProduct, createManualOrder, updateOrderStatus,
    lookupCustomer, addCustomer, updateCustomer, deleteCustomer,
    adminLogin, adminLogout, showToast, resetInventory, refreshFromBackend,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be inside StoreProvider');
  return ctx;
}
