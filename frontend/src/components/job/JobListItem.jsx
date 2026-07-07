import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from '../ui/Icon.jsx';
import { cn } from '../../utils/cn.js';

/**
 * JobListItem — horizontal list-row card (TopCV job-feed style).
 *
 * Layout: [logo] [title + company + meta row] [salary + actions]
 * Clicking the row navigates to job detail; bookmark toggles save.
 *
 * @param {object} job   - normalized job (see data/jobsList.js)
 */
export default function JobListItem({ job }) {
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const goToDetail = () => navigate(`/viec-lam/${job.id}`);

  return (
    <article
      onClick={goToDetail}
      className="group flex cursor-pointer gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-100 hover:shadow-elevated sm:p-5"
    >
      {/* Logo */}
      {job.companyLogo ? (
        <img
          src={job.companyLogo}
          alt={job.company.name}
          className="h-14 w-14 shrink-0 rounded-xl object-contain sm:h-16 sm:w-16"
        />
      ) : (
        <span
          className={cn(
            'grid h-14 w-14 shrink-0 place-items-center rounded-xl text-sm font-bold sm:h-16 sm:w-16',
            job.company.brand,
          )}
          aria-hidden
        >
          {job.company.initials}
        </span>
      )}

      {/* Body */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-ink group-hover:text-primary">
              {job.title}
            </h3>
            <p className="mt-0.5 truncate text-sm text-ink-soft">{job.company.name}</p>
          </div>
          {job.hot && <span className="chip shrink-0 bg-secondary-50 text-secondary">Nổi bật</span>}
        </div>

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-soft">
          <span className="flex items-center gap-1.5 font-semibold text-primary">
            <Icon name="wallet" size={15} />
            {job.salaryLabel}
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="mapPin" size={15} />
            {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="briefcase" size={15} />
            {job.experienceLabel}
          </span>
        </div>

        {/* Tags */}
        {job.tags?.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {job.tags.slice(0, 4).map((tag) => (
              <li key={tag} className="chip">
                {tag}
              </li>
            ))}
            <li className="chip bg-primary-50 text-primary">{job.workType}</li>
          </ul>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-50 pt-3">
          <span className="text-xs text-ink-muted">{job.postedAgo}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSaved((v) => !v);
              }}
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
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToDetail();
              }}
              className="btn-primary px-4 py-2 text-xs"
            >
              Ứng tuyển
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
