import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import Icon from '../ui/Icon.jsx';

/**
 * SearchBar — the keyword-first hero search (VietnamWorks / Indeed pattern).
 * Pure UI in this phase; wired to the Job search API in Phase 7.
 */
const popularKeywords = ['ReactJS', 'Marketing', 'Kế toán', 'Hà Nội', 'Remote'];

export default function SearchBar({ className }) {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Phase 7 will run a real query; for now, lead the user to the job feed.
    navigate('/#featured-jobs');
  };

  return (
    <div className={className}>
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-2 shadow-elevated sm:rounded-full"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Keyword */}
          <label className="group flex flex-1 items-center gap-3 rounded-xl px-4 py-2.5 sm:rounded-full sm:hover:bg-slate-50">
            <span className="text-ink-muted" aria-hidden>
              <Icon name="search" size={20} />
            </span>
            <span className="flex-1">
              <span className="sr-only">Từ khoá tìm kiếm</span>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo vị trí, kỹ năng hoặc tên công ty..."
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
              />
            </span>
          </label>

          <span className="hidden h-7 w-px bg-slate-200 sm:block" aria-hidden />

          {/* Location */}
          <label className="group flex items-center gap-3 rounded-xl px-4 py-2.5 sm:min-w-[14rem] sm:rounded-full sm:hover:bg-slate-50">
            <span className="text-ink-muted" aria-hidden>
              <Icon name="mapPin" size={20} />
            </span>
            <span className="flex-1">
              <span className="sr-only">Địa điểm</span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Địa điểm"
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
              />
            </span>
          </label>

          <button type="submit" className="btn-primary sm:rounded-full sm:px-7">
            <Icon name="search" size={18} />
            <span>Tìm kiếm</span>
          </button>
        </div>
      </form>

      {/* Popular keywords */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-muted">Phổ biến:</span>
        {popularKeywords.map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => setKeyword(term)}
            className="chip transition-colors hover:bg-primary-50 hover:text-primary"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
