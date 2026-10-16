import { useState, useRef } from 'react';

export default function ThreeDCard({
  children,
  className = '',
  containerClassName = '',
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('rotateX(0deg) rotateY(0deg)');
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    setTransform(`rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`);
    setMousePos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform('rotateX(0deg) rotateY(0deg) translateZ(0px)');
  };

  return (
    <div
      className={`threed-card-container ${containerClassName}`}
      style={{ perspective: '1000px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={cardRef}
        className={`threed-card-body ${className}`}
        style={{
          transform,
          transition: isHovered ? 'transform 0.1s ease-out' : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Vengeance UI Cursor-following amber spotlight glow */}
        <div
          className="card-glow-overlay"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(232, 119, 23, 0.22), transparent 70%)`,
          }}
          aria-hidden="true"
        />
        {children}
      </div>
    </div>
  );
}
