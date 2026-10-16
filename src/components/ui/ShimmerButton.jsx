import React from 'react';

export default function ShimmerButton({
  children,
  className = '',
  shimmerColor = '#ffeaa7',
  shimmerSize = '0.08em',
  shimmerDuration = '2.4s',
  borderRadius = '8px',
  background = 'linear-gradient(135deg, #e87717 0%, #c45806 100%)',
  onClick,
  href,
  type = 'button',
  ...props
}) {
  const content = (
    <>
      {/* Rotating conic shimmer element */}
      <span
        className="shimmer-sweep"
        style={{
          '--shimmer-color': shimmerColor,
          '--shimmer-duration': shimmerDuration,
        }}
        aria-hidden="true"
      />
      {/* Background fill layer */}
      <span
        className="shimmer-bg"
        style={{
          background: background,
          borderRadius: `calc(${borderRadius} - 1px)`,
        }}
        aria-hidden="true"
      />
      {/* Button content */}
      <span className="shimmer-content">{children}</span>
    </>
  );

  const style = {
    borderRadius: borderRadius,
    padding: `${shimmerSize}`,
  };

  if (href) {
    return (
      <a
        href={href}
        className={`shimmer-button-wrap ${className}`}
        style={style}
        {...props}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`shimmer-button-wrap ${className}`}
      style={style}
      {...props}
    >
      {content}
    </button>
  );
}
