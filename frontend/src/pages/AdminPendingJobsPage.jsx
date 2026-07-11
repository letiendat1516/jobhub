import { useEffect, useState } from 'react';

import jobService from '../services/jobService.js';

const getJobId = (job) => job.job_id || job.id;

const getJobTitle = (job) => job.job_title || job.title || 'Tin tuyển dụng chưa có tiêu đề';

export default function AdminPendingJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await jobService.getPendingReviewJobs();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
          ? data.items
          : [];

      setJobs(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Không thể tải danh sách tin chờ duyệt.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const moderate = async (jobId, decision) => {
    const label = decision === 'Approved' ? 'duyệt' : 'từ chối';
    const ok = window.confirm(`Bạn có chắc muốn ${label} tin tuyển dụng này không?`);

    if (!ok) return;

    try {
      await jobService.moderateJob(jobId, decision);
      await loadJobs();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          err.message ||
          'Không thể xử lý tin tuyển dụng.',
      );
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-28">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
        Duyệt tin tuyển dụng
      </p>

      <h1 className="mt-2 text-3xl font-bold text-slate-900">
        Danh sách tin chờ duyệt
      </h1>

      <p className="mt-2 text-slate-500">
        Quản trị viên có thể duyệt hoặc từ chối các tin tuyển dụng do nhà tuyển dụng gửi lên.
      </p>

      {loading ? (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-slate-500">
          Đang tải danh sách tin chờ duyệt...
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
          {error}
        </div>
      ) : null}

      {!loading && !error && jobs.length === 0 ? (
        <div className="mt-6 rounded-2xl border bg-white p-8 text-center text-slate-500">
          Không có tin tuyển dụng nào đang chờ duyệt.
        </div>
      ) : null}

      <div className="mt-6 space-y-4">
        {jobs.map((job) => {
          const jobId = getJobId(job);

          return (
            <div
              key={jobId}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {getJobTitle(job)}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    {job.employer?.company_name || 'Chưa rõ công ty'} •{' '}
                    {job.location || 'Chưa cập nhật địa điểm'}
                  </p>

                  <p className="mt-3 text-sm">
                    Trạng thái:{' '}
                    <span className="font-semibold text-blue-700">
                      Chờ duyệt
                    </span>
                  </p>

                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                    {job.job_description || job.description || 'Chưa có mô tả công việc.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => moderate(jobId, 'Approved')}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    Duyệt
                  </button>

                  <button
                    type="button"
                    onClick={() => moderate(jobId, 'Rejected')}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}