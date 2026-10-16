import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Search, X, Sparkles, ArrowRight, Tag } from 'lucide-react';

export default function CommandSearchDialog({ isOpen, onClose }) {
  const { products } = useStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle ESC and keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.fabricType.toLowerCase().includes(query.toLowerCase()) ||
        p.pieces.toLowerCase().includes(query.toLowerCase())
      )
    : products.slice(0, 4);

  const quickLinks = [
    { label: "Bhai Tika Signature Look", path: "/#collection" },
    { label: "3-Piece Georgette Sets", path: "/#collection" },
    { label: "Customer Reviews", path: "/#reviews" }
  ];

  return (
    <div className="command-dialog-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="command-dialog-container" onClick={(e) => e.stopPropagation()}>
        <div className="command-input-row">
          <Search size={18} className="command-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="command-search-input"
            placeholder="Search festive kurthas, fabrics (georgette, silk), sizes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="command-clear-btn" aria-label="Clear search">
              <X size={16} />
            </button>
          )}
          <kbd className="command-kbd">ESC</kbd>
        </div>

        <div className="command-results-body">
          {/* Quick Filter Links */}
          <div className="command-quick-links">
            <span className="command-group-heading">
              <Sparkles size={12} />
              <span>Suggested Collections</span>
            </span>
            <div className="command-pills-row">
              {quickLinks.map((ql, i) => (
                <button
                  key={i}
                  type="button"
                  className="command-quick-pill"
                  onClick={() => {
                    navigate(ql.path);
                    onClose();
                  }}
                >
                  <Tag size={11} />
                  <span>{ql.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Items */}
          <div className="command-items-list">
            <span className="command-group-heading">
              {query ? `Matching Festive Sets (${filtered.length})` : 'Popular Festive Looks'}
            </span>

            {filtered.length === 0 ? (
              <div className="command-empty-state">
                No festive kurtha found matching "{query}". Try "georgette", "silk", or "3-piece".
              </div>
            ) : (
              filtered.map(product => (
                <div
                  key={product.id}
                  className="command-result-item"
                  onClick={() => {
                    navigate(`/product/${product.id}`);
                    onClose();
                  }}
                >
                  <img src={product.image} alt={product.name} className="command-item-thumb" />
                  <div className="command-item-details">
                    <span className="command-item-title">{product.name}</span>
                    <span className="command-item-fabric">{product.fabricType} • {product.pieces}</span>
                  </div>
                  <div className="command-item-price-wrap">
                    <span className="command-item-price">Rs. {product.price.toLocaleString()}</span>
                    <ArrowRight size={14} className="command-item-arrow" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>


      </div>
    </div>
  );
}
