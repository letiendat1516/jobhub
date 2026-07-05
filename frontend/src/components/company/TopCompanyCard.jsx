import Icon from '../ui/Icon.jsx';
import { cn } from '../../utils/cn.js';

/**
 * TopCompanyCard — featured employer with a real cover photo
 * (docs/06_HOMEPAGE_SPEC.md §8.7).
 */
export default function TopCompanyCard({ company }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
      {/* Cover */}
      <div className="relative">
        <img
          src={company.cover}
          alt={`Văn phòng ${company.name}`}
          width="640"
          height="360"
          loading="lazy"
          className="h-32 w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 to-transparent" />
        <span
          className={cn(
            'absolute -bottom-6 left-5 grid h-14 w-14 place-items-center rounded-xl border-4 border-white text-sm font-bold shadow-soft',
            company.brand,
          )}
        >
          {company.initials}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-8">
        <h3 className="text-lg font-bold text-ink group-hover:text-primary">{company.name}</h3>
        <p className="mt-1 text-sm text-ink-soft">{company.industry}</p>

        <dl className="mt-4 space-y-2 text-sm text-ink-soft">
          <div className="flex items-center gap-2">
            <Icon name="mapPin" size={16} className="text-primary" />
            <dd>{company.location}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="users" size={16} className="text-primary" />
            <dd>{company.size}</dd>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="briefcase" size={16} className="text-primary" />
            <dd>
              <span className="font-semibold text-secondary">{company.openPositions}</span> việc
              làm đang tuyển
            </dd>
          </div>
        </dl>

        <button
          type="button"
          className="btn-secondary mt-5 w-full justify-center"
        >
          Xem hồ sơ công ty
          <Icon name="arrowUpRight" size={16} />
        </button>
      </div>
    </article>
  );
}
