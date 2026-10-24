import { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';

export default function AdminProducts() {
  const { products, categories, addProduct, deleteProduct } = useStore();
  const [activeTab, setActiveTab] = useState('Active'); // Active, Draft, Archived
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: General Info, 2: Variants & Inventory, 3: Custom Fields

  // Form State for Step 1
  const [form, setForm] = useState({
    name: '',
    categoryId: categories?.[0]?.id || '',
    shortDescription: '',
    longDescription: '',
    image: '',
    imagePreview: '',
    // Step 2 fields
    price: 2999,
    originalPrice: 4499,
    sku: '',
    variants: [
      { size: 'M', stock: 5, price: 2999 },
      { size: 'L', stock: 5, price: 2999 },
      { size: 'XL', stock: 5, price: 2999 },
      { size: 'XXL', stock: 5, price: 2999 },
    ],
    // Step 3 fields
    tags: '',
    badge: 'New Arrival',
    status: 'Active',
  });

  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Filter products by tab status and search query
  const filteredProducts = (products || []).filter(p => {
    const status = p.status || 'Active';
    if (activeTab === 'Active' && status !== 'Active') return false;
    if (activeTab === 'Draft' && status !== 'Draft') return false;
    if (activeTab === 'Archived' && status !== 'Archived') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = p.name?.toLowerCase().includes(q);
      const idMatch = String(p.id).toLowerCase().includes(q);
      if (!nameMatch && !idMatch) return false;
    }
    return true;
  });

  // Validation for Step 1
  const validateStep1 = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!form.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }
    if (!form.shortDescription.trim()) {
      newErrors.shortDescription = 'Product description is required';
    }
    if (!form.longDescription.trim()) {
      newErrors.longDescription = 'Long description is required';
    }
    if (!form.image && !form.imagePreview) {
      newErrors.image = 'Please upload at least one product image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep1 = () => {
    if (validateStep1()) {
      setErrors({});
      setCurrentStep(2);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({
          ...prev,
          image: reader.result,
          imagePreview: reader.result,
        }));
        if (errors.image) {
          setErrors(prev => ({ ...prev, image: null }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    const totalStock = form.variants.reduce((acc, v) => acc + (parseInt(v.stock, 10) || 0), 0);
    const sizesObj = form.variants.reduce((acc, v) => {
      acc[v.size] = parseInt(v.stock, 10) || 0;
      return acc;
    }, {});

    addProduct({
      name: form.name,
      categoryId: form.categoryId,
      description: form.shortDescription,
      longDescription: form.longDescription,
      image: form.image || '/images/kurtha-charcoal.jpg',
      price: form.price,
      originalPrice: form.originalPrice,
      status: form.status,
      inventory: totalStock,
      sizes: sizesObj,
      createdAt: new Date().toISOString(),
    });

    // Reset and close
    setShowAddModal(false);
    setCurrentStep(1);
    setForm({
      name: '',
      categoryId: categories?.[0]?.id || '',
      shortDescription: '',
      longDescription: '',
      image: '',
      imagePreview: '',
      price: 2999,
      originalPrice: 4499,
      sku: '',
      variants: [
        { size: 'M', stock: 5, price: 2999 },
        { size: 'L', stock: 5, price: 2999 },
        { size: 'XL', stock: 5, price: 2999 },
        { size: 'XXL', stock: 5, price: 2999 },
      ],
      tags: '',
      badge: 'New Arrival',
      status: 'Active',
    });
    setErrors({});
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#111827' }}>
      
      {/* ══ 1. TITLE (CANVA EXACT) ══ */}
      <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 16px 0', letterSpacing: '-0.01em', color: '#111827' }}>
        Products
      </h1>

      {/* ══ 2. STATUS TABS (Active, Draft, Archived) ══ */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '18px' }}>
        {/* Active Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('Active')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: activeTab === 'Active' ? '1px solid #e9d5ff' : '1px solid transparent',
            fontSize: '13px',
            fontWeight: activeTab === 'Active' ? 600 : 500,
            background: activeTab === 'Active' ? '#f3effe' : 'transparent',
            color: activeTab === 'Active' ? '#7952eb' : '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="16 10 11 15 8 12" />
          </svg>
          Active
        </button>

        {/* Draft Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('Draft')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: activeTab === 'Draft' ? '1px solid #e9d5ff' : '1px solid transparent',
            fontSize: '13px',
            fontWeight: activeTab === 'Draft' ? 600 : 500,
            background: activeTab === 'Draft' ? '#f3effe' : 'transparent',
            color: activeTab === 'Draft' ? '#7952eb' : '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Draft
        </button>

        {/* Archived Tab */}
        <button
          type="button"
          onClick={() => setActiveTab('Archived')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: activeTab === 'Archived' ? '1px solid #e9d5ff' : '1px solid transparent',
            fontSize: '13px',
            fontWeight: activeTab === 'Archived' ? 600 : 500,
            background: activeTab === 'Archived' ? '#f3effe' : 'transparent',
            color: activeTab === 'Archived' ? '#7952eb' : '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
          Archived
        </button>
      </div>

      {/* ══ 3. ACTION BAR (Search Input + Add Product + More Options) ══ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
        {/* Search Bar with Icon */}
        <div style={{ position: 'relative', width: '320px' }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '9px 12px 9px 36px',
              fontSize: '13px',
              color: '#111827',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#7952eb'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
          />
        </div>

        {/* Buttons on right: + Add Product and ··· */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => {
              setCurrentStep(1);
              setShowAddModal(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#7952eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(121, 82, 235, 0.2)',
              transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            <span style={{ fontSize: '15px', lineHeight: 1 }}>+</span>
            <span>Add Product</span>
          </button>

          <button
            type="button"
            style={{
              width: '38px',
              height: '38px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            ···
          </button>
        </div>
      </div>

      {/* ══ 4. PRODUCTS TABLE & EMPTY STATE (CANVA EXACT) ══ */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#ffffff', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontSize: '11px', fontWeight: 600, letterSpacing: '0.03em' }}>
              <th style={{ padding: '12px 16px', width: '38px' }}>
                <input type="checkbox" style={{ accentColor: '#7952eb', borderRadius: '4px', cursor: 'pointer' }} />
              </th>
              <th style={{ padding: '12px 8px', width: '36px' }}>#</th>
              <th style={{ padding: '12px 16px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  NAME <span style={{ fontSize: '11px', color: '#9ca3af' }}>↕</span>
                </span>
              </th>
              <th style={{ padding: '12px 16px' }}>AVG RATING</th>
              <th style={{ padding: '12px 16px' }}>PRICE</th>
              <th style={{ padding: '12px 16px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  INVENTORY <span style={{ fontSize: '11px', color: '#9ca3af' }}>↕</span>
                </span>
              </th>
              <th style={{ padding: '12px 16px' }}>STATUS</th>
              <th style={{ padding: '12px 16px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  CREATED <span style={{ fontSize: '11px', color: '#9ca3af' }}>↕</span>
                </span>
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length === 0 ? (
              /* Canva Empty State: No records */
              <tr>
                <td colSpan="9" style={{ padding: '72px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f3f4f6', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', marginBottom: '10px' }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="2" y1="2" x2="22" y2="22" />
                        <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
                        <line x1="13.5" y1="13.5" x2="6" y2="21" />
                        <line x1="18" y1="12" x2="21" y2="15" />
                        <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.05-.22 1.41-.59" />
                        <path d="M21 15V5a2 2 0 0 0-2-2H9" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 500 }}>
                      No records
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((p, idx) => {
                const totalStock = Object.values(p.sizes || {}).reduce((a, b) => a + Number(b || 0), 0);
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f9fafb', transition: 'background 0.15s ease' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <input type="checkbox" style={{ accentColor: '#7952eb', borderRadius: '4px' }} />
                    </td>
                    <td style={{ padding: '12px 8px', color: '#9ca3af', fontFamily: 'monospace' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={p.image || '/images/kurtha-charcoal.jpg'} alt={p.name} style={{ width: '38px', height: '46px', objectFit: 'cover', borderRadius: '6px', background: '#f3f4f6' }} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#111827' }}>{p.name}</div>
                          <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'monospace' }}>Code: {p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: '#f59e0b', fontSize: '13px' }}>★ ★ ★ ★ ★</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#111827' }}>
                      Rs. {Number(p.price || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: totalStock > 0 ? '#10b981' : '#ef4444' }}>
                        {totalStock} in stock
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: '#ecfdf5', color: '#059669' }}>
                        {p.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '12px' }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Oct 24, 2026'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => deleteProduct(p.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ══ 5. CANVA 3-STEP "ADD PRODUCT" MODAL (PIXEL PERFECT) ══ */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
          }}>
            
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Add Product
              </h2>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '18px',
                  lineHeight: 1,
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Stepper Header (CANVA EXACT) */}
            <div style={{
              background: '#f8fafc',
              borderBottom: '1px solid #f1f5f9',
              padding: '14px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}>
              {/* Step 1 Item */}
              <div
                onClick={() => setCurrentStep(1)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  flex: 1,
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: currentStep >= 1 ? '#7952eb' : '#e2e8f0',
                  color: currentStep >= 1 ? '#ffffff' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  1
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: currentStep === 1 ? '#7952eb' : '#64748b', letterSpacing: '0.04em' }}>
                    STEP 1
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: currentStep === 1 ? '#0f172a' : '#64748b' }}>
                    General Information
                  </div>
                </div>
              </div>

              {/* Separator Line */}
              <div style={{ height: '1px', flex: '0 0 30px', background: '#e2e8f0' }} />

              {/* Step 2 Item */}
              <div
                onClick={() => {
                  if (validateStep1()) setCurrentStep(2);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: currentStep > 1 ? 'pointer' : 'default',
                  flex: 1,
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: currentStep >= 2 ? '#7952eb' : '#f1f5f9',
                  border: currentStep >= 2 ? 'none' : '1px solid #cbd5e1',
                  color: currentStep >= 2 ? '#ffffff' : '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  2
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: currentStep === 2 ? '#7952eb' : '#94a3b8', letterSpacing: '0.04em' }}>
                    STEP 2
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: currentStep === 2 ? '#0f172a' : '#94a3b8' }}>
                    Variants & Inventory
                  </div>
                </div>
              </div>

              {/* Separator Line */}
              <div style={{ height: '1px', flex: '0 0 30px', background: '#e2e8f0' }} />

              {/* Step 3 Item */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1,
                  opacity: currentStep === 3 ? 1 : 0.6,
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: currentStep >= 3 ? '#7952eb' : '#f1f5f9',
                  border: currentStep >= 3 ? 'none' : '1px solid #cbd5e1',
                  color: currentStep >= 3 ? '#ffffff' : '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  3
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: currentStep === 3 ? '#7952eb' : '#94a3b8', letterSpacing: '0.04em' }}>
                    STEP 3
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: currentStep === 3 ? '#0f172a' : '#94a3b8' }}>
                    Custom Fields
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              
              {/* ══ STEP 1: GENERAL INFORMATION ══ */}
              {currentStep === 1 && (
                <div>
                  {/* Field 1: Product Name */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Product Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="eg. Red Doko Styled T-shirt"
                      value={form.name}
                      onChange={e => {
                        setForm({ ...form, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: errors.name ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                        fontSize: '13.5px',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={e => { if (!errors.name) e.currentTarget.style.borderColor = '#7952eb'; }}
                      onBlur={e => { if (!errors.name) e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    />
                    {errors.name && (
                      <span style={{ fontSize: '11px', color: '#ef4444', display: 'block', marginTop: '4px' }}>
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Field 2: Categories */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Categories <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={form.categoryId}
                        onChange={e => {
                          setForm({ ...form, categoryId: e.target.value });
                          if (errors.categoryId) setErrors({ ...errors, categoryId: null });
                        }}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: errors.categoryId ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                          fontSize: '13.5px',
                          outline: 'none',
                          background: '#ffffff',
                          boxSizing: 'border-box',
                        }}
                      >
                        <option value="">Select product categories</option>
                        {(categories || []).map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const newCatName = prompt('Enter new category name:');
                          if (newCatName && newCatName.trim()) {
                            alert(`Category "${newCatName}" can be selected!`);
                          }
                        }}
                        style={{
                          background: '#f3effe',
                          color: '#7952eb',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0 16px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        + Add
                      </button>
                    </div>
                    {errors.categoryId && (
                      <span style={{ fontSize: '11px', color: '#ef4444', display: 'block', marginTop: '4px' }}>
                        {errors.categoryId}
                      </span>
                    )}
                  </div>

                  {/* Field 3: Product Description */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Product Description <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder={`No description found\nGood & converting description contains:\n• Solutions to customer pain points.\n• Simple language that highlights value.\n• Clear and concise key features and benefits.\n• Context to help customers imagine using the product.`}
                      value={form.shortDescription}
                      onChange={e => {
                        setForm({ ...form, shortDescription: e.target.value });
                        if (errors.shortDescription) setErrors({ ...errors, shortDescription: null });
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: errors.shortDescription ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                      onFocus={e => { if (!errors.shortDescription) e.currentTarget.style.borderColor = '#7952eb'; }}
                      onBlur={e => { if (!errors.shortDescription) e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    />
                    {errors.shortDescription && (
                      <span style={{ fontSize: '11px', color: '#ef4444', display: 'block', marginTop: '4px' }}>
                        {errors.shortDescription}
                      </span>
                    )}
                  </div>

                  {/* Field 4: Long Description */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Long Description <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder={`No description found\nGood & converting description contains:\n• Solutions to customer pain points.\n• Simple language that highlights value.\n• Clear and concise key features and benefits.\n• Context to help customers imagine using the product.`}
                      value={form.longDescription}
                      onChange={e => {
                        setForm({ ...form, longDescription: e.target.value });
                        if (errors.longDescription) setErrors({ ...errors, longDescription: null });
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: errors.longDescription ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        outline: 'none',
                        boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                      onFocus={e => { if (!errors.longDescription) e.currentTarget.style.borderColor = '#7952eb'; }}
                      onBlur={e => { if (!errors.longDescription) e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    />
                    {errors.longDescription && (
                      <span style={{ fontSize: '11px', color: '#ef4444', display: 'block', marginTop: '4px' }}>
                        {errors.longDescription}
                      </span>
                    )}
                  </div>

                  {/* Field 5: Product Images (CANVA EXACT DROPZONE) */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Product Images <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />

                    {form.imagePreview ? (
                      <div style={{
                        position: 'relative',
                        width: '120px',
                        height: '140px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                      }}>
                        <img
                          src={form.imagePreview}
                          alt="Preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, image: '', imagePreview: '' }))}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(0,0,0,0.6)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          border: errors.image ? '1.5px dashed #ef4444' : '1.5px dashed #cbd5e1',
                          borderRadius: '10px',
                          padding: '36px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          background: '#fbfbfd',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#7952eb'; e.currentTarget.style.background = '#faf8ff'; }}
                        onMouseLeave={e => { if (!errors.image) { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#fbfbfd'; } }}
                      >
                        {/* Image Plus Icon from Canva */}
                        <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
                          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                            <line x1="18" y1="9" x2="22" y2="9" />
                            <line x1="20" y1="7" x2="20" y2="11" />
                          </svg>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>
                          Click to upload product image
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          PNG, JPG up to 10MB
                        </span>
                      </div>
                    )}

                    {errors.image && (
                      <span style={{ fontSize: '11px', color: '#ef4444', display: 'block', marginTop: '4px' }}>
                        {errors.image}
                      </span>
                    )}
                  </div>

                  {/* Step 1 Footer Action */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={handleNextStep1}
                      style={{
                        background: '#7952eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 22px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(121, 82, 235, 0.3)',
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                    >
                      Next: Variants & Inventory
                    </button>
                  </div>
                </div>
              )}

              {/* ══ STEP 2: VARIANTS & INVENTORY ══ */}
              {currentStep === 2 && (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                          Base Price (NPR) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                          type="number"
                          value={form.price}
                          onChange={e => setForm({ ...form, price: parseInt(e.target.value, 10) || 0 })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13.5px', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                          Original / MRP Price (NPR)
                        </label>
                        <input
                          type="number"
                          value={form.originalPrice}
                          onChange={e => setForm({ ...form, originalPrice: parseInt(e.target.value, 10) || 0 })}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13.5px', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: '20px 0 10px 0' }}>
                      Size Variants & Stock
                    </h4>

                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: 600 }}>
                            <th style={{ padding: '10px 14px', textAlign: 'left' }}>SIZE</th>
                            <th style={{ padding: '10px 14px', textAlign: 'left' }}>STOCK QUANTITY</th>
                            <th style={{ padding: '10px 14px', textAlign: 'left' }}>PRICE (NPR)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.variants.map((v, i) => (
                            <tr key={v.size} style={{ borderBottom: i < form.variants.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                              <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                                {v.size}
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <input
                                  type="number"
                                  value={v.stock}
                                  onChange={e => {
                                    const next = [...form.variants];
                                    next[i].stock = parseInt(e.target.value, 10) || 0;
                                    setForm({ ...form, variants: next });
                                  }}
                                  style={{ width: '90px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                />
                              </td>
                              <td style={{ padding: '10px 14px' }}>
                                <input
                                  type="number"
                                  value={v.price}
                                  onChange={e => {
                                    const next = [...form.variants];
                                    next[i].price = parseInt(e.target.value, 10) || 0;
                                    setForm({ ...form, variants: next });
                                  }}
                                  style={{ width: '110px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Step 2 Footer Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      style={{
                        background: '#7952eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 22px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Next: Custom Fields
                    </button>
                  </div>
                </div>
              )}

              {/* ══ STEP 3: CUSTOM FIELDS & SAVE ══ */}
              {currentStep === 3 && (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Status
                    </label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13.5px', background: '#fff', boxSizing: 'border-box' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Badge / Tag
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Tihar Special, Bestseller"
                      value={form.badge}
                      onChange={e => setForm({ ...form, badge: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13.5px', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Summary Review Card */}
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', margin: '0 0 10px 0' }}>
                      Product Summary
                    </h4>
                    <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div><strong>Name:</strong> {form.name}</div>
                      <div><strong>Price:</strong> NPR {form.price.toLocaleString()}</div>
                      <div><strong>Status:</strong> {form.status}</div>
                      <div><strong>Total Stock:</strong> {form.variants.reduce((a, b) => a + (parseInt(b.stock, 10) || 0), 0)} units</div>
                    </div>
                  </div>

                  {/* Step 3 Footer Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        borderRadius: '8px',
                        padding: '10px 18px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      style={{
                        background: '#7952eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 24px',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(121, 82, 235, 0.3)',
                      }}
                    >
                      Publish Product
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
