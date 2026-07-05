import Icon from '../ui/Icon.jsx';

/**
 * BlogCard — career resource article card (cover + category + title).
 */
export default function BlogCard({ post }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
      <div className="relative overflow-hidden">
        <img
          src={post.cover}
          alt={post.title}
          width="640"
          height="360"
          loading="lazy"
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary shadow-soft backdrop-blur">
          {post.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-bold leading-snug text-ink transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1.5">
            <Icon name="clock" size={14} />
            {post.readTime}
          </span>
          <span>{post.date}</span>
        </div>
      </div>
    </article>
  );
}
