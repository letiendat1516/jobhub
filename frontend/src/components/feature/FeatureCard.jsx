import Icon from '../ui/Icon.jsx';

/**
 * FeatureCard — "Why choose JobHub" card (icon + title + description).
 */
export default function FeatureCard({ icon, title, description }) {
  return (
    <article className="group h-full rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-elevated">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
        <Icon name={icon} size={24} />
      </span>
      <h3 className="mt-5 text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-ink-soft">{description}</p>
    </article>
  );
}
