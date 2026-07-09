import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Icon from '../components/ui/Icon.jsx';
import recommendationService from '../services/recommendationService.js';
import { cn } from '../utils/cn.js';

/**
 * AiStatsPage — admin dashboard for AI log statistics.
 *
 * Aggregates data from GET /api/recommendations/logs into charts/tables:
 * - Overview stats (total calls, success rate, avg time, tokens, est. cost)
 * - Breakdown by task type
 * - Calls over time (last 7 days bar chart)
 * - Slowest calls (for prompt optimization)
 * - Token usage distribution
 *
 * Route: /admin/ai-stats
 */
const DEEPSEEK_PRICE_PER_1M = {
  // DeepSeek pricing (USD per 1M tokens, approx)
  input: 0.27,
  output: 1.1,
};

export default function AiStatsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await recommendationService.getAiLogs(200);
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

  const stats = useMemo(() => computeStats(logs), [logs]);

  return (
    <div className="bg-canvas pt-18">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-4 text-xs text-ink-muted">
          <Link to="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-ink">Admin</span>
          <span className="mx-1.5">/</span>
          <span className="text-ink">AI Statistics</span>
        </nav>

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-ink sm:text-3xl">
              <Icon name="trendingUp" size={28} className="text-primary" />
              Thống kê AI Logs
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Phân tích hiệu năng DeepSeek AI — tổng quan, xu hướng, tối ưu prompt.
            </p>
          </div>
          <Link to="/ai-logs" className="btn-secondary shrink-0 px-4 py-2 text-sm">
            <Icon name="fileText" size={16} />
            Xem logs chi tiết
          </Link>
        </div>

        {loading ? (
          <div className="card flex items-center justify-center py-20">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="ml-3 text-sm text-ink-soft">Đang tải...</span>
          </div>
        ) : error ? (
          <div className="card px-6 py-16 text-center">
            <Icon name="close" size={32} className="mx-auto mb-3 text-red-500" />
            <p className="text-sm text-ink-soft">{error}</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="card px-6 py-16 text-center">
            <Icon name="sparkles" size={32} className="mx-auto mb-3 text-ink-muted" />
            <h3 className="text-lg font-bold text-ink">Chưa có dữ liệu</h3>
            <p className="mt-1 text-sm text-ink-soft">Hãy dùng AI Matching để tạo logs trước.</p>
          </div>
        ) : (
          <>
            {/* === Overview stats === */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard label="Tổng lượt gọi" value={stats.total} icon="sparkles" />
              <StatCard
                label="Success rate"
                value={`${stats.successRate}%`}
                icon="checkCircle"
                color="text-green-600"
              />
              <StatCard label="Avg time" value={`${stats.avgTime}ms`} icon="clock" />
              <StatCard
                label="Max time"
                value={`${stats.maxTime}ms`}
                icon="bolt"
                color="text-amber-600"
              />
              <StatCard
                label="Total tokens"
                value={stats.totalTokens.toLocaleString()}
                icon="fileText"
              />
              <StatCard
                label="Est. cost"
                value={`$${stats.estCost}`}
                icon="wallet"
                color="text-primary"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* === Breakdown by task === */}
              <section className="card p-5">
                <h2 className="mb-4 text-base font-bold text-ink">Phân tích theo task</h2>
                <div className="space-y-3">
                  {stats.byTask.map((t) => (
                    <div key={t.task}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-ink">{t.task}</span>
                        <span className="text-ink-muted">
                          {t.count} lượt · {t.avgTime}ms · {t.tokens} tok
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(t.count / stats.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* === Token distribution === */}
              <section className="card p-5">
                <h2 className="mb-4 text-base font-bold text-ink">Token usage</h2>
                <div className="space-y-4">
                  <TokenBar
                    label="Input tokens (prompt)"
                    value={stats.tokensIn}
                    total={stats.totalTokens}
                    color="bg-primary"
                  />
                  <TokenBar
                    label="Output tokens (response)"
                    value={stats.tokensOut}
                    total={stats.totalTokens}
                    color="bg-secondary"
                  />
                  <div className="border-t border-slate-100 pt-3 text-xs text-ink-muted">
                    Input: $
                    {((stats.tokensIn / 1_000_000) * DEEPSEEK_PRICE_PER_1M.input).toFixed(4)} ·
                    Output: $
                    {((stats.tokensOut / 1_000_000) * DEEPSEEK_PRICE_PER_1M.output).toFixed(4)}
                  </div>
                </div>
              </section>

              {/* === Calls over time (last 7 days) === */}
              <section className="card p-5">
                <h2 className="mb-4 text-base font-bold text-ink">Lượt gọi 7 ngày gần nhất</h2>
                <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
                  {stats.last7Days.map((d) => (
                    <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-primary/80 transition-all hover:bg-primary"
                        style={{
                          height: `${(d.count / stats.maxDayCount) * 100 || 2}%`,
                          minHeight: 4,
                        }}
                        title={`${d.date}: ${d.count} lượt`}
                      />
                      <span className="text-[10px] text-ink-muted">{d.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* === Slowest calls === */}
              <section className="card p-5">
                <h2 className="mb-4 text-base font-bold text-ink">
                  Top 5 chậm nhất (cần tối ưu prompt)
                </h2>
                <div className="space-y-2">
                  {stats.slowest.map((log, i) => (
                    <div
                      key={log.log_id}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-ink">{log.task}</p>
                        <p className="truncate text-[10px] text-ink-muted">
                          {new Date(log.timestamp).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 text-xs font-bold',
                          log.processing_time_ms > 30000 ? 'text-red-600' : 'text-amber-600',
                        )}
                      >
                        {log.processing_time_ms}ms
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---- helpers ----
function computeStats(logs) {
  const total = logs.length;
  const success = logs.filter((l) => l.success);
  const successRate = total ? Math.round((success.length / total) * 100) : 0;
  const times = logs.map((l) => l.processing_time_ms || 0);
  const tokensIn = logs.reduce((s, l) => s + (l.tokens_in || 0), 0);
  const tokensOut = logs.reduce((s, l) => s + (l.tokens_out || 0), 0);
  const totalTokens = tokensIn + tokensOut;

  // Group by task
  const taskMap = {};
  for (const l of logs) {
    if (!taskMap[l.task]) taskMap[l.task] = { count: 0, time: 0, tokens: 0 };
    taskMap[l.task].count++;
    taskMap[l.task].time += l.processing_time_ms || 0;
    taskMap[l.task].tokens += (l.tokens_in || 0) + (l.tokens_out || 0);
  }
  const byTask = Object.entries(taskMap).map(([task, v]) => ({
    task,
    count: v.count,
    avgTime: Math.round(v.time / v.count),
    tokens: v.tokens,
  }));

  // Last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = logs.filter((l) => l.timestamp?.slice(0, 10) === dateStr).length;
    days.push({
      date: dateStr,
      label: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
      count,
    });
  }
  const maxDayCount = Math.max(...days.map((d) => d.count), 1);

  // Slowest
  const slowest = [...logs]
    .sort((a, b) => (b.processing_time_ms || 0) - (a.processing_time_ms || 0))
    .slice(0, 5);

  // Estimated cost (USD)
  const estCost = (
    (tokensIn / 1_000_000) * DEEPSEEK_PRICE_PER_1M.input +
    (tokensOut / 1_000_000) * DEEPSEEK_PRICE_PER_1M.output
  ).toFixed(4);

  return {
    total,
    successRate,
    avgTime: times.length ? Math.round(times.reduce((s, t) => s + t, 0) / times.length) : 0,
    maxTime: times.length ? Math.max(...times) : 0,
    tokensIn,
    tokensOut,
    totalTokens,
    byTask,
    last7Days: days,
    maxDayCount,
    slowest,
    estCost,
  };
}

function StatCard({ label, value, icon, color = 'text-primary' }) {
  return (
    <div className="card p-4">
      <span className={cn('inline-block', color)}>
        <Icon name={icon} size={20} />
      </span>
      <p className="mt-2 text-lg font-bold text-ink">{value}</p>
      <p className="text-xs text-ink-muted">{label}</p>
    </div>
  );
}

function TokenBar({ label, value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-ink-soft">{label}</span>
        <span className="font-semibold text-ink">
          {value.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={cn('h-full rounded-full', color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
