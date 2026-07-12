import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ApplicationStatusBadge, {
  applicationStatusLabels,
} from '../components/application/ApplicationStatusBadge.jsx';
import StatusHistoryTimeline from '../components/application/StatusHistoryTimeline.jsx';
import applicationService from '../services/applicationService.js';

export default function EmployerApplicationsPage() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [filters, setFilters] = useState({
    page: 1,
    status: '',
    candidateName: '',
    sort: 'newest',
  });
  const [error, setError] = useState('');
  useEffect(() => {
    applicationService
      .getEmployerApplications(filters)
      .then((r) => {
        setItems(r.data);
        setMeta(r.meta);
      })
      .catch((e) => setError(e.message));
  }, [filters]);
  return (
    <main className="container-page py-12">
      <p className="eyebrow">Nhà tuyển dụng</p>
      <h1 className="mt-3 text-3xl font-bold">Hồ sơ ứng tuyển</h1>
      <p className="mt-2 text-ink-soft">{meta.total} hồ sơ đã nhận</p>
      <div className="my-6 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-3">
        <input
          placeholder="Tên ứng viên"
          value={filters.candidateName}
          onChange={(e) => setFilters((f) => ({ ...f, candidateName: e.target.value, page: 1 }))}
          className="rounded-xl border p-3 text-sm"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
          className="rounded-xl border p-3 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(applicationStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
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
      {error && <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {!error && items.length === 0 && (
        <div className="card p-10 text-center">Chưa nhận được hồ sơ ứng tuyển nào.</div>
      )}
      <div className="space-y-3">
        {items.map((item) => (
          <Link
            className="card grid gap-3 p-5 hover:border-primary md:grid-cols-[1fr_1fr_auto]"
            to={`/employer/applications/${item.application_id}`}
            key={item.application_id}
          >
            <div>
              <p className="font-bold">{item.candidate?.full_name}</p>
              <p className="text-sm text-ink-soft">
                {item.candidate?.headline || 'Chưa có tiêu đề'}
              </p>
            </div>
            <div>
              <p className="font-semibold">{item.job?.job_title}</p>
              <p className="text-xs text-ink-muted">
                {new Date(item.application_date).toLocaleString('vi-VN')}
              </p>
            </div>
            <ApplicationStatusBadge status={item.status} />
          </Link>
        ))}
      </div>
    </main>
  );
}

export function EmployerApplicationReviewPage() {
  const { applicationId } = useParams();
  const [data, setData] = useState(null);
  const [next, setNext] = useState('');
  const [error, setError] = useState('');
  const load = () =>
    applicationService
      .reviewApplication(applicationId)
      .then((r) => {
        setData(r.data);
        setNext('');
      })
      .catch((e) => setError(e.message));
  useEffect(load, [applicationId]);
  const update = async () => {
    if (!next) return;
    try {
      await applicationService.updateStatus(applicationId, {
        status: next,
        expectedCurrentStatus: data.status,
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  if (error && !data)
    return (
      <main className="container-page py-16">
        <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>
      </main>
    );
  if (!data) return <main className="container-page py-16">Đang tải...</main>;
  return (
    <main className="container-page py-12">
      <Link to="/employer/applications" className="text-sm font-semibold text-primary">
        ← Danh sách hồ sơ
      </Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="space-y-6">
          <div className="card p-6">
            <div className="flex justify-between">
              <div>
                <h1 className="text-2xl font-bold">{data.candidate?.full_name}</h1>
                <p className="text-ink-soft">{data.candidate?.headline}</p>
              </div>
              <ApplicationStatusBadge status={data.status} />
            </div>
            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-ink-muted">Vị trí</dt>
                <dd>{data.job?.job_title}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Địa điểm</dt>
                <dd>{data.candidate?.city || 'Chưa cập nhật'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">CV</dt>
                <dd>{data.resume?.file_name || 'Không còn khả dụng'}</dd>
              </div>
              <div>
                <dt className="text-ink-muted">Ngày nộp</dt>
                <dd>{new Date(data.application_date).toLocaleString('vi-VN')}</dd>
              </div>
            </dl>
            <h2 className="mt-7 font-bold">Thư giới thiệu</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">
              {data.cover_letter || 'Không có.'}
            </p>
          </div>
          <div className="card p-6">
            <h2 className="font-bold">Thông tin phù hợp</h2>
            {data.job_recommendation?.[0] ? (
              <>
                <p className="mt-3 text-3xl font-bold text-primary">
                  {data.job_recommendation[0].match_score}%
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  {data.job_recommendation[0].recommendation_reason}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">Thông tin phù hợp hiện chưa có.</p>
            )}
          </div>
        </section>
        <aside className="space-y-6">
          <div className="card p-6">
            <h2 className="font-bold">Cập nhật trạng thái</h2>
            {data.allowedTransitions.length ? (
              <>
                <select
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  className="mt-4 w-full rounded-xl border p-3"
                >
                  <option value="">Chọn trạng thái</option>
                  {data.allowedTransitions.map((s) => (
                    <option key={s} value={s}>
                      {applicationStatusLabels[s]}
                    </option>
                  ))}
                </select>
                <button onClick={update} disabled={!next} className="btn-primary mt-3 w-full">
                  Cập nhật
                </button>
              </>
            ) : (
              <p className="mt-3 text-sm text-ink-muted">Trạng thái này là trạng thái cuối.</p>
            )}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </div>
          <div className="card p-6">
            <h2 className="mb-5 font-bold">Lịch sử trạng thái</h2>
            <StatusHistoryTimeline application={data} history={data.history} />
          </div>
        </aside>
      </div>
    </main>
  );
}
