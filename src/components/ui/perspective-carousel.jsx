import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_TRANSITION = {
  type: "spring",
  stiffness: 120,
  damping: 18,
  mass: 0.8,
};

export function PerspectiveCarousel({
  items = [],
  activeIndex,
  defaultActiveIndex = 2,
  onActiveIndexChange,
  loop = true,
  slideWidth = 220,
  transition = DEFAULT_TRANSITION,
  showControls = true,
  showDots = true,
  viewportClassName,
  slideClassName,
  imageClassName,
  labelClassName,
  controlsClassName,
  className,
  onKeyDown,
  tabIndex,
  ...props
}) {
  const navigate = useNavigate();
  const n = items.length;

  const [uncontrolledIndex, setUncontrolledIndex] = React.useState(defaultActiveIndex);
  const currentIndex = activeIndex ?? uncontrolledIndex;

  // Window resize detection
  const [windowWidth, setWindowWidth] = React.useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth <= 640;
  const isTablet = windowWidth > 640 && windowWidth <= 1024;

  // Make the card comfortably wide on mobile (~70% of screen, up to 270px) so the full outfit is displayed without cropping
  const cardWidth = isMobile
    ? Math.min(270, Math.max(230, Math.round(windowWidth * 0.70)))
    : isTablet
    ? 240
    : (slideWidth || 260);

  const cardHeight = Math.round((cardWidth * 4) / 3);

  // Cylindrical Ring / Circle Radius tuned so adjacent side cards frame the center card gracefully on any mobile screen width
  const radius = isMobile
    ? Math.min(210, Math.max(160, Math.round(windowWidth * 0.44)))
    : isTablet
    ? 380
    : 480;

  const selectSlide = React.useCallback(
    (targetIndex) => {
      if (!n) return;
      const normalized = ((targetIndex % n) + n) % n;
      if (activeIndex === undefined) {
        setUncontrolledIndex(normalized);
      }
      onActiveIndexChange?.(normalized);
    },
    [activeIndex, n, onActiveIndexChange]
  );

  if (!n) return null;

  const handleKeyDown = (event) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectSlide(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectSlide(currentIndex + 1);
    }
  };

  // Touch swipe handling for mobile
  const touchStartX = React.useRef(null);
  const touchStartY = React.useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = (touchStartY.current || 0) - e.changedTouches[0].clientY;
    if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        selectSlide(currentIndex + 1);
      } else {
        selectSlide(currentIndex - 1);
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="3D Circular Carousel"
      tabIndex={tabIndex ?? 0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className={cn("relative isolate h-full w-full overflow-hidden select-none", className)}
      {...props}
    >
      {/* 3D Scene Stage */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center overflow-hidden",
          viewportClassName
        )}
        style={{ perspective: isMobile ? "850px" : "1200px" }}
      >
        <div
          className="relative flex items-center justify-center"
          style={{
            width: cardWidth,
            height: cardHeight + 40,
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((item, index) => {
            // Shortest circular offset between item index and current active index
            let diff = index - currentIndex;
            while (diff > n / 2) diff -= n;
            while (diff < -n / 2) diff += n;

            const isActive = diff === 0;

            // Compute angle on circle
            // On mobile, use a gentler angle step so side cards stay nicely visible within the screen
            const angleStep = isMobile
              ? Math.min(42, 360 / Math.max(n, 6))
              : (360 / Math.max(n, 5));

            const angle = diff * angleStep;
            const rad = (angle * Math.PI) / 180;

            // 3D Circular coordinates:
            const x = Math.sin(rad) * radius;
            const z = Math.cos(rad) * radius - (isMobile ? radius * 0.6 : radius);
            const rotateY = angle * (isMobile ? 0.72 : 0.9); // Gentle 3D perspective so outfits are recognizable

            const scale = isActive ? 1 : Math.max(isMobile ? 0.8 : 0.72, 1 - Math.abs(diff) * 0.12);
            const opacity = Math.abs(diff) > 2 ? 0.25 : isActive ? 1 : 0.85;
            const zIndex = Math.round(100 - Math.abs(diff) * 10);

            return (
              <motion.div
                key={`${item.src}-${index}`}
                className="absolute will-change-transform"
                style={{
                  width: cardWidth,
                  zIndex,
                  transformStyle: "preserve-3d",
                }}
                animate={{
                  x,
                  z,
                  rotateY,
                  scale,
                  opacity,
                }}
                transition={transition}
              >
                <div
                  className={cn(
                    "flex w-full flex-col items-center gap-2.5",
                    slideClassName
                  )}
                >
                  <button
                    type="button"
                    aria-label={`Show ${item.title}`}
                    aria-current={isActive ? "true" : undefined}
                    className="w-full block cursor-pointer overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-xl transition-all duration-300"
                    style={{ height: cardHeight }}
                    onClick={() => {
                      if (isActive && item.id) {
                        navigate(`/product/${item.id}`);
                      } else {
                        selectSlide(index);
                      }
                    }}
                  >
                    <img
                      src={item.src}
                      alt={item.alt ?? item.title}
                      draggable={false}
                      className={cn(
                        "h-full w-full select-none object-cover transition-transform duration-300",
                        imageClassName
                      )}
                      style={{ objectPosition: "top center" }}
                    />
                  </button>

                  <motion.p
                    className={cn(
                      "text-center text-xs sm:text-sm font-semibold max-w-[210px] sm:max-w-none px-2 text-[var(--ink)] line-clamp-1",
                      labelClassName
                    )}
                    animate={{
                      filter: isActive ? "blur(0px)" : "blur(1.5px)",
                      opacity: isActive ? 1 : 0,
                    }}
                    transition={transition}
                  >
                    {item.title}
                  </motion.p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Navigation Pill Controls */}
      {showControls && (
        <div
          className={cn(
            "absolute inset-x-2 sm:inset-x-4 bottom-3 sm:bottom-5 z-20 mx-auto flex w-fit items-center justify-center gap-2 sm:gap-3 rounded-full border border-[var(--line)] bg-[var(--surface)]/95 px-3 py-1.5 text-[var(--ink)] shadow-md backdrop-blur-md",
            controlsClassName
          )}
        >
          <button
            type="button"
            aria-label="Previous Outfit"
            className="inline-flex size-8 sm:size-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--blush)] cursor-pointer"
            onClick={() => selectSlide(currentIndex - 1)}
          >
            <ChevronLeft className="size-4 sm:size-5" />
          </button>

          {showDots && (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              {items.map((item, index) => (
                <button
                  key={`${item.title}-${index}`}
                  type="button"
                  aria-label={`Go to ${item.title}`}
                  aria-current={currentIndex === index ? "true" : undefined}
                  className={cn(
                    "h-1.5 sm:h-2 rounded-full transition-[width,opacity] duration-300 cursor-pointer",
                    currentIndex === index
                      ? "w-5 sm:w-7 bg-[var(--rose-gold)] opacity-100"
                      : "w-1.5 sm:w-2 bg-[var(--ink)] opacity-30 hover:opacity-60"
                  )}
                  onClick={() => selectSlide(index)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            aria-label="Next Outfit"
            className="inline-flex size-8 sm:size-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--blush)] cursor-pointer"
            onClick={() => selectSlide(currentIndex + 1)}
          >
            <ChevronRight className="size-4 sm:size-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default PerspectiveCarousel;
