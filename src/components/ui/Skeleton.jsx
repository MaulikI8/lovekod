/**
 * Shimmering skeleton loader for products, text, and media.
 */
export default function Skeleton({ className = '', variant = 'rect', width, height, style = {} }) {
  const combinedStyle = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...style,
  };

  return (
    <div
      className={`skeleton-shimmer skeleton-${variant} ${className}`}
      style={combinedStyle}
      aria-hidden="true"
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="editorial-product-card skeleton-card">
      <Skeleton height="360px" className="w-full" />
      <div className="card-body">
        <Skeleton height="14px" width="40%" style={{ marginBottom: '10px' }} />
        <Skeleton height="24px" width="85%" style={{ marginBottom: '14px' }} />
        <Skeleton height="18px" width="30%" style={{ marginBottom: '18px' }} />
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
          <Skeleton height="38px" width="38px" />
          <Skeleton height="38px" width="38px" />
          <Skeleton height="38px" width="38px" />
        </div>
        <Skeleton height="44px" width="100%" />
      </div>
    </div>
  );
}
