import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Icon from '../components/ui/Icon.jsx';
import JobListItem from '../components/job/JobListItem.jsx';
import { cn } from '../utils/cn.js';
import { loadSessions, clearSessions } from '../utils/aiScores.js';

/**
 * RecommendedPage — danh sách phiên chấm điểm AI/SQL.
 *
 * Mỗi phiên (session) = 1 lần chấm điểm. Hiển thị dạng list:
 *   - Click vào phiên → expand → xem rank job chi tiết
 *   - Xoá từng phiên hoặc tất cả
 *
 * Route: /de-xuat
 */
export default function RecommendedPage() {
  const [sessions, setSessions] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setSessions(loadSessions());
  }, [reloadKey]);

  const handleClearAll = () => {
    if (confirm('Xoá toàn bộ phiên chấm điểm?')) {
      clearSessions();
      setReloadKey((k) => k + 1);
    }
  };

  return (
    <div className="bg-canvas pt-18">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-xs text-ink-muted">
          <Link to="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">Đề xuất việc làm</span>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-ink sm:text-3xl">
              <Icon name="sparkles" size={28} className="text-primary" />
              Đề xuất việc làm
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              {sessions.length > 0
                ? `${sessions.length} phiên chấm điểm. Bấm vào phiên để xem chi tiết.`
                : 'Các phiên chấm điểm AI/SQL sẽ xuất hiện ở đây.'}
            </p>
          </div>
          {sessions.length > 0 && (
            <button onClick={handleClearAll} className="btn-secondary shrink-0 px-4 py-2 text-sm">
              <Icon name="close" size={16} />
              Xoá tất cả
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="card flex flex-col items-center justify-center px-6 py-20 text-center">
            <span className="mb-4 grid h-20 w-20 place-items-center rounded-full bg-primary-50">
              <Icon name="sparkles" size={36} className="text-primary" />
            </span>
            <h3 className="text-xl font-bold text-ink">Chưa có phiên chấm điểm nào</h3>
            <p className="mt-2 max-w-md text-sm text-ink-soft">
              Truy cập trang việc làm, filter xuống ≤100 jobs, rồi bấm{' '}
              <strong className="text-primary">AI Matching</strong> để AI chấm điểm phù hợp. Mỗi lần
              chấm sẽ tạo 1 phiên lưu ở đây.
            </p>
            <Link to="/viec-lam" className="btn-primary mt-6">
              <Icon name="search" size={18} />
              Đi tới việc làm
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const avgScore = Object.keys(session.scores).length
                ? Math.round(
                    Object.values(session.scores).reduce(
                      (s, sd) => s + (sd.match_score ?? sd.ai?.match_score ?? 0),
                      0,
                    ) / Object.keys(session.scores).length,
                  )
                : 0;

              return (
                <article key={session.id} className="card overflow-hidden">
                  {/* Session header */}
                  <button
                    onClick={() => navigate(`/de-xuat/${session.id}`)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary">
                      <Icon name="sparkles" size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink">{session.cvName}</span>
                        <MethodBadge method={session.method} />
                      </div>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {new Date(session.scoredAt).toLocaleString('vi-VN')} · {session.jobCount}{' '}
                        việc làm · Điểm TB: {(avgScore / 10).toFixed(1)}/10
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-primary hover:underline">
                      Xem chi tiết
                    </span>
                    <Icon name="arrowRight" size={18} className="shrink-0 text-ink-muted" />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MethodBadge({ method }) {
  const colors = {
    ai: 'bg-primary-50 text-primary',
    sql: 'bg-teal-50 text-teal-600',
    both: 'bg-violet-50 text-violet-600',
  };
  const labels = { ai: 'AI', sql: 'SQL', both: 'AI + SQL' };
  return (
    <span
      className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', colors[method] || colors.ai)}
    >
      {labels[method] || method}
    </span>
  );
}

/**
 * SessionDetailPage — trang chi tiết 1 phiên chấm điểm.
 * Route: /de-xuat/:sessionId
 * Hiển thị jobs dạng list giống trang /viec-lam (JobListItem + ApplyModal).
 */
export function SessionDetailPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const session = loadSessions().find((s) => s.id === sessionId);

  if (!session) {
    return (
      <div className="bg-canvas pt-18">
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <Icon name="close" size={32} className="mx-auto mb-3 text-ink-muted" />
          <h2 className="text-lg font-bold text-ink">Không tìm thấy phiên</h2>
          <button onClick={() => navigate('/de-xuat')} className="btn-secondary mt-4">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // Build sorted job list
  const scoredJobs = Object.entries(session.scores)
    .map(([jobId, scoreData]) => {
      const job = session.jobs?.[jobId];
      if (!job) return null;
      return { ...job, scoreData };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const aScore = a.scoreData?.match_score ?? a.scoreData?.ai?.match_score ?? 0;
      const bScore = b.scoreData?.match_score ?? b.scoreData?.ai?.match_score ?? 0;
      return bScore - aScore;
    });

  const avgScore = scoredJobs.length
    ? Math.round(
        scoredJobs.reduce(
          (s, j) => s + (j.scoreData?.match_score ?? j.scoreData?.ai?.match_score ?? 0),
          0,
        ) / scoredJobs.length,
      )
    : 0;
  const highMatch = scoredJobs.filter(
    (j) => (j.scoreData?.match_score ?? j.scoreData?.ai?.match_score ?? 0) >= 70,
  ).length;

  return (
    <div className="bg-canvas pt-18">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-xs text-ink-muted">
          <Link to="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <span className="mx-1.5">/</span>
          <Link to="/de-xuat" className="hover:text-primary">
            Đề xuất
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">{session.cvName}</span>
        </nav>

        {/* Back button */}
        <button
          onClick={() => navigate('/de-xuat')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-primary"
        >
          <Icon name="arrowLeft" size={16} />
          Tất cả phiên
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{session.cvName}</h1>
            <MethodBadge method={session.method} />
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            {new Date(session.scoredAt).toLocaleString('vi-VN')}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="card p-4">
            <p className="text-lg font-bold text-ink">{scoredJobs.length}</p>
            <p className="text-xs text-ink-muted">Việc làm</p>
          </div>
          <div className="card p-4">
            <p className="text-lg font-bold text-primary">{(avgScore / 10).toFixed(1)}</p>
            <p className="text-xs text-ink-muted">Điểm TB</p>
          </div>
          <div className="card p-4">
            <p className="text-lg font-bold text-green-600">{highMatch}</p>
            <p className="text-xs text-ink-muted">Phù hợp cao (≥70)</p>
          </div>
        </div>

        <p className="mb-4 flex items-center gap-1.5 text-sm text-ink-muted">
          <Icon name="trendingUp" size={16} />
          Xếp hạng theo độ phù hợp (cao → thấp)
        </p>

        {/* Job list — dùng JobListItem giống trang /viec-lam */}
        <div className="space-y-3">
          {scoredJobs.map((job) => (
            <JobListItem key={job.id} job={job} score={job.scoreData} />
          ))}
        </div>
      </div>
    </div>
  );
}
