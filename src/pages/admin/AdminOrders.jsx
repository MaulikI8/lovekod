import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { WhatsAppIcon } from '../../components/Icons';
import LocationAutocomplete from '../../components/common/LocationAutocomplete';

export default function AdminOrders() {
  const { orders = [], updateOrderStatus, updateOrderPaymentStatus, products = [], createManualOrder, updateOrder, deleteOrder, lookupCustomer, addCustomer, customers = [] } = useStore();
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Last 7 Days');
  const [search, setSearch] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewOrder, setPreviewOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);

  useEffect(() => {
    const handleCloseMenu = () => setActionMenuOpenId(null);
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, []);
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

  // ── Product Picker & Inventory Selection (Blanxer variant unpack) ──
  const allVariantRows = useMemo(() => {
    const rows = [];
    (products || []).forEach(p => {
      const combos = Array.isArray(p.customSizes) && p.customSizes.length > 0
        ? p.customSizes
        : (Array.isArray(p.combinations) && p.combinations.length > 0 ? p.combinations : null);

      if (combos) {
        combos.forEach((c, idx) => {
          const varLabel = c.name || [c.color, c.size].filter(Boolean).join(" / ") || c.size || "Standard";
          rows.push({
            key: `${p.id}_${varLabel}_${c.sku || idx}`,
            product: p,
            productId: p.id,
            productName: p.name,
            variant: varLabel,
            sku: c.sku || `${p.id}-${varLabel}`.toLowerCase().replace(/\s+/g, "-"),
            stock: Number(c.quantity || c.stock || 0),
            price: Number(c.price || p.price || 0),
            image: c.image || p.image || "/images/kurtha-charcoal.jpg",
            isFirst: idx === 0,
          });
        });
      } else if (p.sizes && typeof p.sizes === "object" && Object.keys(p.sizes).length > 0) {
        const sizeKeys = Object.keys(p.sizes);
        sizeKeys.forEach((sKey, idx) => {
          const val = p.sizes[sKey];
          const stock = typeof val === "object" ? Number(val.stock || val.quantity || 0) : Number(val || 0);
          const price = (typeof val === "object" && val.price) ? Number(val.price) : Number(p.price || 0);
          rows.push({
            key: `${p.id}_${sKey}`,
            product: p,
            productId: p.id,
            productName: p.name,
            variant: sKey,
            sku: `${p.id}-${sKey}`.toLowerCase().replace(/\s+/g, "-"),
            stock: stock,
            price: price,
            image: p.image || "/images/kurtha-charcoal.jpg",
            isFirst: idx === 0,
          });
        });
      } else {
        rows.push({
          key: `${p.id}_standard`,
          product: p,
          productId: p.id,
          productName: p.name,
          variant: "Standard",
          sku: `${p.id}-std`.toLowerCase(),
          stock: Number(p.stock || p.totalStock || 0),
          price: Number(p.price || 0),
          image: p.image || "/images/kurtha-charcoal.jpg",
          isFirst: true,
        });
      }
    });
    return rows;
  }, [products]);

  const togglePickerVariantRow = (row) => {
    setPickerSelected(prev => {
      const copy = { ...prev };
      if (copy[row.key]) {
        delete copy[row.key];
      } else {
        copy[row.key] = row;
      }
      return copy;
    });
  };

  const handleConfirmProductPicker = () => {
    const selectedList = Object.values(pickerSelected);
    if (selectedList.length === 0) {
      setProductPickerOpen(false);
      return;
    }
    const newItems = selectedList.map(item => {
      const p = item.product || {};
      return {
        productId: item.productId || p.id,
        name: item.productName || p.name,
        size: item.variant || "Standard",
        sku: item.sku || "",
        quantity: 1,
        price: item.price ?? p.price ?? 0,
        image: item.image || p.image || "/images/kurtha-charcoal.jpg",
        discount: 0,
        discountType: "fixed",
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


  const openEditOrder = (order) => {
    const cust = order.customer || {};
    const name = cust.fullName || cust.name || order.customer_name || order.customerName || '';
    const phone = cust.phone || order.phone || '';
    const email = cust.email || order.email || '';
    const whatsapp = cust.whatsapp || order.whatsapp || phone;
    const district = cust.district || order.district || 'Kathmandu Inside Ring Road';
    const address = cust.address || order.address || '';
    const landmark = cust.landmark || order.landmark || '';
    const altPhone = cust.altPhone || order.altPhone || '';
    const note = cust.note || order.note || '';

    setEditingOrder(order);
    setSelectedCustomer({
      name,
      fullName: name,
      phone,
      email,
      district,
      address,
      landmark,
      altPhone,
    });
    setFormData({
      phone,
      fullName: name,
      email,
      whatsapp,
      district,
      address,
      landmark,
      altPhone,
      note,
      discount: order.discountAmount || order.discount_amount || 0,
      deliveryCharge: order.deliveryCharge !== undefined ? order.deliveryCharge : 150,
      paymentMethod: order.paymentMethod || order.payment_method || 'COD',
      paymentStatus: order.paymentStatus || order.payment_status || 'Unpaid',
      status: order.status || 'Pending',
      channel: order.channel || 'WhatsApp',
      items: (order.items || []).map(it => ({
        id: it.id || it.product_id || it.productId || Date.now(),
        title: it.title || it.name || '',
        price: it.price || it.sellingPrice || 0,
        sellingPrice: it.price || it.sellingPrice || 0,
        quantity: it.quantity || 1,
        size: it.size || it.variant || 'M',
        color: it.color || '',
        image: it.image || '/images/kurtha-charcoal.jpg',
        discount: it.discount || 0,
      })),
    });
    setShowCreateModal(true);
  };

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

    if (editingOrder) {
      setIsSubmitting(true);
      (async () => {
        try {
          const updated = {
            id: editingOrder.id,
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
            customerName: orderName,
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
            paymentStatus: formData.paymentStatus,
            payment_status: formData.paymentStatus,
            status: formData.status || 'Pending',
            channel: formData.channel || 'WhatsApp',
            items: formData.items,
            total: grandTotal,
            discountAmount: orderDiscountAmount,
            deliveryCharge: deliveryChargeVal,
            updatedAt: new Date().toISOString(),
          };
          await updateOrder(updated);
          setShowCreateModal(false);
          setEditingOrder(null);
          setFormData(initialForm);
          setSelectedCustomer(null);
        } catch (err) {
          alert('Failed to update order: ' + err.message);
        } finally {
          setIsSubmitting(false);
        }
      })();
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
      const orderPhone = (formData.phone || selectedCustomer?.phone || '').trim();
      const orderName = (formData.fullName || selectedCustomer?.name || selectedCustomer?.fullName || '').trim();
      const orderAddr = (formData.address || selectedCustomer?.address || '').trim();

      await createManualOrder({
        customer: {
          fullName: orderName,
          name: orderName,
          phone: orderPhone,
          email: (formData.email || selectedCustomer?.email || '').trim(),
          whatsapp: (formData.whatsapp || formData.phone || selectedCustomer?.whatsapp || selectedCustomer?.phone || '').trim(),
          district: formData.district || 'Kathmandu Inside Ring Road',
          city: formData.district || 'Kathmandu Inside Ring Road',
          address: orderAddr,
          landmark: (formData.landmark || selectedCustomer?.landmark || '').trim(),
          altPhone: (formData.altPhone || selectedCustomer?.altPhone || '').trim(),
          note: (formData.note || '').trim(),
          paymentMethod: formData.paymentMethod || 'COD',
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
      alert('Error creating order: ' + (err.message || 'Unknown error'));
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
      {/* ══ 1. TOP HEADER & ACTION BAR (BLANXER EXACT MATCH) ══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            Orders
          </h1>

          {/* Search Bar with Info Icon */}
          <div style={{ position: 'relative', width: '320px' }}>
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="9841234567, Pooja Sharma, #ORD..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                padding: '7px 32px 7px 32px',
                fontSize: '0.84rem',
                color: '#1e293b',
                outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1', fontSize: '0.78rem', cursor: 'help' }} title="Search by customer name, phone number, order ID, or email">
              ℹ️
            </span>
          </div>

          {/* Date Selector */}
          <div style={{ position: 'relative' }}>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              style={{
                background: '#ffffff',
                border: '1.5px solid #e2e8f0',
                borderRadius: '8px',
                padding: '7px 28px 7px 12px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px center',
              }}
            >
              <option value="Last 7 Days">Last 7 days</option>
              <option value="Last 30 Days">Last 30 days</option>
              <option value="This Month">This Month</option>
              <option value="All Time">All Time</option>
            </select>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="admin-btn"
            style={{
              background: '#8b5cf6',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span>✨</span>
            <span>Do with AI</span>
            <span style={{ fontSize: '0.7rem' }}>▼</span>
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
              fontSize: '0.82rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span>+</span>
            <span>New order</span>
          </button>

          <button
            type="button"
            style={{
              background: '#ffffff',
              border: '1.5px solid #e2e8f0',
              borderRadius: '6px',
              padding: '7px 10px',
              fontSize: '0.82rem',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            ···
          </button>
        </div>
      </div>

      {/* ══ 2. STATUS FILTER TABS ══ */}
      <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
        {statusTabs.map(tab => {
          const isActive = statusFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              style={{
                padding: '5px 14px',
                borderRadius: '16px',
                fontSize: '0.8rem',
                fontWeight: isActive ? 700 : 500,
                background: isActive ? '#7c3aed' : 'transparent',
                color: isActive ? '#ffffff' : '#475569',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.12s ease'
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ══ 3. ORDERS TABLE (BLANXER EXACT COLUMNS & STYLING) ══ */}
      {filteredOrders.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📦</div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>No orders found</h3>
          <p style={{ fontSize: '0.88rem', margin: 0 }}>Try clearing filters or search to view orders.</p>
        </div>
      ) : (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{
            padding: '6px 14px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '0.74rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>↔️</span>
            <span>Table is scrollable sideways on smaller screens</span>
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '1080px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '10px 12px', width: '32px' }}>
                    <input
                      type="checkbox"
                      checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length}
                      onChange={handleSelectAll}
                      style={{ cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}># ↕</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>CUSTOMER NAME ↕</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>AVG RATING ↕</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>QUANTITY ↕</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>TOTAL ↕</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>DISCOUNT ↕</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>CHANNEL</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>PAYMENT METHOD</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>ORDER STATUS & PAYMENT STATUS</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>CREATED ↕</th>
                  <th style={{ padding: '10px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>UPDATED ↕</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, width: '40px' }}>ACTIONS ↕</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => {
                  const itemCount = (order.items || []).reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);
                  const isSelected = selectedOrderIds.includes(order.id);

                  // Formatting Order ID like Blanxer (e.g. 1019)
                  const cleanOrderId = (order.id || '').replace(/^ORD-/, '').replace(/^#/, '');

                  // Channel badge styling
                  const ch = (order.channel || 'WhatsApp').toLowerCase();
                  let channelStyle = { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0', label: 'WHATSAPP' };
                  if (ch.includes('insta')) {
                    channelStyle = { bg: '#fae8ff', text: '#a21caf', border: '#f0abfc', label: 'INSTAGRAM' };
                  } else if (ch.includes('web')) {
                    channelStyle = { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe', label: 'WEBSITE' };
                  } else if (ch.includes('tik')) {
                    channelStyle = { bg: '#f1f5f9', text: '#0f172a', border: '#cbd5e1', label: 'TIKTOK' };
                  } else if (ch.includes('phone')) {
                    channelStyle = { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', label: 'PHONE' };
                  }

                  // Order Status badge styling
                  const st = (order.status || 'Pending').toLowerCase();
                  let orderStatusStyle = { bg: '#fef3c7', text: '#d97706', label: 'PENDING' };
                  if (st === 'delivered') {
                    orderStatusStyle = { bg: '#dcfce7', text: '#15803d', label: 'DELIVERED' };
                  } else if (st === 'dispatched' || st === 'shipped') {
                    orderStatusStyle = { bg: '#ccfbf1', text: '#0f766e', label: 'DISPATCHED' };
                  } else if (st === 'processing') {
                    orderStatusStyle = { bg: '#e0e7ff', text: '#4338ca', label: 'PROCESSING' };
                  } else if (st === 'cancelled') {
                    orderStatusStyle = { bg: '#fee2e2', text: '#b91c1c', label: 'CANCELLED' };
                  } else if (st === 'returned') {
                    orderStatusStyle = { bg: '#ffedd5', text: '#c2410c', label: 'RETURNED' };
                  }

                  // Payment Status badge styling
                  const ps = (order.paymentStatus || (order.paymentMethod === 'COD' ? 'Unpaid' : 'Paid')).toLowerCase();
                  let paymentStatusStyle = { bg: '#fef3c7', text: '#d97706', label: 'UNPAID' };
                  if (ps.includes('full') || ps === 'paid') {
                    paymentStatusStyle = { bg: '#dcfce7', text: '#15803d', label: 'PAID' };
                  } else if (ps.includes('partial')) {
                    paymentStatusStyle = { bg: '#dbeafe', text: '#2563eb', label: 'PARTIAL' };
                  }

                  // Date formatting (Oct 23, 2026 1:47 PM)
                  const formatDate = (iso) => {
                    if (!iso) return 'Oct 23, 2026 1:47 PM';
                    try {
                      const d = new Date(iso);
                      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
                        ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                    } catch {
                      return iso;
                    }
                  };

                  return (
                    <tr
                      key={order.id}
                      onClick={() => openEditOrder(order)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: isSelected ? '#f5f3ff' : '#ffffff',
                        transition: 'background 0.1s ease'
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f8fafc'; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = '#ffffff'; }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '10px 12px' }} onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(order.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* 1. # ID */}
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        {cleanOrderId}
                      </td>

                      {/* 2. Customer Name & Phone + NEW Badge */}
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{order.customer?.fullName || order.customer?.name || 'Walk-in Customer'}</span>
                          <span style={{
                            background: '#f3e8ff',
                            color: '#7c3aed',
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            padding: '1px 5px',
                            borderRadius: '3px'
                          }}>
                            NEW
                          </span>
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '1px' }}>
                          {order.customer?.phone || '-'}
                        </div>
                      </td>

                      {/* 3. Avg Rating */}
                      <td style={{ padding: '10px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#f59e0b', marginRight: '3px' }}>★</span>
                        <span>0 (0)</span>
                      </td>

                      {/* 4. Quantity */}
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1e293b' }}>
                        {itemCount}
                      </td>

                      {/* 5. Total */}
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        Rs {Number(order.total || 0).toLocaleString()}
                      </td>

                      {/* 6. Discount */}
                      <td style={{ padding: '10px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        Rs {Number(order.discountAmount || order.discount || 0).toLocaleString()}
                      </td>

                      {/* 7. Channel */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          background: channelStyle.bg,
                          color: channelStyle.text,
                          border: `1px solid ${channelStyle.border}`,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {channelStyle.label === 'WHATSAPP' && <span>💬</span>}
                          {channelStyle.label}
                        </span>
                      </td>

                      {/* 8. Payment Method */}
                      <td style={{ padding: '10px 12px', color: '#334155', fontWeight: 500 }}>
                        {order.customer?.paymentMethod || order.paymentMethod || 'COD'}
                      </td>

                      {/* 9. Order Status & Payment Status Combined */}
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <span style={{
                            background: orderStatusStyle.bg,
                            color: orderStatusStyle.text,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 700
                          }}>
                            {orderStatusStyle.label}
                          </span>
                          <span style={{ color: '#94a3b8', fontSize: '0.74rem' }}>&</span>
                          <span style={{
                            background: paymentStatusStyle.bg,
                            color: paymentStatusStyle.text,
                            padding: '2px 7px',
                            borderRadius: '4px',
                            fontSize: '0.68rem',
                            fontWeight: 700
                          }}>
                            {paymentStatusStyle.label}
                          </span>
                        </div>
                      </td>

                      {/* 10. Created */}
                      <td style={{ padding: '10px 12px', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.74rem' }}>
                        {formatDate(order.createdAt)}
                      </td>

                      {/* 11. Updated */}
                      <td style={{ padding: '10px 12px', color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.74rem' }}>
                        {formatDate(order.updatedAt || order.createdAt)}
                      </td>

                      {/* 12. Actions */}
                      <td style={{ padding: '10px 12px', textAlign: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionMenuOpenId(actionMenuOpenId === order.id ? null : order.id);
                          }}
                          style={{
                            background: actionMenuOpenId === order.id ? '#ede9fe' : '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            width: '32px',
                            height: '32px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#475569',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 700,
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            transition: 'all 0.15s ease'
                          }}
                          title="Actions"
                        >
                          ···
                        </button>

                        {actionMenuOpenId === order.id && (
                          <div
                            onClick={e => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '42px',
                              zIndex: 50,
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                              minWidth: '150px',
                              padding: '4px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '2px',
                              textAlign: 'left'
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActionMenuOpenId(null);
                                openEditOrder(order);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '8px 12px',
                                background: 'none',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#1e293b',
                                textAlign: 'left',
                                transition: 'background 0.12s ease'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <span>✏️</span> Edit Order
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActionMenuOpenId(null);
                                setOrderToDelete(order);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '8px 12px',
                                background: 'none',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: 600,
                                color: '#dc2626',
                                textAlign: 'left',
                                transition: 'background 0.12s ease'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}
                            >
                              <span>🗑️</span> Delete Order
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
                  <span>{editingOrder ? '✏️' : '+'}</span> {editingOrder ? `Edit Order #${String(editingOrder.id).replace(/^ORD-/, '').replace(/^#/, '')}` : 'Create Order'}
                </h3>
                <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  {editingOrder ? 'Modify customer details, items, pricing, payment, and fulfillment status' : 'Auto-increments sequential ID (#1001, #1002...) • Blanxer Workflow'}
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
                            placeholder="9841234567 / 9818765432..."
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
                        placeholder="Ward 4, New Baneshwor, Kathmandu"
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
                        placeholder="Near Bhatbhateni Supermarket"
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
                        placeholder="9860123456"
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
                      placeholder="Call before arrival"
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

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Order Status
                      </label>
                      <select
                        value={formData.status || 'Pending'}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.84rem',
                          fontWeight: 700,
                          background: '#ffffff',
                          color: formData.status === 'Delivered' ? '#16a34a' : (formData.status === 'Cancelled' ? '#dc2626' : (formData.status === 'Processing' ? '#2563eb' : '#d97706'))
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

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
                    {isSubmitting ? (editingOrder ? 'Saving...' : 'Creating Order...') : (editingOrder ? 'Save Changes' : 'Create Order')}
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
                    placeholder="Pooja Sharma"
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
                    placeholder="pooja.sharma98@gmail.com"
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
                    placeholder="9860123456"
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
                  placeholder="Search product name, SKU, or variant..."
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

            {/* Blanxer Table: Checkbox | Im... | Product | Variant | SKU | Quantity | Unit Price */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px' }}>
              {(() => {
                const searchQ = (productSearch || '').toLowerCase().trim();
                const filteredRows = allVariantRows.filter(r => 
                  r.productName.toLowerCase().includes(searchQ) ||
                  r.variant.toLowerCase().includes(searchQ) ||
                  r.sku.toLowerCase().includes(searchQ)
                );

                const allChecked = filteredRows.length > 0 && filteredRows.every(r => !!pickerSelected[r.key]);

                const handleToggleAll = (checked) => {
                  setPickerSelected(prev => {
                    const copy = { ...prev };
                    filteredRows.forEach(r => {
                      if (checked) copy[r.key] = r;
                      else delete copy[r.key];
                    });
                    return copy;
                  });
                };

                return (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em', background: '#f8fafc' }}>
                        <th style={{ padding: '10px 8px', width: '36px' }}>
                          <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={e => handleToggleAll(e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                          />
                        </th>
                        <th style={{ padding: '10px 8px', width: '50px' }}>Im...</th>
                        <th style={{ padding: '10px 8px' }}>Product</th>
                        <th style={{ padding: '10px 8px' }}>Variant</th>
                        <th style={{ padding: '10px 8px' }}>SKU</th>
                        <th style={{ padding: '10px 8px', textAlign: 'center' }}>Quantity</th>
                        <th style={{ padding: '10px 8px', textAlign: 'right' }}>Unit Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                            No matching products or variants found.
                          </td>
                        </tr>
                      ) : (
                        filteredRows.map(row => {
                          const isChecked = !!pickerSelected[row.key];
                          return (
                            <tr
                              key={row.key}
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
                                  onChange={() => togglePickerVariantRow(row)}
                                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                                />
                              </td>
                              <td style={{ padding: '10px 8px' }}>
                                <img
                                  src={row.image}
                                  alt=""
                                  style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
                                  onError={e => { e.target.src = '/images/kurtha-charcoal.jpg'; }}
                                />
                              </td>
                              <td style={{ padding: '10px 8px' }}>
                                {row.isFirst ? (
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.productName}</div>
                                ) : (
                                  <div style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '1rem' }}>"</div>
                                )}
                              </td>
                              <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>
                                {row.variant}
                              </td>
                              <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>
                                {row.sku}
                              </td>
                              <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                <span style={{
                                  fontWeight: 700,
                                  color: row.stock > 0 ? '#0f172a' : '#ef4444'
                                }}>
                                  {row.stock}
                                </span>
                              </td>
                              <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                Rs {Number(row.price).toLocaleString()}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                );
              })()}
            </div>

            {/* Footer Matching Blanxer: 1 - 10 / 25 | Confirm Select [X] Products */}
            <div style={{
              padding: '14px 22px',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                1 - {Math.min(10, allVariantRows.length)} / {allVariantRows.length}
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
                  disabled={Object.keys(pickerSelected).length === 0}
                  style={{
                    background: Object.keys(pickerSelected).length === 0 ? '#c4b5fd' : '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 20px',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    cursor: Object.keys(pickerSelected).length === 0 ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(124, 58, 237, 0.3)'
                  }}
                >
                  Confirm Select [{Object.keys(pickerSelected).length}] Products
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE ORDER CONFIRMATION MODAL ══ */}
      {orderToDelete && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '420px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              margin: '0 auto 14px'
            }}>
              🗑️
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Delete Order #{String(orderToDelete.id).replace(/^ORD-/, '').replace(/^#/, '')}?
            </h3>
            <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Are you sure you want to delete this order? This action will remove the order and restore its items to inventory.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = orderToDelete.id;
                  setOrderToDelete(null);
                  await deleteOrder(id);
                }}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Yes, Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
