import { cn } from '../../utils/cn.js';

/**
 * Section — vertical-rhythm wrapper for homepage sections.
 * 8pt grid: py-20 (mobile) / py-24 (sm+).
 *
 * @param {boolean} [container=true] - wrap children in the page container.
 */
export default function Section({
  as: Tag = 'section',
  id,
  className,
  container = true,
  children,
}) {
  return (
    <Tag id={id} className={cn('scroll-mt-24 py-16 sm:py-24', className)}>
      {container ? <div className="container-page">{children}</div> : children}
    </Tag>
  );
}
