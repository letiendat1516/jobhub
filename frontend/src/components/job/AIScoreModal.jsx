import { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import Icon from '../ui/Icon.jsx';
import { cn } from '../../utils/cn.js';
import recommendationService from '../../services/recommendationService.js';

// Configure PDF.js worker (Vite serves it as a separate chunk)
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

/**
 * AIScoreModal — AI job matching with DeepSeek.
 *
 * User picks a CV (pre-extracted sample OR upload .pdf/.doc → extract),
 * then the backend scores all filtered jobs (≤100) and returns match_score
 * per job. Every call is logged to ai-lab/logs for the /ai-logs page.
 *
 * Props:
 *   jobs: array of normalized jobs (≤100, already filtered)
 *   isOpen: boolean
 *   onClose: () => void
 *   onScored: (scores) => void   // scores: { [jobId]: { match_score, reason, missing_skills } }
 */

// Mock pre-extracted CVs (Phase 9 will fetch real ones from the API).
const PRE_EXTRACTED_CVS = [
  {
    id: 'cv-it',
    name: 'CV IT Software Engineer (đã trích xuất)',
    cv: {
      skills: ['JavaScript', 'ReactJS', 'Node.js', 'PostgreSQL', 'Git', 'Docker', 'REST API'],
      soft_skills: ['Teamwork', 'Problem-solving', 'Agile/Scrum', 'Communication'],
      experience_years: 3,
      education_level: 'Bachelor',
      languages: ['English (intermediate)', 'Vietnamese (native)'],
      certifications: ['AWS Cloud Practitioner'],
      summary:
        'Software engineer with 3 years of experience in full-stack web development. Strong problem-solving skills, comfortable working in Agile teams. Looking for a challenging role where I can grow technically and contribute to impactful projects.',
      work_experience: [
        {
          company: 'FPT Software',
          position: 'Software Engineer',
          start_date: '2023-03',
          end_date: null,
          description:
            'Developed and maintained React+Node.js web applications for banking clients. Collaborated in a Scrum team of 8. Improved API performance by 30%.',
        },
        {
          company: 'Startup XYZ',
          position: 'Junior Developer',
          start_date: '2022-01',
          end_date: '2023-01',
          description:
            'Built internal tools using JavaScript and PostgreSQL. Worked closely with product team to deliver features on tight deadlines.',
        },
      ],
    },
  },
  {
    id: 'cv-sales',
    name: 'CV Sales / Kinh doanh (đã trích xuất)',
    cv: {
      skills: [
        'Sales',
        'Telesales',
        'Kinh doanh B2B',
        'Excel',
        'CRM (Salesforce)',
        'Đàm phán',
        'Chốt sale',
      ],
      soft_skills: ['Communication', 'Persuasion', 'Teamwork', 'Time management', 'Adaptability'],
      experience_years: 2,
      education_level: 'Bachelor',
      languages: ['English (basic)', 'Vietnamese (native)'],
      certifications: [],
      summary:
        'Dynamic sales professional with 2 years of B2B sales experience. Consistently exceeded quarterly targets by 120%. Strong negotiator, excellent communicator. Seeking a senior sales role to leverage my skills in a larger market.',
      work_experience: [
        {
          company: 'CÔNG TY TNHH ABC',
          position: 'Nhân Viên Kinh Doanh',
          start_date: '2024-03',
          end_date: null,
          description:
            'Phụ trách mảng B2B, tìm kiếm khách hàng doanh nghiệp, tư vấn giải pháp phần mềm. Đạt 120% KPI quý liên tiếp. Quản lý pipeline 50+ khách hàng.',
        },
        {
          company: 'CÔNG TY CỔ PHẦN XYZ',
          position: 'Thực Tập Sinh Sales',
          start_date: '2023-06',
          end_date: '2024-02',
          description:
            'Hỗ trợ team sales gọi điện tư vấn khách hàng, cập nhật CRM, lập báo cáo tuần. Được đào tạo kỹ năng đàm phán và chốt sale.',
        },
      ],
    },
  },
];

export default function AIScoreModal({ jobs, isOpen, onClose, onScored }) {
  const [mode, setMode] = useState('preset'); // 'preset' | 'upload'
  const [selectedCvId, setSelectedCvId] = useState('');
  const [uploadedText, setUploadedText] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState(null);
  const [scores, setScores] = useState(null);
  const fileRef = useRef(null);

  if (!isOpen) return null;

  const buildJobsPayload = () =>
    jobs.map((j) => ({
      job_id: j.id,
      job_title: j.title,
      skills: j.tags || [],
      min_experience_years: mapExpToYears(j.experienceEnum),
      experience_level: j.experienceEnum,
      job_description: j.detail
        ? 'Mô tả: ' +
          (j.detail.mo_ta_cong_viec || []).join('. ') +
          ' | Yêu cầu: ' +
          (j.detail.yeu_cau_ung_vien || []).join('. ') +
          ' | Quyền lợi: ' +
          (j.detail.quyen_loi || []).join('. ')
        : null,
      industry: j.category || null,
      work_mode: j.workModeEnum || null,
    }));

  /** Map experience enum → approximate years for comparison */
  function mapExpToYears(exp) {
    if (!exp) return 0;
    switch (exp) {
      case 'INTERN':
        return 0;
      case 'FRESHER':
        return 0.5;
      case 'JUNIOR':
        return 1;
      case 'MID':
        return 3;
      case 'SENIOR':
        return 5;
      case 'LEAD':
        return 7;
      default:
        return 0;
    }
  }

  const BATCH_SIZE = 10; // batch nhỏ = ít tokens = nhanh + ổn định
  const MAX_CONCURRENCY = 2; // tối đa 2 batch chạy song song (tránh rate limit DeepSeek)
  const MAX_RETRIES = 2; // retry mỗi batch tối đa 2 lần nếu fail

  /** Retry 1 hàm async với backoff */
  async function withRetry(fn, retries = MAX_RETRIES) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (attempt === retries) throw err;
        const wait = 5000 * (attempt + 1); // 5s, 10s
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }

  /** Chạy các batch với giới hạn concurrency */
  async function runBatchesConcurrent(batchFns, limit) {
    const results = [];
    const executing = new Set();
    for (const fn of batchFns) {
      const p = fn().then(
        (r) => {
          executing.delete(p);
          return { status: 'fulfilled', value: r };
        },
        (e) => {
          executing.delete(p);
          return { status: 'rejected', reason: e };
        },
      );
      executing.add(p);
      results.push(p);
      if (executing.size >= limit) {
        await Promise.race(executing);
      }
    }
    return Promise.all(results);
  }

  const handleScore = async () => {
    setLoading(true);
    setProgress({ current: 0, total: 0 });
    setError(null);
    setScores(null);
    try {
      let cv;
      let cvName = '';
      if (mode === 'preset') {
        const found = PRE_EXTRACTED_CVS.find((c) => c.id === selectedCvId);
        if (!found) throw new Error('Vui lòng chọn CV');
        cv = found.cv;
        cvName = found.name;
      } else {
        if (!uploadedText.trim()) throw new Error('Vui lòng tải lên CV');
        // Extract CV first, then score
        const extractRes = await recommendationService.extractCv(uploadedText);
        cv = extractRes?.data?.extracted;
        cvName = fileName || 'Uploaded CV';
        if (!cv) throw new Error('Không thể trích xuất CV. Vui lòng thử lại.');
      }

      const allJobs = buildJobsPayload();
      const totalJobs = allJobs.length;
      setProgress({ current: 0, total: totalJobs });

      // Chia jobs thành các batch
      const batches = [];
      for (let i = 0; i < allJobs.length; i += BATCH_SIZE) {
        batches.push(allJobs.slice(i, i + BATCH_SIZE));
      }

      // Chạy batch với concurrency giới hạn + retry tự động
      let completedJobs = 0;
      const results = await runBatchesConcurrent(
        batches.map((batch) => async () => {
          const res = await withRetry(() => recommendationService.scoreJobs(cv, batch));
          completedJobs += batch.length;
          setProgress({ current: completedJobs, total: totalJobs });
          return res;
        }),
        MAX_CONCURRENCY,
      );

      // Merge kết quả từ tất cả batch
      const scoreMap = {};
      let batchErrors = 0;
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          const aiScores = result.value?.data?.scores || [];
          for (const s of aiScores) {
            scoreMap[s.job_id] = s;
          }
        } else {
          batchErrors++;
          console.warn(`Batch ${idx + 1} failed:`, result.reason?.message);
        }
      });

      // Update scores realtime
      setScores({ ...scoreMap });

      if (Object.keys(scoreMap).length === 0) {
        throw new Error('Tất cả batch đều thất bại. Kiểm tra backend và DEEPSEEK_API_KEY.');
      }
      if (batchErrors > 0) {
        console.warn(
          `${batchErrors} batch thất bại, đã chấm được ${Object.keys(scoreMap).length}/${totalJobs} việc làm`,
        );
      }
      onScored?.(scoreMap, cvName);
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('timeout') || msg.includes('exceeded')) {
        setError(
          'Quá thời gian chờ. DeepSeek đang xử lý quá nhiều — thử lại với ít jobs hơn (filter thêm).',
        );
      } else if (msg.includes('Network')) {
        setError('Không kết nối được backend. Đảm bảo backend đang chạy (port 5000).');
      } else {
        setError(msg || 'Lỗi khi chấm điểm');
      }
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);

    try {
      let text = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // Parse PDF with pdfjs-dist (runs in browser, no backend needed)
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(' ') + '\n';
        }
      } else {
        // .txt / .doc — read as text
        text = await file.text();
      }
      if (!text.trim()) {
        setError('Không thể trích xuất text từ file. Hãy thử file khác (.pdf, .txt).');
        return;
      }
      setUploadedText(text.slice(0, 8000));
    } catch (err) {
      setError(`Lỗi đọc file: ${err.message}. Hãy thử file PDF hoặc TXT khác.`);
    }
  };

  const close = () => {
    setScores(null);
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-12 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="relative w-full max-w-2xl animate-fade-in rounded-2xl bg-white shadow-elevated">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary">
              <Icon name="sparkles" size={22} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-ink">AI Matching</h2>
              <p className="text-sm text-ink-soft">
                Chấm điểm {jobs.length} việc làm với CV bằng DeepSeek AI
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-slate-100"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {scores ? (
            /* === RESULTS === */
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-ink">
                  Kết quả chấm điểm ({Object.keys(scores).length}/{jobs.length} việc làm)
                </h3>
                {Object.keys(scores).length < jobs.length && (
                  <p className="text-xs text-amber-600">
                    ⚠ Chấm được {Object.keys(scores).length}/{jobs.length} — một số batch bị lỗi,
                    thử lại sau nếu cần đủ.
                  </p>
                )}
                <button
                  onClick={() => {
                    // Save to localStorage + call save API
                    const flatScores = {};
                    for (const [jid, s] of Object.entries(scores)) {
                      flatScores[jid] = s.ai || s.sql;
                    }
                    recommendationService
                      .saveScores({
                        cvId: selectedCvId || 'upload',
                        cvName:
                          PRE_EXTRACTED_CVS.find((c) => c.id === selectedCvId)?.name ||
                          fileName ||
                          'CV',
                        scores: flatScores,
                        jobs: jobs.map((j) => ({ id: j.id, title: j.title })),
                      })
                      .catch(() => {});
                    close();
                  }}
                  className="btn-primary px-4 py-2 text-sm"
                >
                  <Icon name="check" size={16} />
                  Lưu kết quả
                </button>
              </div>
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {[...jobs]
                  .map((j) => ({ job: j, score: scores[j.id] }))
                  .filter(
                    (x) =>
                      x.score && x.score.match_score !== null && x.score.match_score !== undefined,
                  )
                  .sort((a, b) => (b.score.match_score ?? 0) - (a.score.match_score ?? 0))
                  .map(({ job, score }) => (
                    <div
                      key={job.id}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 p-3"
                    >
                      <ScoreBadge score={score.match_score} label="Điểm AI" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-ink">{job.title}</p>
                        <p className="truncate text-xs text-ink-muted">{job.company.name}</p>
                        {score.recommendation_reason && (
                          <p className="mt-0.5 text-xs text-ink-soft line-clamp-2">
                            {score.recommendation_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              <button onClick={close} className="btn-secondary mt-5 w-full">
                <Icon name="close" size={18} />
                Đóng
              </button>
            </div>
          ) : (
            /* === CV SELECTION === */
            <>
              {/* Mode toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('preset')}
                  className={cn(
                    'flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
                    mode === 'preset'
                      ? 'border-primary bg-primary-50 text-primary'
                      : 'border-slate-200 text-ink-soft hover:border-primary/50',
                  )}
                >
                  CV đã trích xuất
                </button>
                <button
                  onClick={() => setMode('upload')}
                  className={cn(
                    'flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors',
                    mode === 'upload'
                      ? 'border-primary bg-primary-50 text-primary'
                      : 'border-slate-200 text-ink-soft hover:border-primary/50',
                  )}
                >
                  Tải lên CV mới
                </button>
              </div>

              {mode === 'preset' ? (
                <div className="space-y-2">
                  {PRE_EXTRACTED_CVS.map((c) => (
                    <label
                      key={c.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors',
                        selectedCvId === c.id
                          ? 'border-primary bg-primary-50'
                          : 'border-slate-200 hover:border-primary/50',
                      )}
                    >
                      <input
                        type="radio"
                        name="presetCv"
                        checked={selectedCvId === c.id}
                        onChange={() => setSelectedCvId(c.id)}
                        className="h-4 w-4 text-primary"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink">{c.name}</p>
                        <p className="text-xs text-ink-muted">
                          Skills: {c.cv.skills.join(', ')} · {c.cv.experience_years} năm KN
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-8 transition-colors hover:border-primary/50">
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".txt,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {fileName ? (
                      <>
                        <Icon name="fileText" size={32} className="text-primary" />
                        <p className="mt-2 text-sm font-medium text-ink">{fileName}</p>
                        <p className="text-xs text-ink-muted">{uploadedText.length} ký tự</p>
                      </>
                    ) : (
                      <>
                        <Icon name="upload" size={32} className="text-ink-muted" />
                        <p className="mt-2 text-sm font-medium text-ink">Tải lên CV (.txt, .pdf)</p>
                        <p className="mt-0.5 text-xs text-ink-muted">
                          CV sẽ được AI trích xuất tự động trước khi chấm điểm
                        </p>
                      </>
                    )}
                  </label>
                </div>
              )}

              {/* Info note */}
              <div className="rounded-xl bg-primary-50 px-4 py-3 text-xs text-ink-soft">
                <p className="flex items-center gap-1.5 font-semibold text-primary">
                  <Icon name="sparkles" size={14} />
                  Sẽ chấm {jobs.length} việc làm
                </p>
                <p className="mt-1">
                  Mỗi lần chấm điểm được ghi log (prompt, response, thời gian) vào trang{' '}
                  <span className="font-medium">AI Logs</span> để theo dõi và cải thiện prompt.
                </p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              {/* Actions */}
              <button
                onClick={handleScore}
                disabled={
                  loading ||
                  (mode === 'preset' && !selectedCvId) ||
                  (mode === 'upload' && !uploadedText)
                }
                className="btn-primary w-full"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang chấm điểm
                    {progress.total > 0
                      ? ` — đang xử lý ${progress.current}/${progress.total} việc làm...`
                      : '...'}
                  </>
                ) : (
                  <>
                    <Icon name="sparkles" size={18} />
                    Chấm điểm với AI )
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score, label, variant }) {
  const s10 = Math.round(score ?? 0) / 10;
  const color =
    variant === 'sql'
      ? s10 >= 8
        ? 'bg-teal-600'
        : s10 >= 6
          ? 'bg-teal-500'
          : s10 >= 4
            ? 'bg-amber-500'
            : 'bg-slate-400'
      : s10 >= 8
        ? 'bg-green-500'
        : s10 >= 6
          ? 'bg-primary'
          : s10 >= 4
            ? 'bg-amber-500'
            : 'bg-slate-400';
  return (
    <div className="flex shrink-0 flex-col items-center gap-0.5">
      <span
        className={cn(
          'grid h-11 w-11 place-items-center rounded-xl text-sm font-bold text-white',
          color,
        )}
      >
        {s10}
      </span>
      {label && <span className="text-[9px] font-semibold text-ink-muted">{label}</span>}
    </div>
  );
}
