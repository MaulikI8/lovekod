import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * Ensures that whenever a page loads or routes change, the user starts at
 * the exact top (0, 0), stopping Lenis smooth-scroll from carrying momentum or
 * preserving previous scroll positions.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If navigating to an in-page hash anchor (e.g. /#collection), let element scrollIntoView
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    // Tell Lenis smooth scroll to immediately jump to top
    if (window.__lenis) {
      try {
        window.__lenis.scrollTo(0, { immediate: true });
      } catch {}
    }

    // Force browser native scroll to top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // Second check after next event loop tick to overcome any async image / layout reflow
    const timer = setTimeout(() => {
      if (window.__lenis) {
        try {
          window.__lenis.scrollTo(0, { immediate: true });
        } catch {}
      }
      window.scrollTo(0, 0);
    }, 10);

    return () => clearTimeout(timer);
  }, [pathname, search, hash]);

  return null;
}
