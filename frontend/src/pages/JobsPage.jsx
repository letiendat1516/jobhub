import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import Icon from '../components/ui/Icon.jsx';
import JobFilterSidebar from '../components/job/JobFilterSidebar.jsx';
import JobListItem from '../components/job/JobListItem.jsx';
import AIScoreModal from '../components/job/AIScoreModal.jsx';
import { mockJobs } from '../data/jobsList.js';
import provinces from '../data/provinces.js';
import { saveSession } from '../utils/aiScores.js';
import jobService from '../services/jobService.js';
import { mergeJobs } from '../utils/jobMapper.js';

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { value: 'posted', label: 'Ngày đăng' },
  { value: 'updated', label: 'Ngày cập nhật' },
  { value: 'salaryDesc', label: 'Lương cao nhất' },
  { value: 'urgent', label: 'Cần tuyển gấp' },
];
// Only shown when aiScores is populated
const AI_SORT_OPTION = { value: 'aiScore', label: 'Độ phù hợp AI (cao→thấp)' };

const SEARCH_TYPES = [
  { value: 'both', label: 'Cả hai' },
  { value: 'title', label: 'Tên việc làm' },
  { value: 'company', label: 'Tên công ty' },
];

/** Build the facet options shown in the sidebar from the dataset. */
function buildFacets(jobs) {
  const catMap = new Map();
  const cityMap = new Map();
  const levelMap = new Map();
  for (const j of jobs) {
    catMap.set(j.category, (catMap.get(j.category) || 0) + 1);
    cityMap.set(j.location, (cityMap.get(j.location) || 0) + 1);
    levelMap.set(j.experienceLabel, (levelMap.get(j.experienceLabel) || 0) + 1);
  }
  return {
    categories: [...catMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => [name, name, count]),
    cities: [...cityMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => [name, count]),
    jobLevels: ['Không yêu cầu', 'Dưới 1 năm', '1 - 2 năm', '2 - 4 năm', '5 năm', 'Trên 5 năm'].map(
      (l) => [l, levelMap.get(l) || 0],
    ),
  };
}

