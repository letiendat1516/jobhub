import { useEffect, useState } from 'react';

/**
 * useScrolled — returns `true` once the window has scrolled past
 * `threshold` pixels. Used by the Navbar to switch from transparent
 * to solid background (docs/06_HOMEPAGE_SPEC.md §8.1).
 *
 * @param {number} [threshold=8]
 * @returns {boolean}
 */
const useScrolled = (threshold = 8) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
};

export default useScrolled;
