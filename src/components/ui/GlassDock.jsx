'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

// Attempt to register MorphSVGPlugin if available
if (typeof window !== "undefined") {
  try {
    import("gsap/MorphSVGPlugin").then((plugin) => {
      if (plugin && plugin.MorphSVGPlugin) {
        gsap.registerPlugin(plugin.MorphSVGPlugin);
      }
    }).catch(() => {
      // Graceful fallback: icons render standard clean SVG if plugin is not installed
    });
  } catch {}
}

const MorphingIcon = ({ type, isActive, onClick, onMouseEnter }) => {
  const buttonRef = useRef(null);
  const pathRef = useRef(null);

  const animateHome = () => {
    if (!buttonRef.current || !pathRef.current) return;
    const button = buttonRef.current;
    const path = pathRef.current;
    try {
      gsap.to(button, {
        "--tab-bar-home-scale": 0.25,
        "--tab-bar-home-opacity": 0,
        duration: 0.1,
        onComplete: () => {
          gsap.to(path, {
            keyframes: [
              { morphSVG: "M12.6387 3.53796L15.1949 7.69178C15.7004 8.51322 15.7802 9.5276 15.4092 10.4179L11.3846 20.0769C11.2016 20.516 11.5243 21 12 21V21C12.4757 21 12.7984 20.516 12.6154 20.0769L8.5908 10.4179C8.21983 9.5276 8.29956 8.51322 8.80506 7.69178L11.3613 3.53796C11.6541 3.06206 12.3459 3.06206 12.6387 3.53796Z", duration: 0.1 },
              { morphSVG: "M12.1483 3.46366L12.8548 8.05624C12.9493 8.67024 12.8508 9.29842 12.573 9.85405L8.08541 18.8292C7.58673 19.8265 8.31198 21 9.42705 21H14.5729C15.688 21 16.4133 19.8265 15.9146 18.8292L11.427 9.85405C11.1492 9.29842 11.0507 8.67024 11.1452 8.05624L11.8517 3.46366C11.8778 3.29407 12.1222 3.29407 12.1483 3.46366Z", duration: 0.09 },
              {
                morphSVG: "M21 18V10.5339C21 9.57062 20.5374 8.66591 19.7565 8.1019L13.7565 3.76856C12.7079 3.01128 11.2921 3.01128 10.2435 3.76856L4.24353 8.1019C3.46259 8.66591 3 9.57062 3 10.5339V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18Z",
                duration: 0.71, ease: "elastic.out(1, .9)",
                onStart: () => {
                  gsap.to(button, { "--tab-bar-home-scale": 0.7, duration: 0.71, ease: "elastic.out(1, .9)" });
                  gsap.to(button, { "--tab-bar-home-opacity": 1, duration: 0.2 });
                },
              },
            ],
          });
        },
      });
    } catch {}
  };

  const handleMouseEnter = () => {
    onMouseEnter && onMouseEnter();
    if (type === 'home') animateHome();
  };

  if (type === 'home') {
    return (
      <button type="button" ref={buttonRef} onClick={onClick} onMouseEnter={handleMouseEnter} className={cn("p-1 text-[var(--paper)] transition-transform", isActive ? "scale-110" : "")}>
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
          <path ref={pathRef} d="M3 18V10.5339C3 9.57062 3.46259 8.66591 4.24353 8.1019L10.2435 3.76856C11.2921 3.01128 12.7079 3.01128 13.7565 3.76856L19.7565 8.1019C20.5374 8.66591 21 10.5339V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18Z" />
        </svg>
      </button>
    );
  }

  return null;
};

