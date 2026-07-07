import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import Icon from '../components/ui/Icon.jsx';
import { cn } from '../utils/cn.js';
import { mockJobs } from '../data/jobsList.js';

/**
 * JobDetailPage — full job detail (UC06 View Job Details).
 *
 * Renders the structured JSON in job_description (mo_ta_cong_viec,
 * yeu_cau_ung_vien, quyen_loi, thoi_gian_lam_viec) into clean sections,
 * TopCV-style. Layout: sticky summary card (right) + main content (left).
 *
 * Route: /viec-lam/:id
 */
export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);

  const job = mockJobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center justify-center px-4 py-24 text-center">
        <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-slate-100">
          <Icon name="briefcase" size={28} className="text-ink-muted" />
        </span>
        <h1 className="text-2xl font-bold text-ink">Không tìm thấy việc làm</h1>
        <p className="mt-2 text-ink-soft">Việc làm bạn tìm không tồn tại hoặc đã bị đóng.</p>
        <Link to="/viec-lam" className="btn-primary mt-6">
          <Icon name="arrowLeft" size={18} />
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  // job.detail is the structured JSON object
  const d = job.detail || {};
  const sections = [
    { key: 'mo_ta_cong_viec', title: 'Mô tả công việc', icon: 'fileText' },
    { key: 'yeu_cau_ung_vien', title: 'Yêu cầu ứng viên', icon: 'checkCircle' },
    { key: 'quyen_loi', title: 'Quyền lợi', icon: 'sparkles' },
  ].filter((s) => Array.isArray(d[s.key]) && d[s.key].length > 0);

  return (
    <div className="bg-canvas pt-18">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-xs text-ink-muted">
          <Link to="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <span className="mx-1.5">/</span>
          <Link to="/viec-lam" className="hover:text-primary">
            Việc làm
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">{job.title}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          {/* ===== Main content ===== */}
          <div className="lg:col-span-2">
            {/* Job header card */}
            <div className="card p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span
                  className={cn(
                    'grid h-16 w-16 shrink-0 place-items-center rounded-xl text-base font-bold sm:h-20 sm:w-20 sm:text-lg',
                    job.company.brand,
                  )}
                  aria-hidden
                >
                  {job.company.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-bold leading-tight text-ink sm:text-2xl">
                    {job.title}
                  </h1>
                  <Link
                    to="#"
                    className="mt-1.5 block truncate text-sm font-medium text-primary hover:underline sm:text-base"
                  >
                    {job.company.name}
                  </Link>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.hot && (
                      <span className="chip bg-secondary-50 text-secondary">Nổi bật</span>
                    )}
                    <span className="chip bg-primary-50 text-primary">{job.workType}</span>
                    <span className="chip">{job.employmentType}</span>
                    <span className="chip">{job.category}</span>
                  </div>
                </div>
              </div>

              {/* Quick meta grid */}
              <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-4">
                <Meta icon="wallet" label="Mức lương" value={job.salaryLabel} highlight />
                <Meta icon="mapPin" label="Địa điểm" value={job.location} />
                <Meta icon="briefcase" label="Kinh nghiệm" value={job.experienceLabel} />
                <Meta icon="clock" label="Hạn nộp" value="30/08/2026" />
              </dl>
            </div>

            {/* Tags */}
            {job.tags?.length > 0 && (
              <div className="card mt-4 p-5">
                <h2 className="mb-3 text-sm font-bold text-ink">Kỹ năng / Chuyên môn</h2>
                <ul className="flex flex-wrap gap-2">
                  {job.tags.map((tag) => (
                    <li key={tag} className="chip">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Content sections */}
            <div className="card mt-4 p-5 sm:p-6">
              {sections.length === 0 ? (
                <p className="text-sm text-ink-soft">Chi tiết công việc đang được cập nhật.</p>
              ) : (
                <div className="space-y-8">
                  {sections.map((s) => (
                    <section key={s.key}>
                      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
                        <Icon name={s.icon} size={20} className="text-primary" />
                        {s.title}
                      </h2>
                      <ul className="space-y-2.5">
                        {d[s.key].map((item, idx) => (
                          <li
                            key={idx}
                            className="flex gap-2.5 text-sm leading-relaxed text-ink-soft"
                          >
                            <span
                              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                              aria-hidden
                            />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}

                  {/* Working hours */}
                  {d.thoi_gian_lam_viec && (
                    <section>
                      <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
                        <Icon name="clock" size={20} className="text-primary" />
                        Thời gian làm việc
                      </h2>
                      <p className="text-sm leading-relaxed text-ink-soft">
                        {d.thoi_gian_lam_viec}
                      </p>
                    </section>
                  )}

                  {/* How to apply */}
                  <section>
                    <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-ink sm:text-lg">
                      <Icon name="send" size={20} className="text-primary" />
                      Cách thức ứng tuyển
                    </h2>
                    <p className="text-sm leading-relaxed text-ink-soft">
                      Ứng viên nộp hồ sơ trực tuyến bằng cách bấm{' '}
                      <strong className="text-ink">Ứng tuyển ngay</strong> dưới đây.
                    </p>
                  </section>
                </div>
              )}
            </div>
          </div>

          {/* ===== Sticky summary sidebar ===== */}
          <aside className="mt-6 lg:mt-0">
            <div className="card sticky top-24 p-5">
              <h2 className="mb-4 text-base font-bold text-ink">Tóm tắt tin tuyển dụng</h2>
              <dl className="space-y-3 text-sm">
                <SummaryRow icon="wallet" label="Mức lương" value={job.salaryLabel} highlight />
                <SummaryRow icon="mapPin" label="Địa điểm" value={job.location} />
                <SummaryRow
                  icon="briefcase"
                  label="Kinh nghiệm"
                  value={d.yeu_cau_kinh_nghiem || job.experienceLabel}
                />
                <SummaryRow
                  icon="fileText"
                  label="Bằng cấp"
                  value={d.yeu_cau_bang_cap || 'Không yêu cầu'}
                />
                <SummaryRow
                  icon="clock"
                  label="Hình thức"
                  value={`${job.workType} • ${job.employmentType}`}
                />
                <SummaryRow icon="calendar" label="Hạn nộp" value="30/08/2026 (còn 53 ngày)" />
                <SummaryRow icon="users" label="Đã ứng tuyển" value="12 người" />
              </dl>

              {/* Actions */}
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => setApplied(true)}
                  disabled={applied}
                  className={cn('btn-primary w-full', applied && 'bg-green-600 hover:bg-green-600')}
                >
                  <Icon name={applied ? 'check' : 'send'} size={18} />
                  {applied ? 'Đã ứng tuyển' : 'Ứng tuyển ngay'}
                </button>
                <button
                  type="button"
                  onClick={() => setSaved((v) => !v)}
                  className={cn(
                    'btn w-full border px-5 py-3',
                    saved
                      ? 'border-primary bg-primary-50 text-primary'
                      : 'border-slate-200 text-ink hover:border-primary hover:text-primary',
                  )}
                >
                  <Icon
                    name={saved ? 'bookmarkFill' : 'bookmark'}
                    size={18}
                    variant={saved ? 'fill' : 'stroke'}
                  />
                  {saved ? 'Đã lưu tin' : 'Lưu tin'}
                </button>
              </div>

              <p className="mt-3 text-center text-xs text-ink-muted">Đăng {job.postedAgo}</p>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 text-xs text-ink-muted hover:text-primary"
              >
                <Icon name="arrowLeft" size={14} />
                Quay lại danh sách
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ---- small subcomponents ----
function Meta({ icon, label, value, highlight }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-ink-muted">
        <Icon name={icon} size={15} />
        {label}
      </dt>
      <dd className={cn('mt-1 text-sm font-semibold', highlight ? 'text-primary' : 'text-ink')}>
        {value}
      </dd>
    </div>
  );
}

function SummaryRow({ icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-ink-muted" aria-hidden>
        <Icon name={icon} size={16} />
      </span>
      <div className="flex-1">
        <dt className="text-xs text-ink-muted">{label}</dt>
        <dd className={cn('text-sm font-medium', highlight ? 'text-primary' : 'text-ink')}>
          {value}
        </dd>
      </div>
    </div>
  );
}
