import { useState, useRef, useEffect } from 'react';
import { nepalLocations } from '../../data/districts';

export default function LocationAutocomplete({
  value = '',
  onChange,
  placeholder = 'Type to search city / district (e.g. Sunsari, Pokhara)...',
  required = false,
  style = {},
  inputStyle = {},
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
      }).slice(0, 10)
    : nepalLocations.slice(0, 8);

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
            background: '#20150e',
            border: '1px solid var(--marigold, #7c3aed)',
            borderRadius: '6px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
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
                  fontSize: '0.86rem',
                  color: isHighlighted ? '#fff' : 'rgba(255,255,255,0.85)',
                  background: isHighlighted ? 'rgba(124, 58, 237, 0.4)' : 'transparent',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>{item}</span>
                {item.toLowerCase().startsWith(cleanQ) && cleanQ && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--marigold, #c084fc)', opacity: 0.8 }}>
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
