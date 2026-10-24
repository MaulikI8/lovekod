import { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';

export default function AdminProducts() {
  const { products, categories, addProduct, updateProduct, deleteProduct, addCategory } = useStore();
  const [editingProduct, setEditingProduct] = useState(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const [activeTab, setActiveTab] = useState('Active'); // Active, Draft, Archived
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: General Info, 2: Variants & Inventory, 3: Custom Fields

  // Multi-Category dropdown state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Separate "Add New Category" modal inside Add Product
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatForm, setNewCatForm] = useState({ name: '', slug: '', order: 1 });

  // Form State
  const [form, setForm] = useState({
    name: '',
    categoryIds: [],
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

  // ══ Step 2: Canva Dynamic Variants & Inventory State ══
  const [enableVariants, setEnableVariants] = useState(false);
  const [showColorPreview, setShowColorPreview] = useState(true);
  const [variantColors, setVariantColors] = useState([]);
  const [colorInput, setColorInput] = useState('');
  const [colorCodes, setColorCodes] = useState({});
  const [colorCodesSec, setColorCodesSec] = useState({});
  const [variantSizes, setVariantSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState('');

  const [singlePricing, setSinglePricing] = useState({
    crossedPrice: 0,
    sellingPrice: 0,
    costPrice: 0,
    quantity: 0,
    weight: 0,
    sku: 'LK-PROD-' + Math.floor(100 + Math.random() * 900),
    barcode: '',
    hsCode: '',
    continueSellingOutOfStock: true,
  });

  const [combinationRows, setCombinationRows] = useState([]);
  const [barcodeAccordionOpen, setBarcodeAccordionOpen] = useState(false);
  const [continueSellingOutOfStock, setContinueSellingOutOfStock] = useState(false);

  const KNOWN_COLORS = {
    red: '#ef4444',
    green: '#10b981',
    blue: '#3b82f6',
    yellow: '#eab308',
    purple: '#8b5cf6',
    pink: '#ec4899',
    black: '#0f172a',
    white: '#ffffff',
    grey: '#6b7280',
    gray: '#6b7280',
    orange: '#f97316',
    brown: '#78350f',
    navy: '#1e3a8a',
    teal: '#14b8a6',
    maroon: '#831843',
    olive: '#65a30d',
    gold: '#f59e0b',
    silver: '#94a3b8',
    violet: '#7c3aed',
    magenta: '#c026d3',
    cyan: '#06b6d4',
    beige: '#d4b996',
    charcoal: '#374151',
    cream: '#fef3c7',
    lavender: '#c084fc',
  };

  const updateCombinations = (colors, sizes) => {
    let names = [];
    if (colors.length > 0 && sizes.length > 0) {
      colors.forEach(c => {
        sizes.forEach(s => {
          names.push(`${c}/${s}`);
        });
      });
    } else if (colors.length > 0) {
      names = [...colors];
    } else if (sizes.length > 0) {
      names = [...sizes];
    } else {
      names = [];
    }

    setCombinationRows(prev => {
      return names.map(name => {
        const existing = prev.find(p => p.name === name);
        if (existing) return existing;
        const randId = Math.random().toString(36).substring(2, 6).toUpperCase();
        return {
          id: Date.now() + '_' + name,
          name,
          crossedPrice: 0,
          sellingPrice: 0,
          costPrice: 0,
          weight: 0,
          quantity: 0,
          sku: `LK-${name.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase()}-${randId}`,
        };
      });
    });
  };

  const addColor = (col) => {
    const clean = col.trim().replace(/,/g, '');
    if (!clean) return;
    if (!variantColors.includes(clean)) {
      const nextColors = [...variantColors, clean];
      setVariantColors(nextColors);
      const lower = clean.toLowerCase();
      setColorCodes(prev => ({ ...prev, [lower]: KNOWN_COLORS[lower] || '#6366f1' }));
      updateCombinations(nextColors, variantSizes);
    }
    setColorInput('');
  };

  const removeColor = (color) => {
    const nextColors = variantColors.filter(c => c !== color);
    setVariantColors(nextColors);
    updateCombinations(nextColors, variantSizes);
  };

  const addSize = (sz) => {
    const clean = sz.trim().replace(/,/g, '');
    if (!clean) return;
    if (!variantSizes.includes(clean)) {
      const nextSizes = [...variantSizes, clean];
      setVariantSizes(nextSizes);
      updateCombinations(variantColors, nextSizes);
    }
    setSizeInput('');
  };

  const removeSize = (size) => {
    const nextSizes = variantSizes.filter(s => s !== size);
    setVariantSizes(nextSizes);
    updateCombinations(variantColors, nextSizes);
  };

  const updateRowField = (idx, field, val) => {
    setCombinationRows(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const deleteVariantRow = (idx) => {
    setCombinationRows(prev => prev.filter((_, i) => i !== idx));
  };

  const regenerateAllSkus = () => {
    setCombinationRows(prev => {
      return prev.map(r => ({
        ...r,
        sku: `LK-${r.name.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      }));
    });
  };

  const generateSingleSku = () => {
    setSinglePricing(prev => ({
      ...prev,
      sku: 'LK-PROD-' + Math.floor(100 + Math.random() * 900),
    }));
  };
  const fileInputRef = useRef(null);
  const modalBodyRef = useRef(null);

  // Effortless mousewheel / trackpad scrolling from anywhere in modal (including over textareas)
  const handleModalWheel = (e) => {
    if (!modalBodyRef.current) return;
    const target = e.target;
    if (target && target.tagName === 'TEXTAREA') {
      const hasOverflow = target.scrollHeight > target.clientHeight;
      if (hasOverflow) {
        const atTop = target.scrollTop <= 0 && e.deltaY < 0;
        const atBottom = (target.scrollTop + target.clientHeight >= target.scrollHeight - 1) && e.deltaY > 0;
        if (!atTop && !atBottom) return; // Allow internal textarea scroll
      }
    }
    modalBodyRef.current.scrollTop += e.deltaY;
  };

  // Close category dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Toggle Category selection (multi-select)
  const toggleCategory = (catId) => {
    setForm(prev => {
      const exists = prev.categoryIds.includes(catId);
      const updated = exists
        ? prev.categoryIds.filter(id => id !== catId)
        : [...prev.categoryIds, catId];
      return { ...prev, categoryIds: updated };
    });
    if (errors.categoryIds) {
      setErrors(prev => ({ ...prev, categoryIds: null }));
    }
  };

  const removeCategory = (catId) => {
    setForm(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.filter(id => id !== catId),
    }));
  };

  const clearAllCategories = (e) => {
    e.stopPropagation();
    setForm(prev => ({ ...prev, categoryIds: [] }));
  };

  // Handle adding new category from modal
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatForm.name.trim()) return;

    const payload = {
      name: newCatForm.name.trim(),
      slug: newCatForm.slug.trim() || newCatForm.name.trim().toLowerCase().replace(/\s+/g, '-'),
      order: parseInt(newCatForm.order, 10) || (categories?.length || 0) + 1,
      isActive: true,
    };

    const saved = await addCategory(payload);
    const newId = saved?.id || payload.name;

    // Automatically select the new category in multi-select
    setForm(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(newId) ? prev.categoryIds : [...prev.categoryIds, newId],
    }));
    if (errors.categoryIds) {
      setErrors(prev => ({ ...prev, categoryIds: null }));
    }

    setNewCatForm({ name: '', slug: '', order: (categories?.length || 0) + 2 });
    setShowAddCatModal(false);
  };

  // Validation for Step 1
  const validateStep1 = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!form.categoryIds || form.categoryIds.length === 0) {
      newErrors.categoryIds = 'Please select at least one category';
    }
    if (!form.shortDescription.trim() && !form.longDescription.trim()) {
      newErrors.shortDescription = 'Product description is required';
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

    const formatCanvaDate = (dateString) => {
    if (!dateString) return 'Oct 24, 2026 3:34 PM';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return 'Oct 24, 2026 3:34 PM';
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const day = d.getDate();
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
    } catch {
      return 'Oct 24, 2026 3:34 PM';
    }
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setActionMenuOpenId(null);
    setCurrentStep(1);
    setForm({
      name: '',
      categoryIds: categories.length > 0 ? [categories[0].id] : [],
      shortDescription: '',
      longDescription: '',
      image: '',
      imagePreview: '',
      price: 2000,
      originalPrice: 2500,
      sku: '',
      variants: [
        { size: 'M', stock: 5, price: 2000 },
        { size: 'L', stock: 5, price: 2000 },
        { size: 'XL', stock: 5, price: 2000 },
        { size: 'XXL', stock: 5, price: 2000 },
      ],
      tags: '',
      badge: 'New Arrival',
      status: 'Active',
    });
    setEnableVariants(false);
    setVariantColors([]);
    setVariantSizes([]);
    setColorCodes({});
    setColorCodesSec({});
    setCombinationRows([]);
    setSinglePricing({
      crossedPrice: 2500,
      sellingPrice: 2000,
      costPrice: 1500,
      quantity: 20,
      weight: 0.5,
      sku: 'LK-PROD-' + Math.floor(100 + Math.random() * 900),
      barcode: '',
      hsCode: '',
      continueSellingOutOfStock: true,
    });
    setErrors({});
    setShowAddModal(true);
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setActionMenuOpenId(null);
    setCurrentStep(1);

    setForm({
      name: prod.name || '',
      categoryIds: prod.categoryIds || (prod.categoryId ? [prod.categoryId] : (categories.length > 0 ? [categories[0].id] : [])),
      shortDescription: prod.description || prod.shortDescription || 'Premium designer garment tailored with luxury fabric and exquisite attention to detail.',
      longDescription: prod.longDescription || 'Elevate your wardrobe with timeless style, impeccable stitching, and comfortable all-day wear.',
      image: prod.image || '/images/kurtha-charcoal.jpg',
      imagePreview: prod.image || '/images/kurtha-charcoal.jpg',
      price: prod.price || prod.regular_price || 2000,
      originalPrice: prod.originalPrice || prod.crossedPrice || 2500,
      sku: prod.sku || '',
      variants: prod.variants || [
        { size: 'M', stock: 5, price: prod.price || 2000 },
        { size: 'L', stock: 5, price: prod.price || 2000 },
        { size: 'XL', stock: 5, price: prod.price || 2000 },
        { size: 'XXL', stock: 5, price: prod.price || 2000 },
      ],
      tags: prod.tags || '',
      badge: prod.badge || 'New Arrival',
      status: prod.status || 'Active',
    });

    if (prod.enableVariants || (prod.combinationRows && prod.combinationRows.length > 0) || (prod.variantColors && prod.variantColors.length > 0)) {
      setEnableVariants(true);
      setVariantColors(prod.variantColors || []);
      setColorCodes(prod.colorCodes || {});
      setColorCodesSec(prod.colorCodesSec || {});
      setVariantSizes(prod.variantSizes || []);
      setCombinationRows(prod.combinationRows || []);
    } else {
      setEnableVariants(false);
      setVariantColors([]);
      setVariantSizes([]);
      setColorCodes({});
      setColorCodesSec({});
      setCombinationRows([]);
    }

    setSinglePricing(prod.singlePricing || {
      crossedPrice: prod.originalPrice || 2500,
      sellingPrice: prod.price || 2000,
      costPrice: prod.costPrice || 1500,
      quantity: prod.inventory || 20,
      weight: prod.weight || 0.5,
      sku: prod.sku || ('LK-PROD-' + Math.floor(100 + Math.random() * 900)),
      barcode: prod.barcode || '',
      hsCode: prod.hsCode || '',
      continueSellingOutOfStock: prod.continueSellingOutOfStock ?? true,
    });

    setErrors({});
    setShowAddModal(true);
  };
  const handleFinalSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    let totalStock = 0;
    let finalPrice = 0;
    let finalOriginalPrice = 0;

    if (enableVariants && combinationRows.length > 0) {
      totalStock = combinationRows.reduce((acc, r) => acc + (parseInt(r.quantity, 10) || 0), 0);
      finalPrice = combinationRows[0]?.sellingPrice || form.price || 0;
      finalOriginalPrice = combinationRows[0]?.crossedPrice || form.originalPrice || 0;
    } else {
      totalStock = parseInt(singlePricing.quantity, 10) || 0;
      finalPrice = singlePricing.sellingPrice || form.price || 0;
      finalOriginalPrice = singlePricing.crossedPrice || form.originalPrice || 0;
    }

    const sizesObj = enableVariants
      ? combinationRows.reduce((acc, r) => {
          acc[r.name] = parseInt(r.quantity, 10) || 0;
          return acc;
        }, {})
      : { All: totalStock };

    const productPayload = {
      name: form.name,
      categoryId: form.categoryIds[0] || '',
      categoryIds: form.categoryIds,
      description: form.shortDescription,
      longDescription: form.longDescription,
      image: form.image || form.imagePreview || '/images/kurtha-charcoal.jpg',
      price: Number(finalPrice) || 0,
      originalPrice: Number(finalOriginalPrice) || 0,
      status: form.status || 'Active',
      inventory: totalStock,
      sizes: sizesObj,
      // Full Step 2 variant & pricing configuration
      enableVariants,
      variantColors,
      colorCodes,
      colorCodesSec,
      variantSizes,
      combinationRows,
      singlePricing,
      // Step 3 details
      tags: form.tags,
      badge: form.badge,
    };

    if (editingProduct && editingProduct.id) {
      updateProduct({
        ...editingProduct,
        ...productPayload,
        id: editingProduct.id,
      });
    } else {
      addProduct({
        ...productPayload,
        createdAt: new Date().toISOString(),
      });
    }

    setShowAddModal(false);
    setEditingProduct(null);
    setCurrentStep(1);
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
            onClick={openAddProduct}
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

      {/* ══ 4. PRODUCTS TABLE & EMPTY STATE (CANVA PIXEL-PERFECT) ══ */}
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
                // Calculate variant count and stock
                const isVariants = p.enableVariants && Array.isArray(p.combinationRows) && p.combinationRows.length > 0;
                const variantCount = isVariants ? p.combinationRows.length : (Array.isArray(p.variants) && p.variants.length > 0 ? p.variants.length : 0);
                const totalStock = isVariants
                  ? p.combinationRows.reduce((a, b) => a + Number(b.quantity || 0), 0)
                  : (p.inventory !== undefined ? Number(p.inventory) : Object.values(p.sizes || {}).reduce((a, b) => a + Number(b || 0), 0));

                // Canva Badge format: "13 FOR 4 VARIANTS" or "20 FOR 2 VARIANTS" or "20 IN STOCK"
                const inventoryBadge = (isVariants || variantCount > 1)
                  ? `${totalStock} FOR ${variantCount} VARIANTS`
                  : `${totalStock} IN STOCK`;

                return (
                  <tr
                    key={p.id}
                    onClick={() => openEditProduct(p)}
                    style={{
                      borderBottom: '1px solid #f3f4f6',
                      transition: 'background 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                  >
                    <td style={{ padding: '12px 16px' }} onClick={e => e.stopPropagation()}>
                      <input type="checkbox" style={{ accentColor: '#7952eb', borderRadius: '4px', cursor: 'pointer' }} />
                    </td>
                    <td style={{ padding: '12px 8px', color: '#6b7280', fontSize: '13px', fontWeight: 500 }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={p.image || '/images/kurtha-charcoal.jpg'}
                          alt={p.name}
                          style={{
                            width: '40px',
                            height: '48px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px', letterSpacing: '-0.01em' }}>
                          {p.name}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#64748b' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#94a3b8" stroke="#94a3b8" strokeWidth="1">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span>0 (0)</span>
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                      Rs {Number(p.price || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        background: '#e6f9ed',
                        border: '1px solid #bbf7d0',
                        color: '#10b981',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}>
                        {inventoryBadge}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        background: '#e6f9ed',
                        border: '1px solid #bbf7d0',
                        color: '#10b981',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                      }}>
                        {p.status ? p.status.toUpperCase() : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                      {formatCanvaDate(p.createdAt)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          type="button"
                          onClick={() => setActionMenuOpenId(actionMenuOpenId === p.id ? null : p.id)}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            border: '1px solid #7c3aed',
                            background: actionMenuOpenId === p.id ? '#f5f3ff' : '#ffffff',
                            color: '#7c3aed',
                            fontWeight: 800,
                            fontSize: '16px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            lineHeight: 1,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          ···
                        </button>
                        {actionMenuOpenId === p.id && (
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            top: '34px',
                            background: '#ffffff',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0',
                            padding: '4px',
                            zIndex: 50,
                            minWidth: '130px',
                          }}>
                            <button
                              type="button"
                              onClick={() => { setActionMenuOpenId(null); openEditProduct(p); }}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#0f172a',
                                fontSize: '12.5px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => { setActionMenuOpenId(null); deleteProduct(p.id); }}
                              style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                color: '#ef4444',
                                fontSize: '12.5px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textAlign: 'left',
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Canva Pagination Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderTop: '1px solid #e5e7eb',
          background: '#ffffff',
          fontSize: '12px',
          color: '#6b7280',
        }}>
          <div>
            1 - {filteredProducts.length} / {filteredProducts.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              disabled
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                color: '#9ca3af',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
            >
              ‹
            </button>
            <button
              type="button"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: 'none',
                background: '#7952eb',
                color: '#ffffff',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              1
            </button>
            <button
              type="button"
              disabled
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                background: '#ffffff',
                color: '#9ca3af',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* ══ 5. CANVA 3-STEP "ADD PRODUCT" MODAL (PIXEL PERFECT) ══ */}
      {showAddModal && (
        <div
          onWheel={handleModalWheel}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            onWheel={handleModalWheel}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            
            {/* Modal Header */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {editingProduct ? 'Edit Product' : 'Add Product'}
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
                  background: '#7952eb',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {currentStep > 1 ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : '1'}
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: currentStep >= 1 ? '#7952eb' : '#64748b', letterSpacing: '0.04em' }}>
                    STEP 1
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: currentStep >= 1 ? '#0f172a' : '#64748b' }}>
                    General Information
                  </div>
                </div>
              </div>

              {/* Separator Line 1 -> 2 */}
              <div style={{
                height: '2px',
                flex: '0 0 40px',
                background: currentStep >= 2 ? '#7952eb' : '#e2e8f0',
                transition: 'background 0.2s ease',
              }} />

              {/* Step 2 Item */}
              <div
                onClick={() => {
                  if (editingProduct || validateStep1()) setCurrentStep(2);
                }}
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
                  background: currentStep === 2 ? '#ffffff' : (currentStep > 2 ? '#7952eb' : '#f1f5f9'),
                  border: currentStep === 2 ? '2px solid #7952eb' : (currentStep > 2 ? 'none' : '1px solid #cbd5e1'),
                  color: currentStep === 2 ? '#7952eb' : (currentStep > 2 ? '#ffffff' : '#94a3b8'),
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {currentStep > 2 ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : '2'}
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, color: currentStep >= 2 ? '#7952eb' : '#94a3b8', letterSpacing: '0.04em' }}>
                    STEP 2
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: currentStep >= 2 ? '#0f172a' : '#94a3b8' }}>
                    Variants & Inventory
                  </div>
                </div>
              </div>

              {/* Separator Line 2 -> 3 */}
              <div style={{
                height: '2px',
                flex: '0 0 40px',
                background: currentStep >= 3 ? '#7952eb' : '#e2e8f0',
                transition: 'background 0.2s ease',
              }} />

              {/* Step 3 Item */}
              <div
                onClick={() => {
                  if (editingProduct || validateStep1()) setCurrentStep(3);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: currentStep > 2 ? 'pointer' : 'default',
                  flex: 1,
                  opacity: currentStep === 3 ? 1 : 0.6,
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: currentStep === 3 ? '#7952eb' : '#f1f5f9',
                  border: currentStep === 3 ? 'none' : '1px solid #cbd5e1',
                  color: currentStep === 3 ? '#ffffff' : '#94a3b8',
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

            {/* Modal Body (Scrollable & Wheel Enabled Anywhere) */}
            <div
              ref={modalBodyRef}
              onWheel={handleModalWheel}
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: '1 1 auto',
                minHeight: 0,
                maxHeight: 'calc(90vh - 130px)',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f8fafc',
              }}
            >
              
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

                  {/* Field 2: Categories (CANVA EXACT MULTI-SELECT CHIPS + MODAL POPUP) */}
                  <div style={{ marginBottom: '16px' }} ref={dropdownRef}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Categories <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      
                      {/* Multi-Select Box */}
                      <div
                        onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                        style={{
                          flex: 1,
                          position: 'relative',
                          minHeight: '44px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: errors.categoryIds ? '1.5px solid #ef4444' : '1px solid #e2e8f0',
                          background: '#ffffff',
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          boxSizing: 'border-box',
                        }}
                      >
                        {/* Selected Category Chips (Exact Canva design) */}
                        {form.categoryIds.length > 0 ? (
                          form.categoryIds.map(catId => {
                            const cat = (categories || []).find(c => String(c.id) === String(catId) || c.name === catId);
                            const displayName = cat ? cat.name : catId;
                            return (
                              <span
                                key={catId}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 8px',
                                  background: '#f1f5f9',
                                  borderRadius: '6px',
                                  fontSize: '12.5px',
                                  color: '#1e293b',
                                  fontWeight: 500,
                                }}
                              >
                                <span>{displayName}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeCategory(catId);
                                  }}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '0 2px',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    lineHeight: 1,
                                    fontWeight: 700,
                                  }}
                                >
                                  ✕
                                </button>
                              </span>
                            );
                          })
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                            Select product categories
                          </span>
                        )}

                        {/* Right side icons: Clear All + Chevron Up/Down */}
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                          {form.categoryIds.length > 0 && (
                            <button
                              type="button"
                              onClick={clearAllCategories}
                              title="Clear all"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '2px',
                                fontSize: '12px',
                                lineHeight: 1,
                              }}
                            >
                              ✕
                            </button>
                          )}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="7 15 12 20 17 15" />
                            <polyline points="7 9 12 4 17 9" />
                          </svg>
                        </div>

                        {/* Dropdown Menu */}
                        {categoryDropdownOpen && (
                          <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '4px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            zIndex: 50,
                            maxHeight: '220px',
                            overflowY: 'auto',
                            padding: '4px 0',
                          }}>
                            {(categories || []).map(cat => {
                              const isSelected = form.categoryIds.some(id => String(id) === String(cat.id) || id === cat.name);
                              return (
                                <div
                                  key={cat.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCategory(cat.id);
                                  }}
                                  style={{
                                    padding: '8px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    background: isSelected ? '#f8fafc' : 'transparent',
                                    fontSize: '13px',
                                    color: isSelected ? '#7952eb' : '#0f172a',
                                    fontWeight: isSelected ? 600 : 500,
                                    transition: 'background 0.12s ease',
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? '#f8fafc' : 'transparent'; }}
                                >
                                  <span>{cat.name}</span>
                                  {isSelected && (
                                    <span style={{ color: '#7952eb', fontWeight: 700, fontSize: '13px' }}>✓</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* + Add Button (Opens Real Add Category Modal) */}
                      <button
                        type="button"
                        onClick={() => setShowAddCatModal(true)}
                        style={{
                          background: '#f3effe',
                          color: '#7952eb',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '11px 18px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.15s ease',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                      >
                        + Add
                      </button>
                    </div>

                    {errors.categoryIds && (
                      <span style={{ fontSize: '11px', color: '#ef4444', display: 'block', marginTop: '4px' }}>
                        {errors.categoryIds}
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
                      onWheel={(e) => {
                        const target = e.currentTarget;
                        if (target.scrollHeight <= target.clientHeight) {
                          if (modalBodyRef.current) modalBodyRef.current.scrollTop += e.deltaY;
                        } else {
                          const atTop = target.scrollTop <= 0 && e.deltaY < 0;
                          const atBottom = (target.scrollTop + target.clientHeight >= target.scrollHeight - 1) && e.deltaY > 0;
                          if ((atTop || atBottom) && modalBodyRef.current) modalBodyRef.current.scrollTop += e.deltaY;
                        }
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
                      onWheel={(e) => {
                        const target = e.currentTarget;
                        if (target.scrollHeight <= target.clientHeight) {
                          if (modalBodyRef.current) modalBodyRef.current.scrollTop += e.deltaY;
                        } else {
                          const atTop = target.scrollTop <= 0 && e.deltaY < 0;
                          const atBottom = (target.scrollTop + target.clientHeight >= target.scrollHeight - 1) && e.deltaY > 0;
                          if ((atTop || atBottom) && modalBodyRef.current) modalBodyRef.current.scrollTop += e.deltaY;
                        }
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
                  {/* Card Container for Enable Product Variants */}
                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    background: '#ffffff',
                    padding: '18px 20px',
                    marginBottom: '20px',
                  }}>
                    {/* Top Row: Title + Toggle Switch */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: enableVariants ? '18px' : '0' }}>
                      <div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
                          Enable Product Variants
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                          Whenever you have multiple color/sizes/specs for any product
                        </div>
                      </div>

                      {/* Toggle Switch Pill */}
                      <div
                        onClick={() => setEnableVariants(!enableVariants)}
                        style={{
                          width: '64px',
                          height: '30px',
                          borderRadius: '15px',
                          background: enableVariants ? '#10b981' : '#e2e8f0',
                          position: 'relative',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                          boxSizing: 'border-box',
                          transition: 'background 0.2s ease',
                          userSelect: 'none',
                        }}
                      >
                        {enableVariants ? (
                          <>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#ffffff', marginLeft: '9px' }}>
                              ON
                            </span>
                            <div style={{
                              position: 'absolute',
                              right: '3px',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              transition: 'all 0.2s ease',
                            }} />
                          </>
                        ) : (
                          <>
                            <div style={{
                              position: 'absolute',
                              left: '3px',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#ffffff',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                              transition: 'all 0.2s ease',
                            }} />
                            <span style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', marginLeft: 'auto', marginRight: '8px' }}>
                              OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* ─── WHEN ENABLE VARIANTS IS ON: Variant Selectors inside Card ─── */}
                    {enableVariants && (
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        {/* Choose Variant (Color Tags) */}
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                            Choose Variant
                          </label>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '6px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            background: '#ffffff',
                            minHeight: '42px',
                            boxSizing: 'border-box',
                          }}>
                            {variantColors.map(color => (
                              <span
                                key={color}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 8px',
                                  background: '#f1f5f9',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: '#0f172a',
                                }}
                              >
                                <span>{color}</span>
                                <button
                                  type="button"
                                  onClick={() => removeColor(color)}
                                  style={{ background: 'none', border: 'none', padding: 0, color: '#64748b', cursor: 'pointer', fontSize: '12px', lineHeight: 1 }}
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                            <input
                              type="text"
                              placeholder={variantColors.length === 0 ? "eg. Red, Green" : "Add color..."}
                              value={colorInput}
                              onChange={e => setColorInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ',') {
                                  e.preventDefault();
                                  addColor(colorInput);
                                }
                              }}
                              onBlur={() => { if (colorInput.trim()) addColor(colorInput); }}
                              style={{
                                border: 'none',
                                outline: 'none',
                                fontSize: '13px',
                                flex: 1,
                                minWidth: '120px',
                                padding: '4px',
                                background: 'transparent',
                              }}
                            />
                          </div>
                        </div>

                        {/* Show Color Preview Toggle */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                              Show color preview
                            </span>
                            <div
                              onClick={() => setShowColorPreview(!showColorPreview)}
                              style={{
                                width: '38px',
                                height: '20px',
                                borderRadius: '10px',
                                background: showColorPreview ? '#10b981' : '#e2e8f0',
                                position: 'relative',
                                cursor: 'pointer',
                                padding: '1px',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'background 0.2s ease',
                              }}
                            >
                              {showColorPreview ? (
                                <>
                                  <span style={{ fontSize: '8px', fontWeight: 800, color: '#ffffff', marginLeft: '5px' }}>ON</span>
                                  <div style={{ position: 'absolute', right: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff' }} />
                                </>
                              ) : (
                                <>
                                  <div style={{ position: 'absolute', left: '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff' }} />
                                  <span style={{ fontSize: '8px', fontWeight: 800, color: '#64748b', marginLeft: 'auto', marginRight: '5px' }}>OFF</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            Enable this to display the color as a visual preview instead of text (e.g. Black, Pink).
                          </div>
                        </div>

                        {/* Color Pickers for Each Selected Variant Color */}
                        {showColorPreview && variantColors.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {variantColors.map(color => {
                              const hex = colorCodes[color.toLowerCase()] || '#6366f1';
                              const secHex = colorCodesSec[color.toLowerCase()] || '';
                              return (
                                <div key={color} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                                    Color code for {color}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {/* Primary Color Box */}
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      background: '#ffffff',
                                    }}>
                                      <input
                                        type="color"
                                        value={hex}
                                        onChange={e => setColorCodes(prev => ({ ...prev, [color.toLowerCase()]: e.target.value }))}
                                        style={{
                                          width: '20px',
                                          height: '20px',
                                          border: 'none',
                                          borderRadius: '50%',
                                          cursor: 'pointer',
                                          padding: 0,
                                          background: 'none',
                                        }}
                                      />
                                      <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                                        {hex}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setColorCodes(prev => ({ ...prev, [color.toLowerCase()]: '#6366f1' }))}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontSize: '11px' }}
                                      >
                                        ✕
                                      </button>
                                    </div>

                                    {/* Secondary Color Box (optional) */}
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      border: '1px solid #e2e8f0',
                                      borderRadius: '6px',
                                      padding: '4px 8px',
                                      background: '#f8fafc',
                                    }}>
                                      <input
                                        type="color"
                                        value={secHex || '#ffffff'}
                                        onChange={e => setColorCodesSec(prev => ({ ...prev, [color.toLowerCase()]: e.target.value }))}
                                        style={{
                                          width: '20px',
                                          height: '20px',
                                          border: 'none',
                                          borderRadius: '50%',
                                          cursor: 'pointer',
                                          padding: 0,
                                          background: 'none',
                                        }}
                                      />
                                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        {secHex ? secHex : '2nd (optional)'}
                                      </span>
                                      {secHex && (
                                        <button
                                          type="button"
                                          onClick={() => setColorCodesSec(prev => ({ ...prev, [color.toLowerCase()]: '' }))}
                                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontSize: '11px' }}
                                        >
                                          ✕
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Choose Size */}
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                            Choose Size
                          </label>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '6px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            background: '#ffffff',
                            minHeight: '42px',
                            boxSizing: 'border-box',
                          }}>
                            {variantSizes.map(size => (
                              <span
                                key={size}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 8px',
                                  background: '#f1f5f9',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: '#0f172a',
                                }}
                              >
                                <span>{size}</span>
                                <button
                                  type="button"
                                  onClick={() => removeSize(size)}
                                  style={{ background: 'none', border: 'none', padding: 0, color: '#64748b', cursor: 'pointer', fontSize: '12px', lineHeight: 1 }}
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                            <input
                              type="text"
                              placeholder={variantSizes.length === 0 ? "eg. M, X, XL" : "Add size..."}
                              value={sizeInput}
                              onChange={e => setSizeInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ',') {
                                  e.preventDefault();
                                  addSize(sizeInput);
                                }
                              }}
                              onBlur={() => { if (sizeInput.trim()) addSize(sizeInput); }}
                              style={{
                                border: 'none',
                                outline: 'none',
                                fontSize: '13px',
                                flex: 1,
                                minWidth: '100px',
                                padding: '4px',
                                background: 'transparent',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ─── WHEN ENABLE VARIANTS IS OFF: Single Product Grid ─── */}
                  {!enableVariants && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
                        {/* Crossed Price */}
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Crossed Price
                          </label>
                          <input
                            type="number"
                            value={singlePricing.crossedPrice}
                            onChange={e => setSinglePricing({ ...singlePricing, crossedPrice: parseInt(e.target.value, 10) || 0 })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13.5px', boxSizing: 'border-box' }}
                          />
                        </div>

                        {/* Selling Price * */}
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Selling Price <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="number"
                            value={singlePricing.sellingPrice}
                            onChange={e => setSinglePricing({ ...singlePricing, sellingPrice: parseInt(e.target.value, 10) || 0 })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13.5px', boxSizing: 'border-box' }}
                          />
                        </div>

                        {/* Cost Price */}
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Cost Price
                          </label>
                          <input
                            type="number"
                            value={singlePricing.costPrice}
                            onChange={e => setSinglePricing({ ...singlePricing, costPrice: parseInt(e.target.value, 10) || 0 })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13.5px', boxSizing: 'border-box' }}
                          />
                        </div>

                        {/* Quantity */}
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={singlePricing.quantity}
                            onChange={e => setSinglePricing({ ...singlePricing, quantity: parseInt(e.target.value, 10) || 0 })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13.5px', boxSizing: 'border-box' }}
                          />
                        </div>

                        {/* Weight (per unit, in KG) * */}
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Weight (per unit, in KG) <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={singlePricing.weight}
                            onChange={e => setSinglePricing({ ...singlePricing, weight: parseFloat(e.target.value) || 0 })}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13.5px', boxSizing: 'border-box' }}
                          />
                        </div>

                        {/* SKU with refresh icon */}
                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            SKU
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              placeholder="eg: PROD-NP-101"
                              value={singlePricing.sku}
                              onChange={e => setSinglePricing({ ...singlePricing, sku: e.target.value })}
                              style={{ width: '100%', padding: '9px 36px 9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13.5px', boxSizing: 'border-box' }}
                            />
                            <button
                              type="button"
                              onClick={generateSingleSku}
                              title="Generate new unique SKU"
                              style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: '#7952eb',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              ⟳
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── WHEN ENABLE VARIANTS IS ON: Action Buttons & Dynamic Table ─── */}
                  {enableVariants && (
                    <div>
                      {/* Generate SKUs Button */}
                      <div style={{ marginBottom: '14px' }}>
                        <button
                          type="button"
                          onClick={regenerateAllSkus}
                          style={{
                            background: '#f5f3ff',
                            border: '1px solid #ddd6fe',
                            color: '#7952eb',
                            borderRadius: '8px',
                            padding: '7px 14px',
                            fontSize: '12.5px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>⟳</span> Generate SKUs
                        </button>
                      </div>

                      {/* Dynamic Combinations Table */}
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflowX: 'auto', marginBottom: '16px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: 700 }}>
                              <th style={{ padding: '10px 14px', textAlign: 'left' }}>VARIANT</th>
                              <th style={{ padding: '10px 10px', textAlign: 'left' }}>CROSSED PRICE</th>
                              <th style={{ padding: '10px 10px', textAlign: 'left' }}>SELLING PRICE</th>
                              <th style={{ padding: '10px 10px', textAlign: 'left' }}>COST PRICE</th>
                              <th style={{ padding: '10px 10px', textAlign: 'left' }}>WEIGHT</th>
                              <th style={{ padding: '10px 10px', textAlign: 'left' }}>QUANTITY</th>
                              <th style={{ padding: '10px 10px', textAlign: 'left' }}>SKU</th>
                              <th style={{ padding: '10px 10px', textAlign: 'center', width: '36px' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {combinationRows.length === 0 ? (
                              <tr>
                                <td colSpan={8} style={{ padding: '36px 14px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                  No variants created yet. Enter variant colors or sizes above to dynamically generate combinations.
                                </td>
                              </tr>
                            ) : (
                              combinationRows.map((row, idx) => (
                                <tr key={row.id || row.name} style={{ borderBottom: idx < combinationRows.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                  {/* Variant Name & Image Icon */}
                                  <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <span style={{ color: '#94a3b8' }}>🖼️</span>
                                      <span>{row.name}</span>
                                    </div>
                                  </td>

                                  {/* Crossed Price */}
                                  <td style={{ padding: '6px 8px' }}>
                                    <input
                                      type="number"
                                      value={row.crossedPrice}
                                      onChange={e => updateRowField(idx, 'crossedPrice', parseInt(e.target.value, 10) || 0)}
                                      style={{ width: '75px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}
                                    />
                                  </td>

                                  {/* Selling Price */}
                                  <td style={{ padding: '6px 8px' }}>
                                    <input
                                      type="number"
                                      value={row.sellingPrice}
                                      onChange={e => updateRowField(idx, 'sellingPrice', parseInt(e.target.value, 10) || 0)}
                                      style={{ width: '75px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}
                                    />
                                  </td>

                                  {/* Cost Price */}
                                  <td style={{ padding: '6px 8px' }}>
                                    <input
                                      type="number"
                                      value={row.costPrice}
                                      onChange={e => updateRowField(idx, 'costPrice', parseInt(e.target.value, 10) || 0)}
                                      style={{ width: '75px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}
                                    />
                                  </td>

                                  {/* Weight */}
                                  <td style={{ padding: '6px 8px' }}>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={row.weight}
                                      onChange={e => updateRowField(idx, 'weight', parseFloat(e.target.value) || 0)}
                                      style={{ width: '65px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}
                                    />
                                  </td>

                                  {/* Quantity */}
                                  <td style={{ padding: '6px 8px' }}>
                                    <input
                                      type="number"
                                      value={row.quantity}
                                      onChange={e => updateRowField(idx, 'quantity', parseInt(e.target.value, 10) || 0)}
                                      style={{ width: '65px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}
                                    />
                                  </td>

                                  {/* SKU */}
                                  <td style={{ padding: '6px 8px' }}>
                                    <input
                                      type="text"
                                      value={row.sku}
                                      onChange={e => updateRowField(idx, 'sku', e.target.value)}
                                      placeholder="SKU"
                                      style={{ width: '110px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                    />
                                  </td>

                                  {/* Delete Icon */}
                                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => deleteVariantRow(idx)}
                                      title="Delete variant row"
                                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', fontSize: '14px' }}
                                    >
                                      🗑️
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Accordion: Barcode & HS Code */}
                  <div style={{ marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setBarcodeAccordionOpen(!barcodeAccordionOpen)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#7952eb',
                        fontSize: '12.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: '4px 0',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>Barcode & HS code (optional)</span>
                      <span>{barcodeAccordionOpen ? '▴' : '▾'}</span>
                    </button>

                    {barcodeAccordionOpen && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>Barcode</label>
                          <input
                            type="text"
                            placeholder="e.g. 123456789012"
                            value={singlePricing.barcode}
                            onChange={e => setSinglePricing({ ...singlePricing, barcode: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>HS Code</label>
                          <input
                            type="text"
                            placeholder="e.g. 6204.42"
                            value={singlePricing.hsCode}
                            onChange={e => setSinglePricing({ ...singlePricing, hsCode: e.target.value })}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Continue selling even after product is out of stock Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                    <input
                      type="checkbox"
                      id="continueSelling"
                      checked={enableVariants ? continueSellingOutOfStock : singlePricing.continueSellingOutOfStock}
                      onChange={e => {
                        if (enableVariants) {
                          setContinueSellingOutOfStock(e.target.checked);
                        } else {
                          setSinglePricing({ ...singlePricing, continueSellingOutOfStock: e.target.checked });
                        }
                      }}
                      style={{ accentColor: '#7952eb', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="continueSelling" style={{ fontSize: '13px', color: '#374151', cursor: 'pointer' }}>
                      Continue selling even after product is out of stock
                    </label>
                  </div>

                  {/* Step 2 Footer Navigation (EXACT MATCH) */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #7952eb',
                        color: '#7952eb',
                        borderRadius: '8px',
                        padding: '9px 18px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Previous: General Information
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      style={{
                        background: '#7952eb',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 22px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(121, 82, 235, 0.3)',
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
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
                      <div>
                        <strong>Categories:</strong>{' '}
                        {form.categoryIds.map(id => {
                          const cat = (categories || []).find(c => String(c.id) === String(id) || c.name === id);
                          return cat ? cat.name : id;
                        }).join(', ') || 'None'}
                      </div>
                      <div><strong>Pricing Mode:</strong> {enableVariants ? 'Multiple Variants' : 'Single Product'}</div>
                      <div><strong>Price:</strong> NPR {(enableVariants ? (combinationRows[0]?.sellingPrice || 0) : singlePricing.sellingPrice).toLocaleString()}</div>
                      <div><strong>Total Stock:</strong> {enableVariants ? combinationRows.reduce((a, b) => a + (parseInt(b.quantity, 10) || 0), 0) : singlePricing.quantity} units</div>
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
                      {editingProduct ? 'Save Changes' : 'Publish Product'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ══ 6. NESTED "ADD CATEGORY" MODAL (PIXEL PERFECT REPLACEMENT FOR PROMPT) ══ */}
      {showAddCatModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1200, // Above Add Product modal
          padding: '20px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Add New Category
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCatModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '18px', cursor: 'pointer', padding: 0 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Category Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Silk Blend Kurthas"
                  value={newCatForm.name}
                  onChange={e => setNewCatForm({ ...newCatForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13.5px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Slug
                  </label>
                  <input
                    type="text"
                    placeholder="silk-blend"
                    value={newCatForm.slug}
                    onChange={e => setNewCatForm({ ...newCatForm, slug: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13.5px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={newCatForm.order}
                    onChange={e => setNewCatForm({ ...newCatForm, order: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13.5px', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCatModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#7952eb', color: '#ffffff', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
