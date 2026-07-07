import { useState } from 'react';

import Icon from '../ui/Icon.jsx';
import { cn } from '../../utils/cn.js';

/**
 * JobCard — premium featured-job card.
 * Save toggles local UI state only; persisted via API in Phase 8.
 *
 * @param {object} job - a featured job (see data/jobs.js).
 */
export default function JobCard({ job }) {
  const [saved, setSaved] = useState(false);

  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary-100 hover:shadow-elevated">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {job.companyLogo ? (
            <img
              src={job.companyLogo}
              alt={job.company.name}
              className="h-12 w-12 shrink-0 rounded-xl object-contain"
            />
          ) : (
            <span
              className={cn(
                'grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-bold',
                job.company.brand,
              )}
              aria-hidden
            >
              {job.company.initials}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-ink group-hover:text-primary">
              {job.title}
            </h3>
            <p className="truncate text-sm text-ink-soft">{job.company.name}</p>
          </div>
        </div>

        {job.hot ? (
          <span className="chip shrink-0 bg-secondary-50 text-secondary">Nổi bật</span>
        ) : null}
      </div>

      {/* Meta */}
      <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-ink-soft sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <Icon name="wallet" size={16} className="text-primary" />
          <dd className="font-semibold text-ink">{job.salaryLabel}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="mapPin" size={16} className="text-primary" />
          <dd>{job.location}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="briefcase" size={16} className="text-primary" />
          <dd>{job.experience || job.experienceLabel}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Icon name="clock" size={16} className="text-primary" />
          <dd>{job.employmentType}</dd>
        </div>
      </dl>

      {/* Tags */}
      <ul className="mt-4 flex flex-wrap gap-2">
        {job.tags.map((tag) => (
          <li key={tag} className="chip">
            {tag}
          </li>
        ))}
        <li className="chip bg-primary-50 text-primary">{job.workType}</li>
      </ul>

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-xs text-ink-muted">Đăng {job.postedAgo}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            aria-pressed={saved}
            aria-label={saved ? 'Bỏ lưu việc làm' : 'Lưu việc làm'}
            className={cn(
              'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
              saved
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 text-ink-soft hover:border-primary hover:text-primary',
            )}
          >
            <Icon
              name={saved ? 'bookmarkFill' : 'bookmark'}
              size={18}
              variant={saved ? 'fill' : 'stroke'}
            />
          </button>
          <button type="button" className="btn-primary px-4 py-2 text-xs">
            Ứng tuyển
          </button>
        </div>
      </div>
    </article>
  );
}
