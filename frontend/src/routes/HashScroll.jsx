import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * HashScroll — handles in-page anchor navigation for the homepage.
 *
 * On each location change:
 *   - If a `#hash` is present, scroll the matching element into view.
 *   - Otherwise scroll to the top of the page.
 *
 * Lets the Navbar use <Link to="/#featured-jobs" /> from any route.
 */
const HashScroll = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname, hash]);

  return null;
};

export default HashScroll;
