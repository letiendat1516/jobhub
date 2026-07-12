import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ApplicationStatusBadge from '../components/application/ApplicationStatusBadge.jsx';
import StatusHistoryTimeline from '../components/application/StatusHistoryTimeline.jsx';
import applicationService from '../services/applicationService.js';

const date = (value) => new Date(value).toLocaleDateString('vi-VN');

export default function MyApplicationsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [filters, setFilters] = useState({ page: 1, status: '', keyword: '', sort: 'newest' });
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setState('loading');
    applicationService
      .getMyApplications(filters)
      .then((r) => {
        if (active) {
          setItems(r.data);
          setMeta(r.meta);
          setState('ready');
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setState('error');
        }
      });
    return () => {
      active = false;
    };
  }, [filters]);
  return (
    <main className="container-page py-12">
      <div className="mb-8">
        <p className="eyebrow">Ứng viên</p>
        <h1 className="mt-3 text-3xl font-bold">Hồ sơ đã ứng tuyển</h1>
        <p className="mt-2 text-ink-soft">{meta.total} hồ sơ</p>
      </div>
      <div className="mb-6 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-3">
        <input
          aria-label="Tìm công việc"
          placeholder="Tên công việc hoặc công ty"
          value={filters.keyword}
          onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value, page: 1 }))}
          className="rounded-xl border p-3 text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
          className="rounded-xl border p-3 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="SUBMITTED">Đã nộp</option>
          <option value="UNDER_REVIEW">Đang xem xét</option>
          <option value="ACCEPTED">Đã chấp nhận</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
          className="rounded-xl border p-3 text-sm"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
      </div>
      {state === 'loading' && <p className="text-ink-muted">Đang tải hồ sơ...</p>}
      {state === 'error' && <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {state === 'ready' && items.length === 0 && (
        <div className="card p-10 text-center">
          <h2 className="text-xl font-bold">Bạn chưa có hồ sơ phù hợp bộ lọc.</h2>
          <Link to="/viec-lam" className="btn-primary mt-5">
            Khám phá việc làm
          </Link>
        </div>
      )}
      <div className="space-y-4">
        {items.map((item) => (
          <Link
            key={item.application_id}
            to={`/applications/${item.application_id}`}
            className="card block p-5 transition hover:border-primary"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">{item.job?.job_title}</h2>
                <p className="text-sm text-ink-soft">{item.job?.employer?.company_name}</p>
                <p className="mt-2 text-xs text-ink-muted">
                  Nộp ngày {date(item.application_date)} · CV:{' '}
                  {item.resume?.title || item.resume?.file_name || 'Không còn khả dụng'}
                </p>
              </div>
              <ApplicationStatusBadge status={item.status} />
            </div>
          </Link>
        ))}
      </div>
      {meta.total > meta.limit && (
        <div className="mt-8 flex justify-center gap-3">
          <button
            disabled={filters.page === 1}
            onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
            className="btn-secondary"
          >
            Trước
          </button>
          <span className="p-3 text-sm">Trang {filters.page}</span>
          <button
            disabled={filters.page * meta.limit >= meta.total}
            onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
            className="btn-secondary"
          >
            Sau
          </button>
        </div>
      )}
    </main>
  );
}

export function MyApplicationDetailPage() {
  const { applicationId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    applicationService
      .getMyApplication(applicationId)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.message));
  }, [applicationId]);
  if (error)
    return (
      <main className="container-page py-16">
        <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
      </main>
    );
  if (!data) return <main className="container-page py-16">Đang tải...</main>;
  return (
    <main className="container-page py-12">
      <Link to="/applications" className="text-sm font-semibold text-primary">
        ← Hồ sơ đã ứng tuyển
      </Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="card p-6">
          <div className="flex justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{data.job?.job_title}</h1>
              <p className="text-ink-soft">{data.job?.employer?.company_name}</p>
            </div>
            <ApplicationStatusBadge status={data.status} />
          </div>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-muted">Ngày ứng tuyển</dt>
              <dd>{date(data.application_date)}</dd>
            </div>
            <div>
              <dt className="text-ink-muted">CV đã dùng</dt>
              <dd>{data.resume?.title || data.resume?.file_name || 'Không còn khả dụng'}</dd>
            </div>
          </dl>
          <h2 className="mt-8 font-bold">Thư giới thiệu</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">
            {data.cover_letter || 'Không có thư giới thiệu.'}
          </p>
        </section>
        <aside className="card p-6">
          <h2 className="mb-5 text-lg font-bold">Lịch sử trạng thái</h2>
          <StatusHistoryTimeline application={data} history={data.history} />
        </aside>
      </div>
    </main>
  );
}
