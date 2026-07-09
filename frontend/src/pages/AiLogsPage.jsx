import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Icon from '../components/ui/Icon.jsx';
import recommendationService from '../services/recommendationService.js';
import { cn } from '../utils/cn.js';

/**
 * AiLogsPage — bảng ghi log huấn luyện prompt AI.
 *
 * Hiển thị: prompt, response, thời gian xử lý, timestamp.
 * Data từ GET /api/recommendations/logs (đọc ai-lab/logs/*.json).
 *
 * Route: /ai-logs
 */
export default function AiLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filterTask, setFilterTask] = useState('all');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await recommendationService.getAiLogs(100);
        // apiClient interceptor already unwraps response.data,
        // so res = { success, data: [...logs] }
        setLogs(res?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Không tải được logs');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const tasks = ['all', ...new Set(logs.map((l) => l.task))];
  const filtered = filterTask === 'all' ? logs : logs.filter((l) => l.task === filterTask);

  const stats = {
    total: logs.length,
    success: logs.filter((l) => l.success).length,
    avgTime: logs.length
      ? Math.round(logs.reduce((s, l) => s + (l.processing_time_ms || 0), 0) / logs.length)
      : 0,
    totalTokens: logs.reduce((s, l) => s + (l.tokens_in || 0) + (l.tokens_out || 0), 0),
  };

  return (
    <div className="bg-canvas pt-18">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-xs text-ink-muted">
          <Link to="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">AI Logs</span>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink sm:text-3xl">
            <Icon name="sparkles" size={28} className="text-primary" />
            AI Prompt Logs
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Nhật ký gọi DeepSeek AI — ghi prompt, response, thời gian xử lý để theo dõi và cải thiện
            prompt.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Tổng lượt gọi" value={stats.total} icon="sparkles" />
          <StatCard
            label="Thành công"
            value={stats.success}
            icon="checkCircle"
            color="text-green-600"
          />
          <StatCard label="TB thời gian" value={`${stats.avgTime}ms`} icon="clock" />
          <StatCard label="Tổng tokens" value={stats.totalTokens.toLocaleString()} icon="bolt" />
        </div>

        {/* Filter */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-ink-soft">Lọc theo task:</span>
          {tasks.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTask(t)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                filterTask === t
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-ink-soft hover:bg-slate-200',
              )}
            >
              {t === 'all' ? 'Tất cả' : t}
            </button>
          ))}
        </div>

        {/* Logs list */}
        {loading ? (
          <div className="card flex items-center justify-center py-16">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-3 text-sm text-ink-soft">Đang tải logs...</span>
          </div>
        ) : error ? (
          <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-red-50">
              <Icon name="close" size={26} className="text-red-500" />
            </span>
            <h3 className="text-lg font-bold text-ink">Không tải được logs</h3>
            <p className="mt-1 max-w-md text-sm text-ink-soft">{error}</p>
            <p className="mt-3 text-xs text-ink-muted">
              Đảm bảo backend đang chạy (port 5000) và đã có file log trong{' '}
              <code>ai-lab/logs/</code>.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
            <span className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-slate-100">
              <Icon name="fileText" size={28} className="text-ink-muted" />
            </span>
            <h3 className="text-lg font-bold text-ink">Chưa có log nào</h3>
            <p className="mt-1 max-w-md text-sm text-ink-soft">
              Hãy dùng tính năng <strong>AI Matching</strong> trên trang{' '}
              <Link to="/viec-lam" className="text-primary underline">
                Việc làm
              </Link>{' '}
              để tạo log.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((log) => {
              const expanded = expandedId === log.log_id;
              return (
                <article key={log.log_id} className="card overflow-hidden">
                  {/* Header row */}
                  <button
                    onClick={() => setExpandedId(expanded ? null : log.log_id)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
                  >
                    <span
                      className={cn(
                        'grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-bold',
                        log.success ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600',
                      )}
                    >
                      <Icon name={log.success ? 'check' : 'close'} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-primary-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                          {log.task}
                        </span>
                        <span className="text-xs text-ink-muted">{log.model}</span>
                      </div>
                      <p className="mt-0.5 truncate text-sm text-ink-soft">
                        {new Date(log.timestamp).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-ink-muted">
                      <span>{log.processing_time_ms}ms</span>
                      <span>{(log.tokens_in || 0) + (log.tokens_out || 0)} tok</span>
                      <Icon
                        name="chevronDown"
                        size={16}
                        className={cn('transition-transform', expanded && 'rotate-180')}
                      />
                    </div>
                  </button>

                  {/* Expanded content */}
                  {expanded && (
                    <div className="border-t border-slate-100 px-5 py-4">
                      {log.error ? (
                        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                          Lỗi: {log.error}
                        </div>
                      ) : null}

                      {/* Prompt */}
                      <div className="mb-4">
                        <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">
                          Prompt
                        </h4>
                        <pre className="max-h-60 overflow-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
                          {log.prompt}
                        </pre>
                      </div>

                      {/* Response */}
                      {log.response && (
                        <div>
                          <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">
                            Response
                          </h4>
                          <pre className="max-h-60 overflow-auto rounded-lg bg-slate-100 p-3 text-xs leading-relaxed text-ink">
                            {log.response}
                          </pre>
                        </div>
                      )}

                      {/* Meta */}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-3 text-xs text-ink-muted">
                          <strong>Metadata:</strong> {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = 'text-primary' }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={cn('grid h-10 w-10 place-items-center rounded-xl bg-slate-50', color)}>
        <Icon name={icon} size={20} />
      </span>
      <div>
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="text-lg font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}
