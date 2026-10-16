import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop
 * Automatically resets scroll position to the very top (0, 0)
 * whenever the route or pathname changes, ensuring users never
 * land in the middle or bottom of a newly opened page.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // If navigating to an in-page hash anchor (e.g. /#collection), let browser handle or scroll to element
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // Otherwise always reset window, documentElement and body to top immediately
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [pathname, search, hash]);

  return null;
}
