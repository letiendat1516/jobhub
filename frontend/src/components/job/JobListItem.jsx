import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from '../ui/Icon.jsx';
import { cn } from '../../utils/cn.js';
import ApplyModal from './ApplyModal.jsx';

/**
 * JobListItem — horizontal list-row card (TopCV job-feed style).
 *
 * Layout: [logo] [title + company + meta row] [salary + actions]
 * Clicking the row navigates to job detail; bookmark toggles save.
 *
 * @param {object} job   - normalized job (see data/jobsList.js)
 */
export default function JobListItem({ job, score }) {
  const [saved, setSaved] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const navigate = useNavigate();

  const goToDetail = () => navigate(`/viec-lam/${job.id}`);

  return (
    <>
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
            {score &&
              (() => {
                const aiScore = score.match_score ?? score.ai?.match_score ?? null;
                const reason = score.recommendation_reason || score.ai?.recommendation_reason || '';
                if (aiScore === null) return null;
                return (
                  <div className="flex shrink-0 flex-col items-center gap-0.5">
                    <span
                      className={cn(
                        'grid h-9 w-9 place-items-center rounded-lg text-xs font-bold text-white',
                        aiScore >= 80
                          ? 'bg-green-500'
                          : aiScore >= 60
                            ? 'bg-primary'
                            : aiScore >= 40
                              ? 'bg-amber-500'
                              : 'bg-slate-400',
                      )}
                      title={reason}
                    >
                      {(Math.round(aiScore) / 10).toFixed(1)}
                    </span>
                  </div>
                );
              })()}
            {!score && job.hot && (
              <span className="chip shrink-0 bg-secondary-50 text-secondary">Nổi bật</span>
            )}
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

          {/* AI match reason + detail panel */}
          {score &&
            (() => {
              const aiData = score.ai || (score.match_score ? score : null);
              const reason = aiData?.recommendation_reason || '';
              const missing = aiData?.missing_skills || [];
              const strengths = aiData?.strengths || [];
              const matchScore = aiData?.match_score ?? 0;
              const aiBreakdown = aiData?.score_breakdown || null;
              if (!reason && !aiData) return null;

              return (
                <div className="mt-3">
                  {/* Reason summary */}
                  <div
                    className={cn(
                      'flex items-start gap-2 rounded-lg px-3 py-2 text-xs',
                      matchScore >= 80
                        ? 'bg-green-50 text-green-800'
                        : matchScore >= 60
                          ? 'bg-primary-50 text-primary'
                          : 'bg-slate-50 text-ink-soft',
                    )}
                  >
                    <Icon name="sparkles" size={14} className="mt-0.5 shrink-0" />
                    <span className="line-clamp-2 flex-1">{reason}</span>
                    {missing.length > 0 && (
                      <span className="shrink-0 text-ink-muted">
                        Thiếu: {missing.slice(0, 3).join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Toggle detail button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDetail((v) => !v);
                    }}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <Icon
                      name="chevronDown"
                      size={12}
                      className={cn('transition-transform', showDetail && 'rotate-180')}
                    />
                    {showDetail ? 'Thu gọn đánh giá' : 'Xem đánh giá chi tiết từ AI'}
                  </button>

                  {/* Detail panel */}
                  {showDetail && (
                    <div className="mt-2 space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-xs">
                      {/* Score */}
                      {aiData && (
                        <div className="border-b border-slate-100 pb-3">
                          <p className="text-[10px] font-bold uppercase text-ink-muted">Điểm AI</p>
                          <p
                            className={cn(
                              'text-2xl font-bold',
                              matchScore >= 70
                                ? 'text-green-600'
                                : matchScore >= 50
                                  ? 'text-primary'
                                  : 'text-amber-600',
                            )}
                          >
                            {(Math.round(matchScore) / 10).toFixed(1)}
                            <span className="text-sm text-ink-muted">/10</span>
                          </p>
                        </div>
                      )}

                      {/* Score breakdown — thang điểm 10, trọng số động */}
                      {aiBreakdown &&
                        (() => {
                          const criteria = [
                            { key: 'skills', label: 'Kỹ năng chuyên môn' },
                            { key: 'experience', label: 'Kinh nghiệm' },
                            { key: 'education', label: 'Học vấn & Chứng chỉ' },
                            { key: 'domain', label: 'Cùng ngành nghề' },
                            { key: 'soft_skills', label: 'Kỹ năng mềm & Thái độ' },
                            { key: 'language', label: 'Ngoại ngữ' },
                            { key: 'career_fit', label: 'Phù hợp định hướng' },
                          ];
                          // Sử dụng weights động từ AI nếu có, fallback về fixed
                          const w = aiData?.weights || {
                            skills: 30,
                            experience: 20,
                            education: 10,
                            domain: 15,
                            soft_skills: 10,
                            language: 5,
                            career_fit: 10,
                          };
                          // Quy về thang 10, CAP tại 10 (AI có thể trả raw score > weight)
                          const to10 = (val, key) => {
                            const max = w[key];
                            if (val === undefined || val === null || !max) return null;
                            const score10 = Math.round((val / max) * 10 * 10) / 10;
                            return Math.min(score10, 10); // không bao giờ vượt 10
                          };
                          return (
                            <div>
                              <p className="mb-2 text-[10px] font-bold uppercase text-ink-muted">
                                Phân tích 7 tiêu chí
                                <span className="ml-1 normal-case text-ink-muted">
                                  (trọng số thay đổi theo job)
                                </span>
                              </p>
                              <div className="space-y-2">
                                {criteria.map((c) => {
                                  const weight = w[c.key];
                                  // Ẩn tiêu chí có trọng số = 0 (không liên quan đến job)
                                  if (!weight || weight === 0) return null;
                                  const val10 = to10(aiBreakdown[c.key], c.key);
                                  if (val10 === null) return null;
                                  return (
                                    <div key={c.key}>
                                      <div className="mb-0.5 flex items-center justify-between">
                                        <span className="text-ink-soft">
                                          {c.label}
                                          <span className="ml-1 text-[9px] text-ink-muted">
                                            (trọng số: {weight}đ)
                                          </span>
                                        </span>
                                        <span className="font-bold text-primary">{val10}/10</span>
                                      </div>
                                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                          className="h-full rounded-full bg-primary"
                                          style={{ width: `${val10 * 10}%` }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                      {/* Full reason */}
                      {reason && (
                        <div className="border-t border-slate-100 pt-2">
                          <p className="text-[10px] font-bold uppercase text-ink-muted">
                            Đánh giá tổng quan
                          </p>
                          <p className="mt-1 leading-relaxed text-ink-soft">{reason}</p>
                        </div>
                      )}

                      {/* Missing skills */}
                      {missing.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-red-500">
                            ⚠ Kỹ năng thiếu
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {missing.map((s) => (
                              <span
                                key={s}
                                className="rounded-full bg-red-50 px-2 py-0.5 text-ink-soft"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Strengths */}
                      {strengths.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-green-600">
                            ✓ Điểm mạnh
                          </p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {strengths.map((s) => (
                              <span
                                key={s}
                                className="rounded-full bg-green-50 px-2 py-0.5 text-ink-soft"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

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
                  setShowApply(true);
                }}
                className="btn-primary px-4 py-2 text-xs"
              >
                Ứng tuyển
              </button>
            </div>
          </div>
        </div>
      </article>
      {/* Modal phải nằm NGOÀI <article onClick> để click không trigger navigate */}
      <ApplyModal
        job={job}
        isOpen={showApply}
        onClose={() => setShowApply(false)}
        onSubmit={(data) => console.log('Apply:', data)}
      />
    </>
  );
}
