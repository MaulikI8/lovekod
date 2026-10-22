import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { WhatsAppIcon } from '../../components/Icons';
import LocationAutocomplete from '../../components/common/LocationAutocomplete';

export default function AdminOrders() {
  const { orders, updateOrderStatus, updateOrderPaymentStatus, products, createManualOrder, lookupCustomer } = useStore();
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

  // New order form state matching Blanxer compact layout
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
    status: 'Pending',
    channel: 'WhatsApp',
    items: [],
  };

  const [formData, setFormData] = useState(initialForm);
  const [customerLookupStatus, setCustomerLookupStatus] = useState(null);

  // State for the inline product selector
  const [pendingProduct, setPendingProduct] = useState({
    productId: products[0]?.id || '',
    name: products[0]?.name || '',
    size: 'M',
    quantity: 1,
    price: products[0]?.price || 2999,
    image: products[0]?.image || '/images/kurtha-charcoal.jpg',
  });

  const handlePhoneLookup = async (val) => {
    const rawVal = val || '';
    setFormData(prev => ({ ...prev, phone: rawVal }));
    const clean = rawVal.replace(/[^0-9]/g, '');
    if (clean.length >= 10 && lookupCustomer) {
      const res = await lookupCustomer(clean);
      if (res && res.exists && res.customer) {
        const c = res.customer;
        setCustomerLookupStatus({
          exists: true,
          name: c.name,
          phone: c.phone,
          orders: c.totalOrders || 0,
          spent: c.totalSpent || 0,
        });
        setFormData(prev => ({
          ...prev,
          fullName: prev.fullName || c.name || '',
          email: prev.email || c.email || '',
          whatsapp: prev.whatsapp || c.whatsapp || clean,
          district: c.district || prev.district,
          address: prev.address || c.address || '',
        }));
      } else {
        setCustomerLookupStatus({ exists: false, phone: clean });
      }
    } else if (clean.length < 7) {
      setCustomerLookupStatus(null);
    }
  };

  const handleAddProductToOrder = () => {
    if (!pendingProduct.name) return;
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: pendingProduct.productId || '',
          name: pendingProduct.name,
          size: pendingProduct.size || 'M',
          quantity: Math.max(1, parseInt(pendingProduct.quantity, 10) || 1),
          price: Math.max(0, parseInt(pendingProduct.price, 10) || 0),
          image: pendingProduct.image || '/images/kurtha-charcoal.jpg',
        }
      ]
    }));
    setShowProductPicker(false);
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
          size: 'M',
          quantity: 1,
          price: priceNum,
          image: '/images/kurtha-charcoal.jpg',
        }
      ]
    }));
  };

  const removeItemRow = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculatedItemsTotal = formData.items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const discountVal = Math.max(0, parseInt(formData.discount, 10) || 0);
  const deliveryChargeVal = Math.max(0, parseInt(formData.deliveryCharge, 10) || 0);
  const grandTotal = Math.max(0, calculatedItemsTotal - discountVal) + deliveryChargeVal;

  const handleSaveOrder = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      alert('Please enter both customer name and phone number.');
      return;
    }
    if (formData.items.length === 0) {
      alert('Please add at least one product or custom item to the order.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createManualOrder({
        customer: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
          district: formData.district,
          city: formData.district,
          address: formData.address.trim(),
          landmark: formData.landmark.trim(),
          altPhone: formData.altPhone.trim(),
          note: formData.note.trim(),
          paymentMethod: formData.paymentMethod,
        },
        items: formData.items,
        total: grandTotal,
        discountAmount: discountVal,
        deliveryCharge: deliveryChargeVal,
        status: formData.status,
        paymentStatus: formData.paymentMethod === 'COD' ? 'Unpaid' : 'Paid',
        channel: formData.channel,
      });

      setIsSubmitting(false);
      setShowCreateModal(false);
      setFormData(initialForm);
      setCustomerLookupStatus(null);
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
  const filteredOrders = orders
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
              setCustomerLookupStatus(null);
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
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '620px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#ffffff'
            }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Create Order
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#64748b' }}>
                  Auto-increments sequential ID (#1001, #1002...)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '6px',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '0.9rem',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleSaveOrder} style={{ overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Row 1: Phone + Lookup */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Phone Number (Customer Primary Key) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9819377122"
                    value={formData.phone}
                    onChange={e => handlePhoneLookup(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      fontWeight: 600,
                      outline: 'none',
                    }}
                  />
                  {customerLookupStatus && (
                    <span style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: customerLookupStatus.exists ? '#dcfce7' : '#f1f5f9',
                      color: customerLookupStatus.exists ? '#15803d' : '#64748b',
                    }}>
                      {customerLookupStatus.exists ? `✓ Existing (${customerLookupStatus.orders} orders)` : 'New Customer'}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Customer Name & WhatsApp (2-col) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Customer Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pursottam Timalsena"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Same as phone"
                    value={formData.whatsapp}
                    onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Row 3: City Autocomplete */}
              <div>
                <LocationAutocomplete
                  value={formData.district}
                  onChange={val => setFormData({ ...formData, district: val })}
                  label="City / District"
                  required
                />
              </div>

              {/* Row 4: Address Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Divya Marg, Ward 4"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Dai Building"
                    value={formData.landmark}
                    onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Row 5: Product Items */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#475569' }}>
                    Cart Items ({formData.items.length})
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setShowProductPicker(true)}
                      style={{
                        background: '#7c3aed',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 10px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      + Add Product
                    </button>
                    <button
                      type="button"
                      onClick={handleAddCustomItem}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      + Custom Item
                    </button>
                  </div>
                </div>

                {formData.items.length === 0 ? (
                  <div style={{ padding: '14px', textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', border: '1px dashed #cbd5e1', borderRadius: '6px' }}>
                    No items added yet. Click &quot;+ Add Product&quot; to pick from inventory.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formData.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img src={item.image || '/images/kurtha-charcoal.jpg'} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Size: {item.size} × {item.quantity}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>
                            Rs {(item.price * item.quantity).toLocaleString()}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 6: Channel & Payment Method (2-col) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Order Channel / Label
                  </label>
                  <select
                    value={formData.channel}
                    onChange={e => setFormData({ ...formData, channel: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                      fontWeight: 600,
                    }}
                  >
                    <option value="Website">Website</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Payment Method
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                      fontWeight: 600,
                    }}
                  >
                    <option value="COD">Cash on Delivery (COD)</option>
                    <option value="DynamicQR">Dynamic QR Pay</option>
                  </select>
                </div>
              </div>

              {/* Row 7: Discount & Delivery Charge */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Discount (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.discount}
                    onChange={e => setFormData({ ...formData, discount: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Delivery Charge (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.deliveryCharge}
                    onChange={e => setFormData({ ...formData, deliveryCharge: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 10px',
                      fontSize: '0.86rem',
                      color: '#0f172a',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Total Calculation summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '10px 14px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5b21b6' }}>
                  Grand Total (Payable):
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7c3aed' }}>
                  Rs {grandTotal.toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '0.84rem',
                    fontWeight: 600,
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
                    borderRadius: '6px',
                    padding: '8px 20px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(124,58,237,0.35)'
                  }}
                >
                  {isSubmitting ? 'Saving Order...' : 'Create & Save Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '480px',
            padding: '20px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <h4 style={{ margin: '0 0 14px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
              Select Product
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Product
                </label>
                <select
                  value={pendingProduct.productId}
                  onChange={e => {
                    const sel = products.find(p => p.id === e.target.value);
                    if (sel) {
                      setPendingProduct({
                        ...pendingProduct,
                        productId: sel.id,
                        name: sel.name,
                        price: sel.price,
                        image: sel.image,
                      });
                    }
                  }}
                  style={{
                    width: '100%',
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px',
                    fontSize: '0.85rem',
                    color: '#0f172a'
                  }}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Rs {p.price.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Size
                  </label>
                  <select
                    value={pendingProduct.size}
                    onChange={e => setPendingProduct({ ...pendingProduct, size: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px',
                      fontSize: '0.85rem'
                    }}
                  >
                    {['S', 'M', 'L', 'XL', 'XXL'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={pendingProduct.quantity}
                    onChange={e => setPendingProduct({ ...pendingProduct, quantity: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowProductPicker(false)}
                  style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 14px', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddProductToOrder}
                  style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
