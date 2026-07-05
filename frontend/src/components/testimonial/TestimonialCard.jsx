import Icon from '../ui/Icon.jsx';

/**
 * TestimonialCard — quote, rating, author with a real portrait.
 *
 * @param {object} testimonial - { name, role, company, avatar, rating, quote }
 */
export default function TestimonialCard({ testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
      <div className="flex items-center justify-between">
        <span className="text-secondary" aria-hidden>
          <Icon name="quote" size={32} variant="fill" />
        </span>
        <div className="flex items-center gap-0.5 text-secondary" aria-label={`Đánh giá ${testimonial.rating} trên 5 sao`}>
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Icon key={i} name="star" size={16} variant="fill" />
          ))}
        </div>
      </div>

      <blockquote className="mt-4 flex-1 text-sm leading-7 text-ink-soft">
        “{testimonial.quote}”
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          width="44"
          height="44"
          loading="lazy"
          className="h-11 w-11 rounded-full object-cover"
        />
        <div>
          <p className="text-sm font-bold text-ink">{testimonial.name}</p>
          <p className="text-xs text-ink-muted">
            {testimonial.role} · {testimonial.company}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
