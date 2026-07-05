import { motion, useReducedMotion } from 'framer-motion';

/**
 * Reveal — subtle scroll-into-view animation wrapper (Framer Motion).
 * Fade + slide-up, once per element. Honors prefers-reduced-motion
 * (docs/06_HOMEPAGE_SPEC.md §11, §12).
 *
 * @param {number} [delay=0]
 * @param {number} [y=24]
 * @param {number} [amount=0.25] - fraction of element in view to trigger.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  amount = 0.25,
  once = true,
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once, amount }}
    >
      {children}
    </motion.div>
  );
}
