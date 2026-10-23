import { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { WhatsAppIcon } from '../../components/Icons';
import LocationAutocomplete from '../../components/common/LocationAutocomplete';

export default function AdminOrders() {
  const { orders = [], updateOrderStatus, updateOrderPaymentStatus, products = [], createManualOrder, lookupCustomer, addCustomer, customers = [] } = useStore();
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Last 7 Days');
  const [search, setSearch] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewOrder, setPreviewOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState('Comments');
  const [orderComments, setOrderComments] = useState({});
  const [newCommentText, setNewCommentText] = useState('');
  const [copiedTrack, setCopiedTrack] = useState(false);

  // ── New Order Form State Matching Blanxer Layout ──
  const initialForm = {
    phone: '',
    fullName: '',
    email: '',
    whatsapp: '',
    district: 'Kathmandu Inside Ring Road',
    address: '',
    landmark: '',
    altPhone: '',
    note: '',
    discount: 0,
    deliveryCharge: 150,
    paymentMethod: 'COD',
    paymentStatus: 'Unpaid',
    status: 'Pending',
    channel: 'WhatsApp',
    items: [],
  };

  const [formData, setFormData] = useState(initialForm);

  // ── Blanxer Create Order Modal State ──
  const [showCreateCustomerModal, setShowCreateCustomerModal] = useState(false);
  const [showForceCreateDialog, setShowForceCreateDialog] = useState(false);
  const [forceCreateInfo, setForceCreateInfo] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchPhone, setCustomerSearchPhone] = useState('');
  const [customerSearching, setCustomerSearching] = useState(false);
  const [newCustForm, setNewCustForm] = useState({
    name: '',
    phone: '',
    email: '',
    altPhone: '',
    district: 'Kathmandu Inside Ring Road',
    address: '',
    landmark: '',
  });

  // Product Picker state
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [pickerSelected, setPickerSelected] = useState({}); // { [productId]: { product, size, quantity } }

  // Discount & Offers
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' | 'percent'
  const [offersOpen, setOffersOpen] = useState(false);

  // ── Customer Lookup & Apply ──
  const applyCustomer = (c) => {
    setSelectedCustomer(c);
    setFormData(prev => ({
      ...prev,
      phone: c.phone || prev.phone,
      fullName: c.name || c.fullName || prev.fullName,
      email: c.email || prev.email,
      whatsapp: c.whatsapp || c.phone || prev.whatsapp,
      district: c.district || prev.district,
      address: c.address || prev.address,
      landmark: c.landmark || prev.landmark,
      altPhone: c.altPhone || prev.altPhone,
    }));
  };

  const handleSearchCustomer = async (phoneVal) => {
    const raw = (phoneVal !== undefined && phoneVal !== '') ? phoneVal : (customerSearchPhone || (typeof document !== 'undefined' && document.querySelector('input[placeholder*="phone"]')?.value) || '');
    const clean = (raw || '').replace(/\D/g, '');
    if (!clean || clean.length < 5) {
      alert('Please enter a valid phone number (at least 7-10 digits).');
      return;
    }
    setCustomerSearching(true);

    // 1. Check existing customers array first
    const foundLocal = (customers || []).find(c => (c.phone || '').replace(/\D/g, '') === clean);
    if (foundLocal) {
      applyCustomer(foundLocal);
      setCustomerSearching(false);
      return;
    }

    // 2. Also check if orders have this customer
    const foundInOrders = (orders || []).find(o => (o.customer?.phone || o.phone || '').replace(/\D/g, '') === clean);
    if (foundInOrders && foundInOrders.customer) {
      applyCustomer(foundInOrders.customer);
      setCustomerSearching(false);
      return;
    }

    // 3. Lookup via backend API
    try {
      if (lookupCustomer) {
        const res = await lookupCustomer(clean);
        if (res && res.exists && res.customer) {
          applyCustomer(res.customer);
          setCustomerSearching(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Customer lookup error:', err);
    }

    // 4. Not found -> Open Create Customer modal with pre-filled phone
    setCustomerSearching(false);
    setNewCustForm({
      name: '',
      phone: clean,
      email: '',
      altPhone: '',
      district: formData.district || 'Kathmandu Inside Ring Road',
      address: '',
      landmark: '',
    });
    setShowCreateCustomerModal(true);
  };

  const handleRemoveCustomer = () => {
    setSelectedCustomer(null);
    setCustomerSearchPhone('');
    setFormData(prev => ({
      ...prev,
      phone: '',
      fullName: '',
      email: '',
      whatsapp: '',
      address: '',
      landmark: '',
      altPhone: '',
    }));
  };

  const handleSaveNewCustomer = async (e) => {
    e?.preventDefault();
    const nameToSave = (newCustForm.name || (typeof document !== 'undefined' && document.querySelector('input[placeholder*="Aarav"]')?.value) || '').trim();
    const phoneToSave = (newCustForm.phone || (typeof document !== 'undefined' && document.querySelector('input[placeholder*="phone"]')?.value) || '').trim();
    if (!nameToSave || !phoneToSave) {
      alert('Full Name and Phone Number are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      let savedCust = {
        name: nameToSave,
        phone: phoneToSave,
        email: newCustForm.email.trim(),
        altPhone: newCustForm.altPhone.trim(),
        district: newCustForm.district || 'Kathmandu Inside Ring Road',
        address: newCustForm.address.trim(),
        landmark: newCustForm.landmark.trim(),
      };
      if (addCustomer) {
        const res = await addCustomer(savedCust);
        if (res) savedCust = res;
      }
      applyCustomer(savedCust);
      setShowCreateCustomerModal(false);
    } catch (err) {
      console.error('Failed to create customer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Product Picker & Inventory Selection ──
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return (products || []).filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.id || '').toLowerCase().includes(q) ||
      (p.fabricType || '').toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const togglePickerItem = (product) => {
    setPickerSelected(prev => {
      const copy = { ...prev };
      if (copy[product.id]) {
        delete copy[product.id];
      } else {
        const firstSize = (product.sizes && Object.keys(product.sizes)[0]) || 'M';
        copy[product.id] = {
          product,
          size: firstSize,
          quantity: 1,
        };
      }
      return copy;
    });
  };

  const updatePickerSize = (productId, size) => {
    setPickerSelected(prev => {
      if (!prev[productId]) return prev;
      return {
        ...prev,
        [productId]: { ...prev[productId], size }
      };
    });
  };

  const handleConfirmProductPicker = () => {
    const selectedList = Object.values(pickerSelected);
    if (selectedList.length === 0) {
      setProductPickerOpen(false);
      return;
    }
    const newItems = selectedList.map(item => {
      const p = item.product;
      return {
        productId: p.id,
        name: p.name,
        size: item.size || 'M',
        quantity: item.quantity || 1,
        price: p.price || 0,
        image: p.image || '/images/kurtha-charcoal.jpg',
        discount: 0,
        discountType: 'fixed',
      };
    });
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, ...newItems]
    }));
    setPickerSelected({});
    setProductPickerOpen(false);
  };

  const handleItemQtyChange = (index, delta) => {
    setFormData(prev => {
      const updated = [...prev.items];
      const cur = updated[index];
      if (cur) {
        const newQty = Math.max(1, (cur.quantity || 1) + delta);
        updated[index] = { ...cur, quantity: newQty };
      }
      return { ...prev, items: updated };
    });
  };

  const handleItemDiscountChange = (index, val) => {
    setFormData(prev => {
      const updated = [...prev.items];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          discount: Math.max(0, parseFloat(val) || 0)
        };
      }
      return { ...prev, items: updated };
    });
  };

  const handleItemDiscountTypeToggle = (index) => {
    setFormData(prev => {
      const updated = [...prev.items];
      if (updated[index]) {
        const nextType = updated[index].discountType === 'percent' ? 'fixed' : 'percent';
        updated[index] = {
          ...updated[index],
          discountType: nextType
        };
      }
      return { ...prev, items: updated };
    });
  };

  const removeItemRow = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleAddCustomItem = () => {
    const customName = prompt('Enter custom outfit / garment name:');
    if (!customName || !customName.trim()) return;
    const priceStr = prompt('Enter unit price (in Rs.):', '2999');
    const priceNum = parseInt(priceStr, 10) || 0;
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: '',
          name: customName.trim(),
          size: 'Custom',
          quantity: 1,
          price: priceNum,
          image: '/images/kurtha-charcoal.jpg',
          discount: 0,
          discountType: 'fixed',
        }
      ]
    }));
  };

  // ── Calculation of Totals ──
  const calculatedItemsTotal = useMemo(() => {
    return (formData.items || []).reduce((sum, item) => {
      const rawPrice = (Number(item.price) || 0) * (Number(item.quantity) || 1);
      let disc = 0;
      if (item.discountType === 'percent') {
        disc = rawPrice * ((Number(item.discount) || 0) / 100);
      } else {
        disc = Number(item.discount) || 0;
      }
      return sum + Math.max(0, rawPrice - disc);
    }, 0);
  }, [formData.items]);

  const discountVal = Math.max(0, parseFloat(formData.discount) || 0);
  const orderDiscountAmount = discountType === 'percent'
    ? calculatedItemsTotal * (discountVal / 100)
    : discountVal;

  const deliveryChargeVal = Math.max(0, parseFloat(formData.deliveryCharge) || 0);
  const grandTotal = Math.max(0, calculatedItemsTotal - orderDiscountAmount) + deliveryChargeVal;

  // ── Duplicate Order Guard & Submission ──
  const handleInitiateOrder = (e) => {
    e?.preventDefault();
    const orderPhone = (formData.phone || selectedCustomer?.phone || (typeof document !== 'undefined' && document.querySelector('input[placeholder*="phone"]')?.value) || '').trim();
    const orderName = (formData.fullName || selectedCustomer?.name || selectedCustomer?.fullName || (typeof document !== 'undefined' && document.querySelector('input[placeholder*="Aarav"]')?.value) || '').trim();
    const orderAddr = (formData.address || (typeof document !== 'undefined' && document.querySelector('input[placeholder*="Baluwatar"]')?.value) || '').trim();
    if (!orderName || !orderPhone) {
      alert('Please provide customer name and phone number.');
      return;
    }
    if ((formData.items || []).length === 0) {
      alert('Please add at least one product or custom item to the order.');
      return;
    }

    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    const prevOrders = (orders || []).filter(o => {
      const p = (o.customer?.phone || o.phone || '').replace(/\D/g, '');
      return p && p === cleanPhone;
    });

    if (prevOrders.length > 0) {
      const sorted = [...prevOrders].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      const last = sorted[0];
      const diffMs = Date.now() - new Date(last.createdAt || Date.now()).getTime();
      const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      setForceCreateInfo({
        phone: formData.phone,
        count: prevOrders.length,
        lastOrder: last,
        daysAgo: diffDays,
      });
      setShowForceCreateDialog(true);
      return;
    }

    executeCreateOrder();
  };

  const executeCreateOrder = async () => {
    setIsSubmitting(true);
    try {
      await createManualOrder({
        customer: {
          fullName: orderName,
          phone: orderPhone,
          email: (formData.email || '').trim(),
          whatsapp: (formData.whatsapp || formData.phone || '').trim(),
          district: formData.district,
          city: formData.district,
          address: orderAddr,
          landmark: (formData.landmark || '').trim(),
          altPhone: (formData.altPhone || '').trim(),
          note: (formData.note || '').trim(),
          paymentMethod: formData.paymentMethod,
        },
        items: formData.items,
        total: grandTotal,
        discountAmount: orderDiscountAmount,
        deliveryCharge: deliveryChargeVal,
        status: formData.status || 'Pending',
        paymentStatus: formData.paymentStatus || (formData.paymentMethod === 'COD' ? 'Unpaid' : 'Full Paid'),
        channel: formData.channel || 'WhatsApp',
      });

      setIsSubmitting(false);
      setShowCreateModal(false);
      setShowForceCreateDialog(false);
      setForceCreateInfo(null);
      setFormData(initialForm);
      setSelectedCustomer(null);
      setCustomerSearchPhone('');
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
    }
  };

  // Date filter helper
  const now = new Date();
  const filterByDate = (orderDate) => {
    if (dateFilter === 'All Time') return true;
    if (!orderDate) return true;
    const od = new Date(orderDate);
    const diffDays = (now - od) / (1000 * 60 * 60 * 24);
    if (dateFilter === 'Last 7 Days') return diffDays <= 7;
    if (dateFilter === 'Last 30 Days') return diffDays <= 30;
    if (dateFilter === 'This Month') return od.getMonth() === now.getMonth() && od.getFullYear() === now.getFullYear();
    return true;
  };

  // Strictly sorted newest first (Every new order on top)
  const filteredOrders = [...orders]
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .filter(o => {
      // Status tab filter
      if (statusFilter !== 'All') {
        const orderSt = (o.status || '').toLowerCase();
        const tabSt = statusFilter.toLowerCase();
        if (tabSt === 'dispatched' && (orderSt === 'dispatched' || orderSt === 'shipped')) {
          // match
        } else if (orderSt !== tabSt) {
          return false;
        }
      }
      // Date filter
      if (!filterByDate(o.createdAt)) return false;
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchId = (o.id || '').toLowerCase().includes(q);
        const matchName = (o.customer?.fullName || '').toLowerCase().includes(q);
        const matchPhone = (o.customer?.phone || '').includes(q);
        const matchEmail = (o.customer?.email || '').toLowerCase().includes(q);
        const matchDistrict = (o.customer?.district || '').toLowerCase().includes(q);
        return matchId || matchName || matchPhone || matchEmail || matchDistrict;
      }
      return true;
    });

  const getWaMessageLink = (order) => {
    const text = encodeURIComponent(
      `Namaste ${order.customer?.fullName}! This is LoveKod reaching out regarding your order (${order.id}). We are processing your delivery for ${order.customer?.district}!`
    );
    const phone = order.customer?.whatsapp || order.customer?.phone;
    return `https://wa.me/977${phone?.replace(/^0+/, '').replace(/^\+?977/, '')}?text=${text}`;
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleAddComment = (orderId) => {
    if (!newCommentText.trim()) return;
    const existing = orderComments[orderId] || [];
    const newEntry = {
      text: newCommentText.trim(),
      author: 'LoveKod Admin',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    setOrderComments(prev => ({
      ...prev,
      [orderId]: [...existing, newEntry]
    }));
    setNewCommentText('');
  };

  const statusTabs = ['All', 'Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled', 'Returned'];

  return (
    <div style={{ color: '#1e293b' }}>
      {/* ══ 1. TOP HEADER & ACTION BAR ══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Orders
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: '#64748b' }}>
            Manage boutique client orders, status fulfillment, and live customer communications.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="admin-btn"
            style={{
              background: '#8b5cf6',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(139,92,246,0.3)',
            }}
          >
            <span>✨</span>
            <span>Do with AI</span>
            <span style={{ fontSize: '0.75rem' }}>▼</span>
          </button>

          <button
            onClick={() => {
              setFormData(initialForm);
              setSelectedCustomer(null);
              setCustomerSearchPhone("");
              setShowCreateModal(true);
            }}
            className="admin-btn"
            style={{
              background: '#7c3aed',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 18px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(124,58,237,0.35)',
            }}
          >
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
            <span>New order</span>
          </button>
        </div>
      </div>

      {/* ══ 2. SEARCH & FILTER CONTROLS ══ */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '420px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem' }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Name, phone, order # or email"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '9px 12px 9px 36px',
                fontSize: '0.88rem',
                color: '#1e293b',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Date Range Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '6px 12px' }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>📅</span>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="This Month">This Month</option>
                <option value="All Time">All Time</option>
              </select>
            </div>

            {/* Filter Funnel Button */}
            <button
              type="button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              <span>⚙️</span>
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* ══ Status Tabs (All, Pending, Processing, Dispatched, Delivered, Cancelled, Returned) ══ */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {statusTabs.map(tab => {
            const isActive = statusFilter === tab;
            const count = tab === 'All'
              ? orders.length
              : orders.filter(o => {
                  const s = (o.status || '').toLowerCase();
                  const t = tab.toLowerCase();
                  if (t === 'dispatched') return s === 'dispatched' || s === 'shipped';
                  return s === t;
                }).length;

            return (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#7c3aed' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  border: isActive ? 'none' : '1px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{tab}</span>
                <span style={{
                  fontSize: '0.74rem',
                  opacity: isActive ? 0.9 : 0.65,
                  background: isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: isActive ? '#ffffff' : '#475569',
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ 3. ORDERS TABLE MATCHING BLANXER ══ */}
      {filteredOrders.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📦</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>No orders found</h3>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>Try clearing filters or search to view boutique client orders.</p>
        </div>
      ) : (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '12px 14px', width: '36px' }}>
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>#</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Customer Name</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Items</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Total Amount</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Due Amount</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Labels</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Payment Method</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Order / Payment Status</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Created</th>
                  <th style={{ padding: '12px 14px', fontWeight: 700 }}>Updated</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const itemCount = (order.items || []).reduce((acc, it) => acc + (it.quantity || 1), 0);
                  const isPaid = order.paymentStatus === 'Paid';
                  const dueAmount = isPaid ? 0 : order.total;
                  const isSelected = selectedOrderIds.includes(order.id);

                  // Badges styling
                  const statusColors = {
                    Pending: { bg: '#fef3c7', text: '#d97706', border: '#fde68a' },
                    Processing: { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' },
                    Dispatched: { bg: '#ccfbf1', text: '#0f766e', border: '#99f6e4' },
                    Shipped: { bg: '#ccfbf1', text: '#0f766e', border: '#99f6e4' },
                    Delivered: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
                    Cancelled: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
                    Returned: { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' },
                  };
                  const currentSt = statusColors[order.status] || statusColors.Pending;

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setPreviewOrder(order)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: isSelected ? '#f5f3ff' : '#ffffff',
                        transition: 'background 0.12s ease'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#ffffff'; }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* Order ID */}
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#7c3aed', fontFamily: 'monospace' }}>
                        {order.id?.replace(/^ORD-/, '#') || `#${order.id}`}
                      </td>

                      {/* Customer Name + Phone */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {order.customer?.fullName || 'Walk-in Customer'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                          {order.customer?.phone || '-'}
                        </div>
                      </td>

                      {/* Item Count */}
                      <td style={{ padding: '12px 14px', color: '#334155', fontWeight: 600 }}>
                        {itemCount}
                      </td>

                      {/* Total Amount */}
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                        Rs {Number(order.total || 0).toLocaleString()}
                      </td>

                      {/* Due Amount */}
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: dueAmount > 0 ? '#b45309' : '#15803d' }}>
                        Rs {Number(dueAmount).toLocaleString()}
                      </td>

                      {/* Channel Label Badge */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          background: order.channel === 'WhatsApp' ? '#ecfdf5' : order.channel === 'Instagram' ? '#fdf2f8' : '#eff6ff',
                          color: order.channel === 'WhatsApp' ? '#059669' : order.channel === 'Instagram' ? '#db2777' : '#2563eb',
                          border: `1px solid ${order.channel === 'WhatsApp' ? '#a7f3d0' : order.channel === 'Instagram' ? '#fbcfe8' : '#bfdbfe'}`,
                        }}>
                          {order.channel || 'Website'}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td style={{ padding: '12px 14px', color: '#475569', fontWeight: 600 }}>
                        {order.customer?.paymentMethod || 'COD'}
                      </td>

                      {/* Status + Payment Badges */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: currentSt.bg,
                            color: currentSt.text,
                            border: `1px solid ${currentSt.border}`,
                          }}>
                            {order.status || 'Pending'}
                          </span>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: isPaid ? '#dcfce7' : '#fef3c7',
                            color: isPaid ? '#15803d' : '#b45309',
                            border: `1px solid ${isPaid ? '#bbf7d0' : '#fde68a'}`,
                          }}>
                            {isPaid ? 'PAID' : 'UNPAID'}
                          </span>
                        </div>
                      </td>

                      {/* Created */}
                      <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Updated */}
                      <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                          {new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 14px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <a
                            href={getWaMessageLink(order)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            style={{
                              padding: '5px 7px',
                              borderRadius: '6px',
                              background: '#25D366',
                              color: '#fff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textDecoration: 'none'
                            }}
                          >
                            <WhatsAppIcon size={14} />
                          </a>
                          <button
                            type="button"
                            onClick={() => setPreviewOrder(order)}
                            title="View Preview Details"
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              color: '#334155'
                            }}
                          >
                            •••
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#64748b' }}>
            <div>
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button disabled style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'not-allowed', color: '#94a3b8' }}>
                ‹
              </button>
              <button style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#7c3aed', color: '#ffffff', fontWeight: 700 }}>
                1
              </button>
              <button disabled style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'not-allowed', color: '#94a3b8' }}>
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ 4. ORDER DETAIL / PREVIEW MODAL (MATCHES BLANXER REF #1018) ══ */}
      {previewOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '960px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              background: '#ffffff'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'monospace' }}>
                    {previewOrder.id?.replace(/^ORD-/, '#') || `#${previewOrder.id}`}
                  </h2>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'flex', gap: '16px' }}>
                  <span>Created: <strong>{new Date(previewOrder.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {new Date(previewOrder.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  <span>Modified: <strong>{new Date(previewOrder.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {new Date(previewOrder.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </div>
              </div>

              {/* Action Icons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  title="Print Invoice"
                  style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '7px 10px', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  🖨️
                </button>
                <a
                  href={getWaMessageLink(previewOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Message on WhatsApp"
                  style={{ background: '#25D366', color: '#fff', borderRadius: '8px', padding: '7px 10px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                >
                  <WhatsAppIcon size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewOrder(null)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.1rem', color: '#64748b' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Tracking URL */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <span style={{ fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Tracking URL:</span>
                  <span style={{ color: '#7c3aed', textDecoration: 'underline', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    https://lovekod.com/track/{previewOrder.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://lovekod.com/track/${previewOrder.id}`);
                    setCopiedTrack(true);
                    setTimeout(() => setCopiedTrack(false), 2000);
                  }}
                  style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '4px 10px', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 600, color: '#334155' }}
                >
                  {copiedTrack ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* Order Status & Payment Dropdowns */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                padding: '16px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                      Order status
                    </label>
                    <select
                      value={previewOrder.status || 'Pending'}
                      onChange={e => {
                        const nextSt = e.target.value;
                        updateOrderStatus(previewOrder.id, nextSt);
                        setPreviewOrder(prev => ({ ...prev, status: nextSt }));
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #7c3aed',
                        color: '#7c3aed',
                        fontWeight: 700,
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Returned">Returned</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                      Payment status
                    </label>
                    <select
                      value={previewOrder.paymentStatus || 'Unpaid'}
                      onChange={e => {
                        const nextPs = e.target.value;
                        updateOrderPaymentStatus(previewOrder.id, nextPs);
                        setPreviewOrder(prev => ({ ...prev, paymentStatus: nextPs }));
                      }}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: previewOrder.paymentStatus === 'Paid' ? '#15803d' : '#b45309',
                        fontWeight: 700,
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                      Payment Method
                    </div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                      {previewOrder.customer?.paymentMethod || 'COD'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                      Created By
                    </div>
                    <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.88rem' }}>
                      LoveKod Store
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert(`Exchange / Return workflow initiated for ${previewOrder.id}`)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #8b5cf6',
                    background: '#ffffff',
                    color: '#7c3aed',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  ↺ Return / Exchange
                </button>
              </div>

              {/* Two-Column Grid: Left: ORDER SUMMARY | Right: CUSTOMER DETAILS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
                {/* Left Card: ORDER SUMMARY */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '14px' }}>
                    Order Summary
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>
                    Cart Items
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    {(previewOrder.items || []).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ position: 'relative' }}>
                            <img
                              src={item.image || '/images/kurtha-charcoal.jpg'}
                              alt={item.name}
                              style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px' }}
                            />
                            <span style={{
                              position: 'absolute',
                              top: '-6px',
                              right: '-6px',
                              background: '#7c3aed',
                              color: '#fff',
                              borderRadius: '50%',
                              width: '18px',
                              height: '18px',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {item.quantity || 1}
                            </span>
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>{item.name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Variant: {item.size || 'M'}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            Rs {Number(item.price || 0).toLocaleString()} x {item.quantity || 1}
                          </div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                            Rs {Number((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Calculations */}
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.84rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Sub-total</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Rs {Number(previewOrder.total || 0) - (previewOrder.deliveryCharge || 150) + (previewOrder.discountAmount || 0)}</span>
                    </div>
                    {previewOrder.discountAmount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                        <span>Discount</span>
                        <span>(Rs {Number(previewOrder.discountAmount).toLocaleString()})</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Delivery Charge</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>Rs {previewOrder.deliveryCharge || 150}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '4px' }}>
                      <span>Total</span>
                      <span style={{ color: '#7c3aed' }}>Rs {Number(previewOrder.total || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Bottom Tabs: Comments, Activity, Stock Movements */}
                  <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                      {['Comments', 'Activity', 'Stock Movements'].map(tab => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActivePreviewTab(tab)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            background: activePreviewTab === tab ? '#7c3aed' : '#ffffff',
                            color: activePreviewTab === tab ? '#ffffff' : '#64748b',
                            border: '1px solid',
                            borderColor: activePreviewTab === tab ? '#7c3aed' : '#e2e8f0',
                            cursor: 'pointer'
                          }}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {activePreviewTab === 'Comments' && (
                      <div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px', maxHeight: '120px', overflowY: 'auto' }}>
                          {(orderComments[previewOrder.id] || []).length === 0 ? (
                            <div style={{ fontSize: '0.76rem', color: '#94a3b8', fontStyle: 'italic' }}>No comments recorded yet.</div>
                          ) : (
                            (orderComments[previewOrder.id] || []).map((c, i) => (
                              <div key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '6px 10px', fontSize: '0.78rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.7rem' }}>
                                  <strong>{c.author}</strong>
                                  <span>{c.date} {c.time}</span>
                                </div>
                                <div style={{ color: '#1e293b', marginTop: '2px' }}>{c.text}</div>
                              </div>
                            ))
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="Write comment here..."
                            value={newCommentText}
                            onChange={e => setNewCommentText(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddComment(previewOrder.id); }}
                            style={{
                              flex: 1,
                              background: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '0.8rem',
                              outline: 'none'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(previewOrder.id)}
                            style={{
                              background: '#7c3aed',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}

                    {activePreviewTab === 'Activity' && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div>• Order created from <strong>{previewOrder.channel || 'Website'}</strong></div>
                        <div>• Customer verified with phone <strong>{previewOrder.customer?.phone}</strong></div>
                        <div>• Initial status set to <strong>{previewOrder.status}</strong></div>
                      </div>
                    )}

                    {activePreviewTab === 'Stock Movements' && (
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        • Reserved {previewOrder.items?.length || 1} units from warehouse stock.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Card: CUSTOMER DETAILS */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                      Customer Details
                    </div>
                    <button
                      type="button"
                      onClick={() => alert(`Customer contact: ${previewOrder.customer?.phone}`)}
                      style={{ background: 'none', border: 'none', color: '#7c3aed', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}
                    >
                      ✏️ Edit
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: '10px', fontSize: '0.84rem' }}>
                    <div style={{ color: '#64748b', fontWeight: 600 }}>Name:</div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{previewOrder.customer?.fullName || '-'}</div>

                    <div style={{ color: '#64748b', fontWeight: 600 }}>Email:</div>
                    <div style={{ color: '#334155' }}>{previewOrder.customer?.email || '-'}</div>

                    <div style={{ color: '#64748b', fontWeight: 600 }}>Phone Number:</div>
                    <div style={{ fontWeight: 700, color: '#7c3aed', fontFamily: 'monospace' }}>
                      {previewOrder.customer?.phone || '-'}
                    </div>

                    <div style={{ color: '#64748b', fontWeight: 600 }}>Alt Phone Number:</div>
                    <div style={{ color: '#334155' }}>{previewOrder.customer?.altPhone || '-'}</div>

                    <div style={{ color: '#64748b', fontWeight: 600 }}>Province:</div>
                    <div style={{ color: '#334155' }}>Bagmati Province</div>

                    <div style={{ color: '#64748b', fontWeight: 600 }}>City:</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{previewOrder.customer?.district || 'Kathmandu Inside Ring Road'}</div>

                    <div style={{ color: '#64748b', fontWeight: 600 }}>Address:</div>
                    <div style={{ color: '#334155' }}>{previewOrder.customer?.address || 'Divya Marg'}</div>

                    <div style={{ color: '#64748b', fontWeight: 600 }}>Landmark:</div>
                    <div style={{ color: '#334155' }}>{previewOrder.customer?.landmark || '-'}</div>

                    <div style={{ color: '#64748b', fontWeight: 600 }}>Order Note:</div>
                    <div style={{ color: '#334155', fontStyle: 'italic' }}>{previewOrder.customer?.note || 'Fast delivery'}</div>
                  </div>

                  <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                    <a
                      href={getWaMessageLink(previewOrder)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '10px',
                        background: '#25D366',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        borderRadius: '8px',
                        textDecoration: 'none'
                      }}
                    >
                      <WhatsAppIcon size={16} />
                      <span>Chat on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ 5. COMPACT BLANXER-STYLE CREATE ORDER MODAL ══ */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '760px',
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 22px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#ffffff'
            }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>+</span> Create Order
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Auto-increments sequential ID (#1001, #1002...) • Blanxer Workflow
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '1rem',
                  fontWeight: 700,
                  transition: 'background 0.15s'
                }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleInitiateOrder} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{
                padding: '20px 22px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                maxHeight: 'calc(94vh - 140px)'
              }}>

                {/* ── 1. CUSTOMER SECTION ── */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Customer Information
                    </span>
                    {selectedCustomer && (
                      <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                        ✓ Customer Linked
                      </span>
                    )}
                  </div>

                  {!selectedCustomer ? (
                    <div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            type="tel"
                            placeholder="Search or enter customer phone number (e.g. 9812345678)..."
                            value={customerSearchPhone}
                            onChange={e => setCustomerSearchPhone(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearchCustomer();
                              }
                            }}
                            style={{
                              width: '100%',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1.5px solid #cbd5e1',
                              fontSize: '0.88rem',
                              outline: 'none',
                              color: '#0f172a',
                              background: '#ffffff'
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSearchCustomer()}
                          disabled={customerSearching}
                          style={{
                            background: '#7c3aed',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 18px',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: customerSearching ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {customerSearching ? 'Searching...' : '🔍 Search Customer'}
                        </button>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '0.74rem', color: '#64748b' }}>
                        Press &quot;Search Customer&quot; to auto-fill details, or automatically launch Create Customer if not found.
                      </p>
                    </div>
                  ) : (
                    /* Selected Customer Card (aatankari_img_1.png match) */
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#ffffff',
                      border: '1.5px solid #e0e7ff',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      boxShadow: '0 2px 4px rgba(99, 102, 241, 0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1rem',
                          flexShrink: 0
                        }}>
                          {(selectedCustomer.name || selectedCustomer.fullName || 'C').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.94rem' }}>
                              {selectedCustomer.name || selectedCustomer.fullName}
                            </span>
                            <span style={{
                              background: '#f3e8ff',
                              color: '#7c3aed',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '4px'
                            }}>
                              NEW
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '12px', marginTop: '2px', fontSize: '0.8rem', color: '#64748b' }}>
                            <span>📞 {selectedCustomer.phone}</span>
                            {selectedCustomer.email && <span>✉️ {selectedCustomer.email}</span>}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveCustomer}
                        title="Remove selected customer"
                        style={{
                          background: '#fee2e2',
                          color: '#ef4444',
                          border: '1px solid #fecdd3',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ✕ Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* ── 2. PRODUCTS SECTION & DYNAMIC PICKER ── */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Products ({formData.items.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setProductPickerOpen(true)}
                        style={{
                          background: '#7c3aed',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 14px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        + Add Products
                      </button>
                      <button
                        type="button"
                        onClick={handleAddCustomItem}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#475569',
                          cursor: 'pointer'
                        }}
                      >
                        + Custom Item
                      </button>
                    </div>
                  </div>

                  {/* Empty state or Product List */}
                  {formData.items.length === 0 ? (
                    <div
                      onClick={() => setProductPickerOpen(true)}
                      style={{
                        padding: '24px',
                        textAlign: 'center',
                        color: '#64748b',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '10px',
                        background: '#ffffff',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🛍️</div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1e293b' }}>
                        No items added yet
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                        Click here or &quot;+ Add Products&quot; to browse inventory and variants.
                      </div>
                    </div>
                  ) : (
                    /* Selected Products List (aatankari_product_picker.png match) */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {formData.items.map((item, idx) => {
                        const rawPrice = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                        const disc = item.discountType === 'percent'
                          ? rawPrice * ((Number(item.discount) || 0) / 100)
                          : (Number(item.discount) || 0);
                        const lineTotal = Math.max(0, rawPrice - disc);

                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              gap: '12px'
                            }}
                          >
                            {/* Product Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                              <img
                                src={item.image || '/images/kurtha-charcoal.jpg'}
                                alt=""
                                style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                              />
                              <div>
                                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a' }}>
                                  {item.name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                  <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                    Size: {item.size || 'M'}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                    Rs {Number(item.price).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quantity Stepper (+ purple, - pink) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(idx, -1)}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: '#ffe4e6',
                                  color: '#e11d48',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.9rem'
                                }}
                              >
                                -
                              </button>
                              <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleItemQtyChange(idx, 1)}
                                style={{
                                  width: '26px',
                                  height: '26px',
                                  borderRadius: '4px',
                                  border: 'none',
                                  background: '#ede9fe',
                                  color: '#7c3aed',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.9rem'
                                }}
                              >
                                +
                              </button>
                            </div>

                            {/* Item Discount (Toggle Rs / %) */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                value={item.discount || ''}
                                onChange={e => handleItemDiscountChange(idx, e.target.value)}
                                style={{
                                  width: '54px',
                                  padding: '4px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '0.78rem',
                                  textAlign: 'right'
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleItemDiscountTypeToggle(idx)}
                                title="Toggle Rs or %"
                                style={{
                                  background: item.discountType === 'percent' ? '#7c3aed' : '#e2e8f0',
                                  color: item.discountType === 'percent' ? '#ffffff' : '#475569',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '4px 6px',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                {item.discountType === 'percent' ? '%' : 'Rs'}
                              </button>
                            </div>

                            {/* Line Total */}
                            <div style={{ minWidth: '85px', textAlign: 'right' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                                Rs {lineTotal.toLocaleString()}
                              </span>
                            </div>

                            {/* Delete row */}
                            <button
                              type="button"
                              onClick={() => removeItemRow(idx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                padding: '4px 6px'
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}

                      {/* Items Subtotal Bar */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: '#f1f5f9',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#334155'
                      }}>
                        <span>Total Items: {formData.items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)}</span>
                        <span>Items Subtotal: Rs {calculatedItemsTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── 3. OFFERS & DISCOUNTS ACCORDION ── */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '14px 16px'
                }}>
                  <div
                    onClick={() => setOffersOpen(!offersOpen)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1e293b' }}>
                      🏷️ Order Discount & Delivery Charge
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {offersOpen ? '▲ Hide' : '▼ Show'}
                    </span>
                  </div>

                  {offersOpen && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          Overall Order Discount
                        </label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={formData.discount || ''}
                            onChange={e => setFormData({ ...formData, discount: e.target.value })}
                            style={{
                              flex: 1,
                              padding: '8px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.84rem'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setDiscountType(discountType === 'fixed' ? 'percent' : 'fixed')}
                            style={{
                              background: discountType === 'percent' ? '#7c3aed' : '#e2e8f0',
                              color: discountType === 'percent' ? '#ffffff' : '#475569',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 12px',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer'
                            }}
                          >
                            {discountType === 'percent' ? '%' : 'Rs'}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                          Delivery Charge (Rs.)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.deliveryCharge}
                          onChange={e => setFormData({ ...formData, deliveryCharge: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.84rem'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── 4. DELIVERY DETAILS & ORDER GRID ── */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                    Delivery & Destination
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        City / District *
                      </label>
                      <select
                        value={formData.district}
                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem',
                          background: '#ffffff'
                        }}
                      >
                        <option value="Kathmandu Inside Ring Road">Kathmandu Inside Ring Road</option>
                        <option value="Kathmandu Outside Ring Road">Kathmandu Outside Ring Road</option>
                        <option value="Lalitpur">Lalitpur</option>
                        <option value="Bhaktapur">Bhaktapur</option>
                        <option value="Pokhara">Pokhara</option>
                        <option value="Chitwan">Chitwan</option>
                        <option value="Butwal / Bhairahawa">Butwal / Bhairahawa</option>
                        <option value="Biratnagar / Dharan">Biratnagar / Dharan</option>
                        <option value="Nepalgunj">Nepalgunj</option>
                        <option value="Outside Valley (Courier)">Outside Valley (Courier)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Specific Address *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ward 4, Baluwatar near embassy"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem',
                          background: '#ffffff'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Opposite Bhatbhateni supermarket"
                        value={formData.landmark}
                        onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem',
                          background: '#ffffff'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Alternative Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="Optional backup contact number"
                        value={formData.altPhone}
                        onChange={e => setFormData({ ...formData, altPhone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem',
                          background: '#ffffff'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Order Note / Special Requests
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Call before delivery, gift wrap..."
                      value={formData.note}
                      onChange={e => setFormData({ ...formData, note: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem',
                        background: '#ffffff'
                      }}
                    />
                  </div>
                </div>

                {/* ── 5. PAYMENT STATUS & SETTINGS (aatankari_latest_img_1.png match) ── */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
                    Payment & Status
                  </span>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Payment Status
                      </label>
                      <select
                        value={formData.paymentStatus || 'Unpaid'}
                        onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          background: '#ffffff',
                          color: formData.paymentStatus === 'Full Paid' ? '#16a34a' : (formData.paymentStatus === 'Partial Paid' ? '#2563eb' : '#d97706')
                        }}
                      >
                        <option value="Unpaid">Unpaid</option>
                        <option value="Full Paid">Full Paid</option>
                        <option value="Partial Paid">Partial Paid</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Payment Method
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem',
                          background: '#ffffff'
                        }}
                      >
                        <option value="COD">Cash on Delivery (COD)</option>
                        <option value="eSewa">eSewa Mobile Wallet</option>
                        <option value="Khalti">Khalti Wallet</option>
                        <option value="Bank Transfer">Bank Transfer / QR</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Order Channel
                      </label>
                      <select
                        value={formData.channel}
                        onChange={e => setFormData({ ...formData, channel: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem',
                          background: '#ffffff'
                        }}
                      >
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Instagram">Instagram DM</option>
                        <option value="Web">Website Checkout</option>
                        <option value="Phone Call">Phone Call</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer with Grand Total & Actions */}
              <div style={{
                padding: '14px 22px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc'
              }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    Items: Rs {calculatedItemsTotal.toLocaleString()} • Disc: -Rs {orderDiscountAmount.toLocaleString()} • Delivery: +Rs {deliveryChargeVal.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    Total: Rs {grandTotal.toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 18px',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: '#7c3aed',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 24px',
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3)'
                    }}
                  >
                    {isSubmitting ? 'Creating Order...' : 'Create Order'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ 6. CREATE CUSTOMER SUB-MODAL (aatankari_img_0.png match) ══ */}
      {showCreateCustomerModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Create Customer
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateCustomerModal(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Pink Notice Alert */}
            <div style={{
              margin: '16px 20px 0',
              padding: '12px 14px',
              background: '#ffe4e6',
              border: '1px solid #fecdd3',
              borderRadius: '8px',
              color: '#9f1239',
              fontSize: '0.82rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>ℹ️</span>
              <span>Customer with provided number not found. Please create a customer to continue.</span>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveNewCustomer} style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newCustForm.phone}
                    onChange={e => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Aarav Sharma"
                    value={newCustForm.name}
                    onChange={e => setNewCustForm({ ...newCustForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1.5px solid #cbd5e1',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="customer@example.com"
                    value={newCustForm.email}
                    onChange={e => setNewCustForm({ ...newCustForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Alternative Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Optional backup phone"
                    value={newCustForm.altPhone}
                    onChange={e => setNewCustForm({ ...newCustForm, altPhone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateCustomerModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ 7. DUPLICATE ORDER WARNING / FORCE CREATE (aatankari_latest_response.png match) ══ */}
      {showForceCreateDialog && forceCreateInfo && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.82)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            border: '1.5px solid #f59e0b',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #fef3c7', background: '#fffbeb', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>⚠️</span>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#92400e', margin: 0 }}>
                  Warning! Order already exists
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#b45309' }}>
                  Found {forceCreateInfo.count} orders for this phone number, force create a new order?
                </p>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 14px',
                fontSize: '0.84rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Phone Number:</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{forceCreateInfo.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Last Added:</span>
                  <span style={{ fontWeight: 700, color: '#7c3aed' }}>
                    {forceCreateInfo.daysAgo === 0 ? 'Today' : `${forceCreateInfo.daysAgo} days ago`} ({forceCreateInfo.lastOrder?.id || ''})
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowForceCreateDialog(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executeCreateOrder()}
                  style={{
                    background: '#d97706',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(217, 119, 6, 0.3)'
                  }}
                >
                  Force Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ 8. DYNAMIC PRODUCT PICKER MODAL (chat_blob_1.png match) ══ */}
      {productPickerOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.78)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1150,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '860px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 22px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Select Products from Catalog
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Pick outfits and variants to add directly into the order
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProductPickerOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            {/* Live Search Bar */}
            <div style={{ padding: '12px 22px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="🔍 Search product name, SKU, or fabric type..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    background: '#ffffff'
                  }}
                />
              </div>
            </div>

            {/* Products Table */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '8px', width: '36px' }}></th>
                    <th style={{ padding: '8px' }}>Product</th>
                    <th style={{ padding: '8px' }}>Variant / Size</th>
                    <th style={{ padding: '8px' }}>SKU</th>
                    <th style={{ padding: '8px' }}>Stock</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const isChecked = !!pickerSelected[p.id];
                    const selectedSize = pickerSelected[p.id]?.size || (p.sizes && Object.keys(p.sizes)[0]) || 'M';
                    const availableSizes = p.sizes ? Object.keys(p.sizes) : ['S', 'M', 'L', 'XL', 'XXL'];
                    const totalStock = p.sizes ? Object.values(p.sizes).reduce((a, b) => a + b, 0) : 15;

                    return (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: isChecked ? '#f5f3ff' : 'transparent',
                          transition: 'background 0.15s'
                        }}
                      >
                        <td style={{ padding: '10px 8px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePickerItem(p)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#7c3aed' }}
                          />
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img
                              src={p.image || '/images/kurtha-charcoal.jpg'}
                              alt=""
                              style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{p.fabricType || 'Kurtha Set'}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <select
                            value={selectedSize}
                            disabled={!isChecked}
                            onChange={e => updatePickerSize(p.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.8rem',
                              background: '#ffffff',
                              cursor: isChecked ? 'pointer' : 'not-allowed'
                            }}
                          >
                            {availableSizes.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding: '10px 8px', fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {p.id}
                        </td>
                        <td style={{ padding: '10px 8px' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: totalStock > 0 ? '#dcfce7' : '#fee2e2',
                            color: totalStock > 0 ? '#16a34a' : '#ef4444'
                          }}>
                            {totalStock > 0 ? `✓ ${totalStock} in stock` : 'Out of stock'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>
                          Rs {Number(p.price).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 22px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <span style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600 }}>
                Selected {Object.keys(pickerSelected).length} product(s)
              </span>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setProductPickerOpen(false)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmProductPicker}
                  style={{
                    background: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  Confirm Select {Object.keys(pickerSelected).length > 0 ? `(${Object.keys(pickerSelected).length})` : ''} Products
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