/** Check if a job's salary falls in any of the selected salary bands. */
function salaryMatches(job, bands) {
  if (!bands || bands.length === 0) return true;
  for (const band of bands) {
    if (band === 'negotiable') {
      if (job.negotiable) return true;
      continue;
    }
    if (job.negotiable) continue;
    const [loStr, hiStr] = band.split('-');
    const lo = loStr === '' ? null : Number(loStr) * 1_000_000;
    const hi = hiStr === '' ? null : Number(hiStr) * 1_000_000;
    const jobMax = job.salaryMax ?? job.salaryMin ?? 0;
    const jobMin = job.salaryMin ?? 0;
    // overlap: job's range intersects the band's range
    if ((lo === null || jobMax >= lo) && (hi === null || jobMin <= hi)) return true;
  }
  return false;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState(
    mockJobs.map((job) => ({ ...job, source: job.source || 'mock' })),
  );
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState('');

  // Read initial search criteria from URL (?q=...&location=...) set by
  // the homepage SearchBar so results match what the user searched for.
  const [searchParams, setSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '');
  const [locationQuery, setLocationQuery] = useState(searchParams.get('location') ?? '');
  const [filters, setFilters] = useState({
    categories: [],
    cities: [],
    salary: [],
    experience: [],
    jobLevel: [],
    workMode: [],
    jobType: [],
  });
  const [sort, setSort] = useState('posted');
  const [searchType, setSearchType] = useState('both');
  const [page, setPage] = useState(1);
  const [jumpIndex, setJumpIndex] = useState(null);
  const [jumpValue, setJumpValue] = useState('');
  const [showAiScore, setShowAiScore] = useState(false);
  const [aiScores, setAiScores] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadApprovedJobs = async () => {
      try {
        setJobsLoading(true);
        setJobsError('');

        const apiJobs = await jobService.searchJobs({
          page: 1,
          limit: 100,
        });

        if (!cancelled) {
          setJobs(mergeJobs(mockJobs, Array.isArray(apiJobs) ? apiJobs : []));
        }
      } catch (err) {
        if (!cancelled) {
          setJobsError(
            err?.message ||
              'Không thể tải các tin tuyển dụng mới từ hệ thống.',
          );

          // Nếu backend lỗi, trang vẫn hiển thị dữ liệu mẫu.
          setJobs(
            mockJobs.map((job) => ({
              ...job,
              source: job.source || 'mock',
            })),
          );
        }
      } finally {
        if (!cancelled) {
          setJobsLoading(false);
        }
      }
    };

    loadApprovedJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  const facets = useMemo(() => buildFacets(jobs), [jobs]);

  // ---- filtering ----
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const loc = locationQuery.trim().toLowerCase();
    let result = jobs.filter((j) => {
      if (kw) {
        const hayTitle = j.title.toLowerCase();
        const hayCompany = j.company.name.toLowerCase();
        const hayAll =
          `${j.title} ${j.company.name} ${j.category} ${(j.tags || []).join(' ')}`.toLowerCase();
        if (searchType === 'title' && !hayTitle.includes(kw)) return false;
        if (searchType === 'company' && !hayCompany.includes(kw)) return false;
        if (searchType === 'both' && !hayAll.includes(kw)) return false;
      }
      if (loc && !j.location.toLowerCase().includes(loc)) return false;
      if (filters.categories.length && !filters.categories.includes(j.category)) return false;
      if (filters.cities.length && !filters.cities.includes(j.location)) return false;
      if (filters.experience.length && !filters.experience.includes(j.experienceEnum)) return false;
      if (filters.workMode.length && !filters.workMode.includes(j.workModeEnum)) return false;
      if (filters.jobType.length && !filters.jobType.includes(j.jobTypeEnum)) return false;
      if (!salaryMatches(j, filters.salary)) return false;
      return true;
    });

    // sort (TopCV style)
    if (sort === 'posted') {
      result = [...result].sort(
        (a, b) => parsePostedDays(a.postedText) - parsePostedDays(b.postedText),
      );
    } else if (sort === 'updated') {
      // For now same as posted; real API would have updated_at
      result = [...result].sort(
        (a, b) => parsePostedDays(a.postedText) - parsePostedDays(b.postedText),
      );
    } else if (sort === 'urgent') {
      // Urgent: prefer hot jobs first
      result = [...result].sort((a, b) => (b.hot ? 1 : 0) - (a.hot ? 1 : 0));
    } else if (sort === 'salaryDesc') {
      // Highest salary first (negotiable jobs go last)
      result = [...result].sort((a, b) => {
        const aMax = a.negotiable ? 0 : (a.salaryMax ?? a.salaryMin ?? 0);
        const bMax = b.negotiable ? 0 : (b.salaryMax ?? b.salaryMin ?? 0);
        return bMax - aMax;
      });
    } else if (sort === 'aiScore') {
      // Sort by AI match score descending (jobs without score go last)
      result = [...result].sort((a, b) => {
        const aScore = aiScores?.[a.id]?.match_score ?? -1;
        const bScore = aiScores?.[b.id]?.match_score ?? -1;
        return bScore - aScore;
      });
    }
    return result;
  }, [jobs, keyword, locationQuery, filters, sort, searchType, aiScores]);

  // ---- pagination ----
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const current = Math.min(page, totalPages || 1);
  const pageJobs = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  // Keep the URL query params in sync with the current keyword/location so
  // the search is shareable and survives refresh.
  const syncUrl = () => {
    const next = new URLSearchParams();
    if (keyword.trim()) next.set('q', keyword.trim());
    if (locationQuery) next.set('location', locationQuery);
    setSearchParams(next, { replace: true });
  };

  const handleFilterChange = (patch) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
    setJumpIndex(null);
    setJumpValue('');
  };
  const handleReset = () => {
    setFilters({
      categories: [],
      cities: [],
      salary: [],
      experience: [],
      jobLevel: [],
      workMode: [],
      jobType: [],
    });
    setKeyword('');
    setLocationQuery('');
    setSearchType('both');
    setSearchParams({}, { replace: true });
    setPage(1);
    setJumpIndex(null);
    setJumpValue('');
  };

  return (
    <div className="bg-canvas pt-18">
      {/* Page header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav className="mb-3 text-xs text-ink-muted">
            <span>Trang chủ</span>
            <span className="mx-1.5">/</span>
            <span className="text-ink">Việc làm</span>
          </nav>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">
            Tìm việc làm
            <span className="ml-2 text-base font-normal text-ink-muted">
              {filtered.length} việc làm
            </span>
          </h1>

          {/* Search type toggle + search bar — TopCV style */}
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1 text-xs text-ink-muted">
              <span>Tìm kiếm theo:</span>
              {SEARCH_TYPES.map((st) => (
                <button
                  key={st.value}
                  type="button"
                  onClick={() => setSearchType(st.value)}
                  className={
                    searchType === st.value
                      ? 'rounded-full bg-primary px-3 py-0.5 text-white'
                      : 'rounded-full bg-slate-100 px-3 py-0.5 hover:bg-slate-200'
                  }
                >
                  {st.label}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                syncUrl();
              }}
              className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 sm:flex-row sm:items-center"
            >
              <label className="flex flex-1 items-center gap-3 rounded-xl px-4 py-2.5 hover:bg-slate-50">
                <Icon name="search" size={20} className="text-ink-muted" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Vị trí, kỹ năng, công ty..."
                  className="w-full bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
                />
              </label>
              <span className="hidden h-7 w-px bg-slate-200 sm:block" />
              <label className="flex flex-1 items-center gap-3 rounded-xl px-4 py-2.5 hover:bg-slate-50">
                <Icon name="mapPin" size={20} className="text-ink-muted" />
                <select
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm text-ink focus:outline-none"
                >
                  <option value="">Tất cả địa điểm</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn-primary sm:px-7">
                <Icon name="search" size={18} />
                <span>Tìm kiếm</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {(jobsLoading || jobsError) && (
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          {jobsLoading ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
              Đang tải thêm các tin tuyển dụng đã được quản trị viên duyệt...
            </div>
          ) : null}

          {jobsError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              {jobsError} Trang hiện vẫn đang hiển thị dữ liệu mẫu.
            </div>
          ) : null}
        </div>
      )}

      {/* Body: sidebar + results */}
      <div className="mx-auto max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:flex lg:px-8">
        <div className="lg:w-72 lg:shrink-0">
          <JobFilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            options={facets}
            onReset={handleReset}
            resultCount={filtered.length}
          />
        </div>

        <div className="mt-6 flex-1 lg:mt-0">
          {/* Toolbar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-soft">
              Hiển thị <strong className="text-ink">{pageJobs.length}</strong> / {filtered.length}{' '}
              việc làm
            </p>
            <div className="flex items-center gap-2">
              {/* AI Score button — chỉ bật khi filtered jobs ≤ 100 */}
              <button
                type="button"
                onClick={() => setShowAiScore(true)}
                disabled={filtered.length === 0 || filtered.length > 100}
                title={
                  filtered.length > 100
                    ? `Lọc xuống ≤100 việc làm (hiện ${filtered.length}) để bật AI Matching`
                    : 'Chấm điểm CV với AI DeepSeek'
                }
                className={
                  filtered.length > 0 && filtered.length <= 100
                    ? 'inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white shadow-soft hover:bg-primary-700'
                    : 'inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-ink-muted'
                }
              >
                <Icon name="sparkles" size={16} />
                AI Matching
                {filtered.length > 100 && (
                  <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                    cần ≤100
                  </span>
                )}
                {aiScores && filtered.length <= 100 && (
                  <span className="ml-1 rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    ✓
                  </span>
                )}
              </button>
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <span className="hidden sm:inline">Sắp xếp:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-ink focus:border-primary"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                  {aiScores && <option value={AI_SORT_OPTION.value}>{AI_SORT_OPTION.label}</option>}
                </select>
              </label>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters(filters) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {flattenFilters(filters).map(([key, value]) => (
                <button
                  key={`${key}-${value}`}
                  onClick={() =>
                    handleFilterChange({ [key]: filters[key].filter((v) => v !== value) })
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary hover:bg-primary-100"
                >
                  {value}
                  <Icon name="x" size={14} />
                </button>
              ))}
              <button
                onClick={handleReset}
                className="text-xs text-ink-muted hover:text-primary hover:underline"
              >
                Xoá tất cả
              </button>
            </div>
          )}

          {/* Job list */}
          {pageJobs.length > 0 ? (
            <div className="space-y-3">
              {pageJobs.map((job) => (
                <JobListItem key={job.id} job={job} score={aiScores?.[job.id]} />
              ))}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
              <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-slate-100">
                <Icon name="search" size={28} className="text-ink-muted" />
              </span>
              <h3 className="text-lg font-bold text-ink">Không tìm thấy việc làm phù hợp</h3>
              <p className="mt-1 max-w-md text-sm text-ink-soft">
                Thử thay đổi từ khoá hoặc bỏ bớt bộ lọc để mở rộng kết quả tìm kiếm.
              </p>
              <button onClick={handleReset} className="btn-secondary mt-5">
                Xoá bộ lọc
              </button>
            </div>
          )}

          {/* Pagination — condensed: 1 2 3 ... 231 232 */}
          {totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={current === 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-ink-soft hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Trang trước"
              >
                <Icon name="arrowLeft" size={18} />
              </button>
              {compactPages(current, totalPages).map((n, i) =>
                n === 'ellipsis' ? (
                  jumpIndex === i ? (
                    <input
                      key={`jump-${i}`}
                      autoFocus
                      type="number"
                      min={1}
                      max={totalPages}
                      value={jumpValue}
                      onChange={(e) => setJumpValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const p = Math.max(
                            1,
                            Math.min(totalPages, parseInt(e.target.value) || current),
                          );
                          setPage(p);
                          setJumpIndex(null);
                          setJumpValue('');
                        } else if (e.key === 'Escape') {
                          setJumpIndex(null);
                          setJumpValue('');
                        }
                      }}
                      onBlur={() => {
                        setJumpIndex(null);
                        setJumpValue('');
                      }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary bg-white text-center text-sm text-ink outline-none"
                    />
                  ) : (
                    <button
                      key={`dots-${i}`}
                      onClick={() => setJumpIndex(i)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sm text-ink-soft hover:border-primary hover:text-primary"
                    >
                      ...
                    </button>
                  )
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={
                      n === current
                        ? 'inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white'
                        : 'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sm text-ink-soft hover:border-primary hover:text-primary'
                    }
                  >
                    {n}
                  </button>
                ),
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={current === totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-ink-soft hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Trang sau"
              >
                <Icon name="arrowRight" size={18} />
              </button>
            </nav>
          )}
        </div>
      </div>
      {/* AI Score modal */}
      <AIScoreModal
        jobs={filtered}
        isOpen={showAiScore}
        onClose={() => setShowAiScore(false)}
        onScored={(scores, cvName) => {
          setAiScores(scores);
          setSort('aiScore');
          setPage(1);
          // Lưu vào localStorage theo phiên
          saveSession({
            cvName: cvName || 'Phiên chấm điểm',
            method: 'ai',
            scores,
            jobs: filtered,
          });
        }}
      />
    </div>
  );
}

// ---- helpers ----
/** Build a compact page-number array: [1, 2, 3, 'ellipsis', N-1, N] */
function compactPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current <= 4) {
    for (let i = 2; i <= 5; i++) pages.push(i);
    pages.push('ellipsis');
    pages.push(total);
  } else if (current >= total - 3) {
    pages.push('ellipsis');
    for (let i = total - 4; i <= total; i++) pages.push(i);
  } else {
    pages.push('ellipsis');
    for (let i = current - 1; i <= current + 1; i++) pages.push(i);
    pages.push('ellipsis');
    pages.push(total);
  }
  return pages;
}

function parsePostedDays(text = '') {
  const t = text.toLowerCase();
  let m = t.match(/(\d+)\s*ngày/);
  if (m) return +m[1];
  m = t.match(/(\d+)\s*tuần/);
  if (m) return +m[1] * 7;
  if (t.includes('tháng')) return 30;
  return 0;
}

function hasActiveFilters(filters) {
  return Object.values(filters).some((arr) => arr && arr.length > 0);
}

function flattenFilters(filters) {
  const out = [];
  for (const [key, values] of Object.entries(filters)) {
    for (const v of values || []) out.push([key, v]);
  }
  return out;
}