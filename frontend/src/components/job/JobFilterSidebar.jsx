import Icon from '../ui/Icon.jsx';

/**
 * JobFilterSidebar — left sidebar with filter groups, TopCV-style.
 *
 * Filter groups: Ngành nghề, Địa điểm, Mức lương, Kinh nghiệm, Hình thức làm việc.
 * Controlled component: state lives in parent JobsPage.
 *
 * @param {object}   filters        - current filter values
 * @param {function} onChange       - (patch) => void, merges patch into filters
 * @param {object}   options        - available facet values { categories, cities, ... }
 * @param {function} onReset        - reset all filters
 * @param {number}   resultCount    - for the header badge
 */
const SALARY_OPTIONS = [
  { value: '0-10', label: 'Dưới 10 triệu' },
  { value: '10-15', label: '10 - 15 triệu' },
  { value: '15-20', label: '15 - 20 triệu' },
  { value: '20-30', label: '20 - 30 triệu' },
  { value: '30-50', label: '30 - 50 triệu' },
  { value: '50-', label: 'Trên 50 triệu' },
  { value: 'negotiable', label: 'Thoả thuận' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'INTERN', label: 'Không yêu cầu' },
  { value: 'FRESHER', label: 'Dưới 1 năm' },
  { value: 'JUNIOR', label: '1 - 2 năm' },
  { value: 'MID', label: '2 - 4 năm' },
  { value: 'SENIOR', label: '5 năm' },
  { value: 'LEAD', label: 'Trên 5 năm' },
];

const WORK_MODE_OPTIONS = [
  { value: 'ONSITE', label: 'Tại văn phòng' },
  { value: 'HYBRID', label: 'Lai hybrid' },
  { value: 'REMOTE', label: 'Từ xa (Remote)' },
];

const JOB_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Toàn thời gian' },
  { value: 'PART_TIME', label: 'Bán thời gian' },
  { value: 'INTERNSHIP', label: 'Thực tập' },
];

const JOB_LEVEL_OPTIONS = [
  { value: 'Nhân viên', label: 'Nhân viên' },
  { value: 'Trưởng nhóm', label: 'Trưởng nhóm' },
  { value: 'Trưởng phòng', label: 'Trưởng / Phó phòng' },
  { value: 'Quản lý', label: 'Quản lý / Giám sát' },
  { value: 'Giám đốc', label: 'Giám đốc / Phó giám đốc' },
  { value: 'Thực tập sinh', label: 'Thực tập sinh' },
];

function FilterGroup({ title, children }) {
  return (
    <div className="border-b border-slate-100 py-4 last:border-b-0">
      <h4 className="mb-3 text-sm font-bold text-ink">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CheckboxRow({ checked, onChange, label, count }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink-soft transition-colors hover:text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
      />
      <span className="flex-1">{label}</span>
      {count !== undefined && count !== null && (
        <span className="text-xs text-ink-muted">({count})</span>
      )}
    </label>
  );
}

export default function JobFilterSidebar({ filters, onChange, options, onReset, resultCount }) {
  const toggle = (key, value) => {
    const set = new Set(filters[key] || []);
    if (set.has(value)) set.delete(value);
    else set.add(value);
    onChange({ [key]: [...set] });
  };

  return (
    <aside className="card sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-5">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold text-ink">
          <Icon name="filter" size={18} className="text-primary" />
          Bộ lọc
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-primary hover:underline"
        >
          Xoá lọc
        </button>
      </div>
      <p className="mb-3 text-xs text-ink-muted">{resultCount} việc làm phù hợp</p>

      {/* Ngành nghề */}
      <FilterGroup title="Ngành nghề">
        <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
          {(options.categories || []).map(([value, label, count]) => (
            <CheckboxRow
              key={value}
              checked={(filters.categories || []).includes(value)}
              onChange={() => toggle('categories', value)}
              label={label}
              count={count}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Địa điểm */}
      <FilterGroup title="Địa điểm">
        <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
          {(options.cities || []).map(([value, count]) => (
            <CheckboxRow
              key={value}
              checked={(filters.cities || []).includes(value)}
              onChange={() => toggle('cities', value)}
              label={value}
              count={count}
            />
          ))}
        </div>
      </FilterGroup>

      {/* Mức lương */}
      <FilterGroup title="Mức lương">
        {SALARY_OPTIONS.map((opt) => (
          <CheckboxRow
            key={opt.value}
            checked={(filters.salary || []).includes(opt.value)}
            onChange={() => toggle('salary', opt.value)}
            label={opt.label}
          />
        ))}
      </FilterGroup>

      {/* Kinh nghiệm */}
      <FilterGroup title="Kinh nghiệm">
        {EXPERIENCE_OPTIONS.map((opt) => {
          const count = (options.jobLevels || []).find(([v]) => v === opt.label)?.[1];
          return (
            <CheckboxRow
              key={opt.value}
              checked={(filters.experience || []).includes(opt.value)}
              onChange={() => toggle('experience', opt.value)}
              label={opt.label}
              count={count}
            />
          );
        })}
      </FilterGroup>

      {/* Cấp bậc */}
      <FilterGroup title="Cấp bậc">
        {JOB_LEVEL_OPTIONS.map((opt) => (
          <CheckboxRow
            key={opt.value}
            checked={(filters.jobLevel || []).includes(opt.value)}
            onChange={() => toggle('jobLevel', opt.value)}
            label={opt.label}
          />
        ))}
      </FilterGroup>

      {/* Hình thức làm việc */}
      <FilterGroup title="Hình thức làm việc">
        {WORK_MODE_OPTIONS.map((opt) => (
          <CheckboxRow
            key={opt.value}
            checked={(filters.workMode || []).includes(opt.value)}
            onChange={() => toggle('workMode', opt.value)}
            label={opt.label}
          />
        ))}
      </FilterGroup>

      {/* Loại hình công việc */}
      <FilterGroup title="Loại hình công việc">
        {JOB_TYPE_OPTIONS.map((opt) => (
          <CheckboxRow
            key={opt.value}
            checked={(filters.jobType || []).includes(opt.value)}
            onChange={() => toggle('jobType', opt.value)}
            label={opt.label}
          />
        ))}
      </FilterGroup>
    </aside>
  );
}