export const GlassDock = React.forwardRef(
  (
    {
      items = [],
      className = "",
      dockClassName = "",
      ...props
    },
    ref
  ) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [direction, setDirection] = useState(0);

    const handleMouseEnter = (index) => {
      if (hoveredIndex !== null && index !== hoveredIndex) {
        setDirection(index > hoveredIndex ? 1 : -1);
      }
      setHoveredIndex(index);
    };

    const getTooltipPosition = (index) => index * 52 + 12;

    return (
      <div
        ref={ref}
        className={cn('w-max', className)}
        {...props}
      >
        <div
          className={cn(
            "glass-dock relative flex gap-3 sm:gap-4 items-center px-5 sm:px-6 py-3 sm:py-3.5 rounded-full",
            "border border-[var(--line)] bg-[var(--surface)]/90 text-[var(--ink)]",
            "backdrop-blur-xl shadow-lg justify-center",
            dockClassName
          )}
          onMouseLeave={() => {
            setHoveredIndex(null);
            setDirection(0);
          }}
        >
          <AnimatePresence>
            {hoveredIndex !== null && items[hoveredIndex] && (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: -52,
                  x: getTooltipPosition(hoveredIndex),
                }}
                exit={{ opacity: 0, scale: 0.92, y: 12 }}
                transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                className="absolute top-0 left-0 pointer-events-none z-30"
              >
                <div
                  className={cn(
                    'px-3.5 py-1.5 rounded-md',
                    'bg-[var(--night)] text-[var(--paper)]',
                    'shadow-md flex items-center justify-center',
                    'border border-[var(--gold)]/30',
                    'min-w-[80px]'
                  )}
                >
                  <div className="relative h-4 flex items-center justify-center overflow-hidden w-full">
                    <AnimatePresence mode="popLayout" custom={direction}>
                      <motion.span
                        key={items[hoveredIndex].title}
                        custom={direction}
                        initial={{
                          x: direction > 0 ? 25 : -25,
                          opacity: 0,
                          filter: 'blur(4px)',
                        }}
                        animate={{
                          x: 0,
                          opacity: 1,
                          filter: 'blur(0px)',
                        }}
                        exit={{
                          x: direction > 0 ? -25 : 25,
                          opacity: 0,
                          filter: 'blur(4px)',
                        }}
                        transition={{
                          duration: 0.25,
                          ease: 'easeOut',
                        }}
                        className="text-[12px] font-medium tracking-wide whitespace-nowrap text-[var(--amber-light)]"
                      >
                        {items[hoveredIndex].title}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {items.map((el, index) => {
            const Icon = el.icon;
            const isHovered = hoveredIndex === index;
            const isActive = isHovered;

            const handleClick = () => {
              if (el.onClick) {
                el.onClick();
              } else if (el.href) {
                if (el.href.startsWith('http') || el.href.startsWith('https://wa.me')) {
                  window.open(el.href, '_blank', 'noopener,noreferrer');
                } else {
                  window.location.href = el.href;
                }
              }
            };

            const type = el.title ? el.title.toLowerCase() : '';
            const isMorphHome = type === 'home';

            return (
              <div
                key={el.title}
                onMouseEnter={() => handleMouseEnter(index)}
                onClick={handleClick}
                className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center cursor-pointer rounded-full transition-colors duration-200 hover:bg-[var(--line)]"
                role="button"
                tabIndex={0}
                aria-label={el.title}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleClick();
                  }
                }}
              >
                <motion.div
                  whileTap={{ scale: 0.92 }}
                  animate={{
                    scale: isHovered ? 1.15 : 1,
                    y: isHovered ? -3 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                  className="flex items-center justify-center"
                >
                  {isMorphHome ? (
                    <MorphingIcon
                      type="home"
                      isActive={isActive}
                      onClick={handleClick}
                      onMouseEnter={() => {}}
                    />
                  ) : Icon ? (
                    <Icon
                      className={cn(
                        'h-[20px] w-[20px] sm:h-[22px] sm:w-[22px] transition-colors duration-200',
                        isHovered
                          ? 'text-[var(--gold)]'
                          : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'
                      )}
                    />
                  ) : null}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

GlassDock.displayName = 'GlassDock';
export default GlassDock;
