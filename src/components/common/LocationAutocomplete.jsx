import { useState, useRef, useEffect } from 'react';
import { nepalLocations } from '../../data/districts';

export default function LocationAutocomplete({
  value = '',
  onChange,
  placeholder = 'Type or search city / district (e.g. Sunsari, Pokhara)...',
  required = false,
  style = {},
  inputStyle = {},
  theme = 'light',
}) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const cleanQ = query.trim().toLowerCase();
  const suggestions = cleanQ
    ? nepalLocations.filter(loc => loc.toLowerCase().includes(cleanQ)).sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(cleanQ);
        const bStarts = b.toLowerCase().startsWith(cleanQ);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return a.localeCompare(b);
      }).slice(0, 15)
    : nepalLocations.slice(0, 12);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item) => {
    setQuery(item);
    onChange(item);
    setIsOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[highlightIndex]) {
        handleSelect(suggestions[highlightIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const isLight = theme === 'light';

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      <input
        type="text"
        required={required}
        value={query}
        placeholder={placeholder}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightIndex(0);
        }}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          padding: '8px 10px',
          borderRadius: '6px',
          border: isLight ? '1px solid #cbd5e1' : '1px solid var(--marigold, #7c3aed)',
          background: isLight ? '#ffffff' : '#140c08',
          color: isLight ? '#0f172a' : '#ffffff',
          fontSize: '0.84rem',
          outline: 'none',
          ...inputStyle,
        }}
        autoComplete="off"
      />

      {isOpen && suggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: isLight ? '#ffffff' : '#20150e',
            border: isLight ? '1px solid #e2e8f0' : '1px solid var(--marigold, #7c3aed)',
            borderRadius: '8px',
            boxShadow: isLight ? '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' : '0 10px 25px rgba(0,0,0,0.5)',
            maxHeight: '220px',
            overflowY: 'auto',
            zIndex: 9999,
          }}
        >
          {suggestions.map((item, idx) => {
            const isHighlighted = idx === highlightIndex;
            return (
              <div
                key={item}
                onMouseDown={() => handleSelect(item)}
                onMouseEnter={() => setHighlightIndex(idx)}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.84rem',
                  color: isLight
                    ? (isHighlighted ? '#7c3aed' : '#1e293b')
                    : (isHighlighted ? '#fff' : 'rgba(255,255,255,0.85)'),
                  background: isLight
                    ? (isHighlighted ? '#f5f3ff' : 'transparent')
                    : (isHighlighted ? 'rgba(124, 58, 237, 0.4)' : 'transparent'),
                  cursor: 'pointer',
                  borderBottom: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontWeight: isHighlighted ? 600 : 400,
                }}
              >
                <span>{item}</span>
                {item.toLowerCase().startsWith(cleanQ) && cleanQ && (
                  <span style={{ fontSize: '0.72rem', color: isLight ? '#7c3aed' : 'var(--marigold, #c084fc)', fontWeight: 700 }}>
                    match
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
