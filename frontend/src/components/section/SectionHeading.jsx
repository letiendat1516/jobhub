import { cn } from '../../utils/cn.js';
import Reveal from '../ui/Reveal.jsx';

/**
 * SectionHeading — eyebrow + title + optional description.
 *
 * @param {'center'|'left'} [align='center']
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}) {
  return (
    <Reveal
      className={cn(
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl',
        className,
      )}
    >
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h2 className="text-3xl font-bold leading-tight sm:text-[2.6rem]">{title}</h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-ink-soft sm:text-lg">{description}</p>
      ) : null}
    </Reveal>
  );
}
